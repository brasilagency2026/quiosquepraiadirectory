'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Waves } from 'lucide-react'
import { getProxyImageUrl, buildQuiosquePath } from '@/lib/utils'
import PremiumBadge from './PremiumBadge'
import type { Quiosque } from '@/types'

interface QuiosqueCardProps {
  quiosque: Quiosque
  distance?: number | null
}

export default function QuiosqueCard({ quiosque, distance }: QuiosqueCardProps) {
  const isPremium = quiosque.plan === 'premium'
  const href = buildQuiosquePath(quiosque.name, quiosque.id, quiosque.state, quiosque.city, quiosque.beach_name)

  if (!isPremium) {
    return (
      <Link href={href} className="block">
        <div className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
                <Waves className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{quiosque.name}</h3>
                <p className="text-sm text-slate-500">
                  {quiosque.beach_name && `${quiosque.beach_name} • `}
                  {quiosque.city}, {quiosque.state}
                </p>
              </div>
            </div>
            {distance != null && (
              <span className="text-sm text-slate-400">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  const imageUrl = quiosque.photos?.[0] ? getProxyImageUrl(quiosque.photos[0]) : '/api/placeholder/400/300'

  return (
    <Link href={href} className="block">
      <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="relative h-48 w-full overflow-hidden">
          {/^https?:\/\//.test(imageUrl) ? (
            <img
              src={imageUrl}
              alt={quiosque.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <Image
              src={imageUrl}
              alt={quiosque.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <div className="absolute left-3 top-3">
            <PremiumBadge />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{quiosque.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {quiosque.beach_name && `${quiosque.beach_name} • `}
              {quiosque.city}, {quiosque.state}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            {quiosque.google_rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {quiosque.google_rating.toFixed(1)}
                </span>
                {quiosque.google_reviews_count > 0 && (
                  <span className="text-xs text-slate-400">
                    ({quiosque.google_reviews_count})
                  </span>
                )}
              </div>
            )}
            {distance != null && (
              <span className="text-sm text-slate-400">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
