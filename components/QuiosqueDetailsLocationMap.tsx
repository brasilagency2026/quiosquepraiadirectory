'use client'

import dynamic from 'next/dynamic'

const LocationMap = dynamic(
  () => import('./QuiosqueDetailsLocationMapInner'),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800" /> }
)

interface Props {
  lat: number
  lng: number
  name: string
}

export default function QuiosqueDetailsLocationMap(props: Props) {
  return <LocationMap {...props} />
}
