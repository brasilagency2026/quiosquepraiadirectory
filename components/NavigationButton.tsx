'use client'

import { Navigation } from 'lucide-react'

interface NavigationButtonProps {
  lat: number
  lng: number
  name: string
}

export default function NavigationButton({ lat, lng, name }: NavigationButtonProps) {
  const handleClick = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
      title={`Navegar até ${name}`}
    >
      <Navigation className="h-4 w-4" />
      Navegar
    </button>
  )
}
