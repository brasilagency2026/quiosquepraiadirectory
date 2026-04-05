'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProxyImageUrl } from '@/lib/utils'
import {
  Shield, Save, ArrowLeft, Upload, X, Loader2, MapPin,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Quiosque } from '@/types'
import { SERVICES_PREDEFINIS, ESPECIALIDADES_PREDEFINIDAS } from '@/types'

interface Props {
  quiosque: Quiosque
}

export default function AdminEditQuiosqueClient({ quiosque }: Props) {
  const router = useRouter()
  const addressInputRef = useRef<HTMLInputElement>(null)
  const [loading, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [googleLoaded, setGoogleLoaded] = useState(false)

  const [name, setName] = useState(quiosque.name)
  const [beachName, setBeachName] = useState(quiosque.beach_name || '')
  const [address, setAddress] = useState(quiosque.address || '')
  const [city, setCity] = useState(quiosque.city || '')
  const [state, setState] = useState(quiosque.state || '')
  const [lat, setLat] = useState(quiosque.lat)
  const [lng, setLng] = useState(quiosque.lng)
  const [description, setDescription] = useState(quiosque.description || '')
  const [operatingHours, setOperatingHours] = useState(quiosque.operating_hours || '')
  const [whatsapp, setWhatsapp] = useState(quiosque.whatsapp || '')
  const [phone, setPhone] = useState(quiosque.phone || '')
  const [instagram, setInstagram] = useState(quiosque.instagram || '')
  const [website, setWebsite] = useState(quiosque.website || '')
  const [services, setServices] = useState<string[]>(quiosque.services || [])
  const [specialties, setSpecialties] = useState<string[]>(quiosque.specialties || [])
  const [photos, setPhotos] = useState<string[]>(quiosque.photos || [])
  const [googlePlaceId, setGooglePlaceId] = useState(quiosque.google_place_id || '')

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

  useEffect(() => {
    if (!googleLoaded || !addressInputRef.current) return
    const autocomplete = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      { componentRestrictions: { country: 'br' }, types: ['establishment', 'geocode'] }
    )
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place?.geometry?.location) return
      setLat(place.geometry.location.lat())
      setLng(place.geometry.location.lng())
      setAddress(place.formatted_address || '')
      if (place.place_id) setGooglePlaceId(place.place_id)
      const components = place.address_components || []
      for (const comp of components) {
        if (comp.types.includes('administrative_area_level_2')) setCity(comp.long_name)
        if (comp.types.includes('administrative_area_level_1'))
          setState(`${comp.long_name} (${comp.short_name})`)
      }
    })
  }, [googleLoaded])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || photos.length >= 10) return
    setUploading(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setPhotos((prev) => [...prev, data.url])
      } else {
        setError(data.error || 'Erro ao fazer upload')
      }
    } catch {
      setError('Erro ao fazer upload da imagem')
    }
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleService = (service: string) => {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  const toggleSpecialty = (specialty: string) => {
    setSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/edit-quiosque/${quiosque.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          beach_name: beachName,
          address,
          city,
          state,
          lat,
          lng,
          description,
          operating_hours: operatingHours,
          whatsapp,
          phone,
          instagram,
          website,
          services,
          specialties,
          photos,
          google_place_id: googlePlaceId,
        }),
      })

      if (res.ok) {
        setSuccess('Quiosque atualizado com sucesso!')
        setTimeout(() => router.push('/admin/dashboard'), 1500)
      } else {
        setError('Erro ao salvar. Tente novamente.')
      }
    } catch {
      setError('Erro ao salvar.')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">
          <Link href="/admin/dashboard" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Shield className="h-6 w-6 text-cyan-500" />
          <span className="font-semibold text-slate-900 dark:text-white">Editar Quiosque (Admin)</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Informações básicas
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nome do quiosque *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  Endereço
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Fotos ({photos.length}/10)
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {photos.map((photo, i) => {
                const url = getProxyImageUrl(photo)
                return (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
                    {/^https?:\/\//.test(url) ? (
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Image src={url} alt="" fill className="object-cover" sizes="160px" />
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
              {photos.length < 10 && (
                <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 transition hover:border-cyan-400 dark:border-slate-600">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    <Upload className="h-6 w-6 text-slate-400" />
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Description & Hours */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Detalhes
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Horário de funcionamento
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="Ex: 08:00 - 22:00"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Contato
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(21) 99999-9999"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Telefone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@seuquiosque"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Site
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Serviços
            </h2>
            <div className="flex flex-wrap gap-2">
              {SERVICES_PREDEFINIS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    services.includes(s)
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Especialidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES_PREDEFINIDAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    specialties.includes(s)
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Google Place ID */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Avaliações Google
            </h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Google Place ID
              </label>
              <input
                type="text"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                placeholder="Preenchido automaticamente pelo endereço"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-400">
                O Place ID é preenchido automaticamente ao selecionar um endereço do Google Maps.
              </p>
            </div>
          </div>

          {/* Submit */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
