'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getProxyImageUrl, buildQuiosquePath } from '@/lib/utils'
import type { Quiosque } from '@/types'
import Link from 'next/link'

// Fix Leaflet default icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const premiumIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -40],
  shadowSize: [48, 48],
})

L.Marker.prototype.options.icon = defaultIcon

interface QuiosqueMapProps {
  quiosques: Quiosque[]
  userLocation?: { lat: number; lng: number } | null
  center?: [number, number]
  zoom?: number
}

export default function QuiosqueMap({
  quiosques,
  userLocation,
  center = [-14.235, -51.925],
  zoom = 4,
}: QuiosqueMapProps) {
  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng] as [number, number]
    : center

  const mapZoom = userLocation ? 12 : zoom

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      className="h-full w-full rounded-xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={20000}
          pathOptions={{ color: '#06B6D4', fillColor: '#06B6D4', fillOpacity: 0.1 }}
        />
      )}

      {quiosques.map((q) => {
        if (!q.lat || !q.lng) return null
        const isPremium = q.plan === 'premium'
        const href = buildQuiosquePath(q.name, q.id, q.state, q.city, q.beach_name)

        return (
          <Marker
            key={q.id}
            position={[q.lat, q.lng]}
            icon={isPremium ? premiumIcon : defaultIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                {isPremium && q.photos?.[0] && (
                  <img
                    src={getProxyImageUrl(q.photos[0])}
                    alt={q.name}
                    className="mb-2 h-24 w-full rounded object-cover"
                  />
                )}
                <Link href={href} className="font-semibold text-cyan-700 hover:underline">
                  {q.name}
                </Link>
                {q.beach_name && (
                  <p className="text-xs text-slate-500">{q.beach_name}</p>
                )}
                <p className="text-xs text-slate-500">
                  {q.city}, {q.state}
                </p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
