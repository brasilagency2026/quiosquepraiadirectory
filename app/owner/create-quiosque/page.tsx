'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Waves, MapPin, Loader2 } from 'lucide-react'
import Link from 'next/link'

declare global {
  interface Window {
    google: any
  }
}

export default function CreateQuiosquePage() {
  const [name, setName] = useState('')
  const [beachName, setBeachName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const router = useRouter()

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    if (window.google?.maps?.places) {
      setGoogleLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setGoogleLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Initialize autocomplete
  useEffect(() => {
    if (!googleLoaded || !addressInputRef.current) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        componentRestrictions: { country: 'br' },
        types: ['establishment', 'geocode'],
      }
    )

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace()
      if (!place?.geometry?.location) return

      setLat(place.geometry.location.lat())
      setLng(place.geometry.location.lng())
      setAddress(place.formatted_address || '')

      // Extract city and state
      const components = place.address_components || []
      for (const comp of components) {
        if (comp.types.includes('administrative_area_level_2')) {
          setCity(comp.long_name)
        }
        if (comp.types.includes('administrative_area_level_1')) {
          setState(`${comp.long_name} (${comp.short_name})`)
        }
      }
    })
  }, [googleLoaded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Você precisa estar logado.')
      setLoading(false)
      return
    }

    // Create user profile if it doesn't exist
    await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      role: 'proprietario',
    }, { onConflict: 'id' })

    // Create quiosque
    const { data: quiosque, error: qError } = await supabase
      .from('quiosques')
      .insert({
        owner_id: user.id,
        name,
        beach_name: beachName,
        address,
        city,
        state,
        lat,
        lng,
        plan: 'free',
        status: 'active',
      })
      .select('id')
      .single()

    if (qError) {
      setError('Erro ao criar o quiosque. Tente novamente.')
      setLoading(false)
      return
    }

    // Link quiosque to user
    await supabase
      .from('users')
      .update({ quiosque_id: quiosque.id })
      .eq('id', user.id)

    router.push('/owner/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-amber-50 px-4 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="mb-8 text-center">
          <Waves className="mx-auto mb-3 h-10 w-10 text-cyan-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Cadastrar Quiosque
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha os dados básicos do seu quiosque
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome do quiosque *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Quiosque do Zé"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome da praia *
            </label>
            <input
              type="text"
              value={beachName}
              onChange={(e) => setBeachName(e.target.value)}
              required
              placeholder="Ex: Praia de Copacabana"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              <MapPin className="mr-1 inline h-4 w-4" />
              Endereço (busca Google Maps)
            </label>
            <input
              ref={addressInputRef}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Digite o endereço para buscar..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            {lat && lng && (
              <p className="mt-1 text-xs text-green-600">
                📍 Localização encontrada: {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            )}
          </div>

          {city && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cidade
                </label>
                <input
                  type="text"
                  value={city}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Estado
                </label>
                <input
                  type="text"
                  value={state}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Criando...' : 'Cadastrar Quiosque'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          <Link href="/owner/dashboard" className="text-cyan-600 hover:underline">
            Já tenho um quiosque
          </Link>
        </div>
      </div>
    </div>
  )
}
