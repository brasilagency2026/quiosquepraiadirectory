'use client'

import dynamic from 'next/dynamic'
import type { Quiosque } from '@/types'

const QuiosqueMap = dynamic(() => import('./QuiosqueMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
      <p className="text-slate-400">Carregando mapa...</p>
    </div>
  ),
})

interface QuiosqueMapDynamicProps {
  quiosques: Quiosque[]
  userLocation?: { lat: number; lng: number } | null
  center?: [number, number]
  zoom?: number
}

export default function QuiosqueMapDynamic(props: QuiosqueMapDynamicProps) {
  return <QuiosqueMap {...props} />
}
