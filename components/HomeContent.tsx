'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, MapPin, Filter, ChevronLeft, ChevronRight, Navigation, Loader2 } from 'lucide-react'
import QuiosqueCard from './QuiosqueCard'
import QuiosqueMapDynamic from './QuiosqueMapDynamic'
import { useIsMobile } from '@/hooks/use-mobile'
import { calculateDistance } from '@/lib/utils'
import { ESTADOS_BRASIL } from '@/types'
import type { Quiosque } from '@/types'

interface HomeContentProps {
  quiosques: Quiosque[]
}

export default function HomeContent({ quiosques }: HomeContentProps) {
  const isMobile = useIsMobile()
  const itemsPerPage = isMobile ? 5 : 10
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, stateFilter, isMobile])

  // Auto-geolocate on page load
  useEffect(() => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setShowMap(true)
        setGeoLoading(false)
      },
      () => { setGeoLoading(false) },
      { timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setShowMap(true)
        setGeoLoading(false)
      },
      () => { setGeoLoading(false) },
      { timeout: 10000 }
    )
  }, [])

  const filtered = useMemo(() => {
    let list = [...quiosques]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (k) =>
          k.name.toLowerCase().includes(q) ||
          k.beach_name?.toLowerCase().includes(q) ||
          k.city?.toLowerCase().includes(q)
      )
    }

    if (stateFilter) {
      list = list.filter((k) => k.state === stateFilter)
    }

    // Sort: premium first, then by distance if available
    list.sort((a, b) => {
      if (a.plan === 'premium' && b.plan !== 'premium') return -1
      if (a.plan !== 'premium' && b.plan === 'premium') return 1

      if (userLocation && a.lat && a.lng && b.lat && b.lng) {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
        return distA - distB
      }
      return 0
    })

    return list
  }, [quiosques, search, stateFilter, userLocation])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const getDistance = (q: Quiosque): number | null => {
    if (!userLocation || !q.lat || !q.lng) return null
    return calculateDistance(userLocation.lat, userLocation.lng, q.lat, q.lng)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 via-sky-400 to-amber-200 px-4 py-12 text-center dark:from-slate-900 dark:via-cyan-900 dark:to-slate-800 md:py-20">
        <h1 className="text-3xl font-bold text-white md:text-5xl">
          Quiosques de Praia
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/90">
          Encontre os melhores quiosques de praia do Brasil
        </p>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, praia ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-4 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            onClick={handleGeolocate}
            disabled={geoLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition ${
              userLocation
                ? 'bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-700'
                : 'bg-white text-cyan-700 hover:bg-cyan-50 dark:bg-slate-800 dark:text-cyan-400'
            } disabled:opacity-60`}
          >
            {geoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : userLocation ? (
              <Navigation className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {geoLoading ? 'Localizando...' : userLocation ? 'Localizado' : 'Perto de mim'}
          </button>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            <span className="text-sm text-slate-500">
              {filtered.length} quiosque{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              {userLocation && ' • ordenados por distância'}
            </span>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400"
          >
            <MapPin className="h-4 w-4" />
            {showMap ? 'Ocultar mapa' : 'Ver mapa'}
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Estado
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white sm:w-64"
            >
              <option value="">Todos os estados</option>
              {ESTADOS_BRASIL.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        )}

        {/* Map */}
        {showMap && (
          <div className="mb-8 h-[400px] overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
            <QuiosqueMapDynamic
              quiosques={filtered}
              userLocation={userLocation}
            />
          </div>
        )}

        {/* Cards List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginated.map((q) => (
            <QuiosqueCard key={q.id} quiosque={q} distance={getDistance(q)} />
          ))}
        </div>

        {paginated.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-500">Nenhum quiosque encontrado.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 text-sm text-slate-600 dark:text-slate-300">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Menu Digital + Pagamento CTA */}
        <div className="mt-16 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 p-[2px] shadow-xl">
          <div className="rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 px-6 py-10 text-center sm:px-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              Menu Digital + Pagamento
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-base text-white/90">
              Ofereça um cardápio digital moderno aos seus clientes com pagamento integrado via Mercado Pago.
            </p>
            <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/95">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Sem app para instalar
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Sem maquininha
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Funciona com Mercado Pago
              </span>
            </div>
            <a
              href="https://pay.quiosquepraia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-teal-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Descobrir agora
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
