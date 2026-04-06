import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { extractIdFromSlug, getProxyImageUrl, buildQuiosquePath } from '@/lib/utils'
import type { Quiosque } from '@/types'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import ImageCarousel from '@/components/ImageCarousel'
import PremiumBadge from '@/components/PremiumBadge'
import NavigationButton from '@/components/NavigationButton'
import QuiosqueDetailsLocationMap from '@/components/QuiosqueDetailsLocationMap'
import {
  MapPin, Clock, Phone, MessageCircle, Camera, Globe, Star, Waves, ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

async function getQuiosque(slugParts: string[]): Promise<Quiosque | null> {
  const supabase = await createClient()
  // The last segment always contains "nome-shortid"
  const lastSegment = slugParts[slugParts.length - 1]
  const shortId = extractIdFromSlug(lastSegment)

  const { data } = await supabase
    .from('quiosques')
    .select('*')
    .eq('status', 'active')
    .ilike('id', `${shortId}%`)
    .single()

  return data as Quiosque | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const quiosque = await getQuiosque(slug)

  if (!quiosque) {
    return { title: 'Quiosque não encontrado' }
  }

  const imageUrl = quiosque.photos?.[0]
    ? getProxyImageUrl(quiosque.photos[0])
    : undefined

  return {
    title: `${quiosque.name} - ${quiosque.beach_name || quiosque.city}`,
    description: quiosque.description || `Quiosque de praia em ${quiosque.beach_name || quiosque.city}, ${quiosque.state}`,
    openGraph: {
      title: quiosque.name,
      description: quiosque.description || `Quiosque em ${quiosque.city}`,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default async function QuiosquePage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const quiosque = await getQuiosque(slug)

  if (!quiosque) {
    notFound()
  }

  // If the URL doesn't match the canonical SEO-friendly format, redirect
  const canonicalPath = buildQuiosquePath(quiosque.name, quiosque.id, quiosque.state, quiosque.city, quiosque.beach_name)
  const currentPath = `/quiosque/${slug.join('/')}`
  if (quiosque.state && quiosque.city && currentPath !== canonicalPath) {
    redirect(canonicalPath)
  }

  const isPremium = quiosque.plan === 'premium'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-cyan-600 hover:underline"
        >
          ← Voltar aos quiosques
        </Link>

        {isPremium ? (
          /* PREMIUM VIEW */
          <div className="space-y-6">
            {/* Photos */}
            {quiosque.photos && quiosque.photos.length > 0 && (
              <ImageCarousel images={quiosque.photos} alt={quiosque.name} />
            )}

            {/* Header */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                      {quiosque.name}
                    </h1>
                    <PremiumBadge />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {quiosque.beach_name && `${quiosque.beach_name} • `}
                      {quiosque.address || `${quiosque.city}, ${quiosque.state}`}
                    </span>
                  </div>
                </div>

                {quiosque.google_rating && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                      {quiosque.google_rating.toFixed(1)}
                    </span>
                    {quiosque.google_reviews_count > 0 && (
                      <span className="text-sm text-slate-500">
                        ({quiosque.google_reviews_count} avaliações)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {quiosque.operating_hours && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{quiosque.operating_hours}</span>
                </div>
              )}

              {quiosque.description && (
                <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
                  {quiosque.description}
                </p>
              )}
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-wrap gap-3">
              {quiosque.whatsapp && (
                <a
                  href={`https://wa.me/55${quiosque.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {quiosque.phone && (
                <a
                  href={`tel:+55${quiosque.phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  <Phone className="h-4 w-4" />
                  Ligar
                </a>
              )}
              {quiosque.lat && quiosque.lng && (
                <NavigationButton lat={quiosque.lat} lng={quiosque.lng} name={quiosque.name} />
              )}
              {quiosque.instagram && (
                <a
                  href={`https://instagram.com/${quiosque.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-pink-700"
                >
                  <Camera className="h-4 w-4" />
                  Instagram
                </a>
              )}
              {quiosque.website && (
                <a
                  href={quiosque.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                >
                  <Globe className="h-4 w-4" />
                  Site
                </a>
              )}
            </div>

            {/* Services & Specialties */}
            {quiosque.services && quiosque.services.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Serviços
                </h2>
                <div className="flex flex-wrap gap-2">
                  {quiosque.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-cyan-50 px-3 py-1 text-sm text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {quiosque.specialties && quiosque.specialties.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Especialidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {quiosque.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            {quiosque.lat && quiosque.lng && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Localização
                </h2>
                <QuiosqueDetailsLocationMap
                  lat={quiosque.lat}
                  lng={quiosque.lng}
                  name={quiosque.name}
                />
              </div>
            )}
          </div>
        ) : (
          /* FREE VIEW */
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
              <Waves className="mx-auto mb-4 h-12 w-12 text-cyan-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {quiosque.name}
              </h1>
              {quiosque.beach_name && (
                <p className="mt-2 text-slate-500">{quiosque.beach_name}</p>
              )}
              <p className="mt-1 text-sm text-slate-400">
                {quiosque.city}, {quiosque.state}
              </p>

              <div className="mt-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Este quiosque ainda não tem plano Premium. Informações limitadas.
                </p>
                <a
                  href="https://pay.quiosquepraia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:underline"
                >
                  É o seu quiosque? Assine o Premium em pay.quiosquepraia.com
                </a>
              </div>
            </div>

            {quiosque.lat && quiosque.lng && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Localização
                </h2>
                <QuiosqueDetailsLocationMap
                  lat={quiosque.lat}
                  lng={quiosque.lng}
                  name={quiosque.name}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
