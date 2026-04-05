'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Waves, Eye, Crown, LogOut, MapPin, Star,
} from 'lucide-react'
import PremiumBadge from '@/components/PremiumBadge'
import { buildQuiosquePath, getProxyImageUrl } from '@/lib/utils'
import Image from 'next/image'
import type { Quiosque } from '@/types'

interface Props {
  quiosque: Quiosque
  userEmail: string
  isPremium: boolean
}

export default function DashboardClient({ quiosque, userEmail, isPremium }: Props) {
  const router = useRouter()
  const publicUrl = buildQuiosquePath(quiosque.name, quiosque.id)
  const imageUrl = quiosque.photos?.[0] ? getProxyImageUrl(quiosque.photos[0]) : null

  const handleSignOut = async () => {
    await fetch('/auth/signout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-cyan-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Meu Quiosque</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 md:block">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Premium Banner */}
        {!isPremium && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <Crown className="h-8 w-8 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-bold">
                  Ative o Premium para adicionar fotos, contato WhatsApp e avaliações do Google!
                </h2>
                <p className="mt-1 text-white/90">
                  Com o plano Premium, seu quiosque aparece em destaque com fotos, informações completas e mais visibilidade.
                </p>
                <a
                  href="https://pay.quiosquepraia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                >
                  Assinar Premium em pay.quiosquepraia.com
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Quiosque Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700 md:h-auto md:w-64">
              {imageUrl ? (
                /^https?:\/\//.test(imageUrl) ? (
                  <img src={imageUrl} alt={quiosque.name} className="h-full w-full object-cover" />
                ) : (
                  <Image src={imageUrl} alt={quiosque.name} fill className="object-cover" sizes="256px" />
                )
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Waves className="h-12 w-12 text-slate-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {quiosque.name}
                </h1>
                {isPremium && <PremiumBadge />}
              </div>

              <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                <span>
                  {quiosque.beach_name && `${quiosque.beach_name} • `}
                  {quiosque.city}, {quiosque.state}
                </span>
              </div>

              {quiosque.google_rating && (
                <div className="mt-2 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{quiosque.google_rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">
                    ({quiosque.google_reviews_count} avaliações)
                  </span>
                </div>
              )}

              <div className="mt-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  quiosque.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {quiosque.status === 'active' ? 'Ativo' : quiosque.status === 'pending' ? 'Pendente' : 'Pausado'}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-6">
                <Link
                  href={publicUrl}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                >
                  <Eye className="h-4 w-4" />
                  Ver página pública
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
