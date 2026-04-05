'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [showMap, setShowMap] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, stateFilter, isMobile])

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {}
    )
  }

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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-cyan-700 shadow-lg transition hover:bg-cyan-50 dark:bg-slate-800 dark:text-cyan-400"
          >
            <MapPin className="h-4 w-4" />
            Perto de mim
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
      </div>
    </div>
  )
}
