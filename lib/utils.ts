type ClassValue = string | undefined | null | false | ClassValue[]

function clsx(...args: ClassValue[]): string {
  return args
    .flat()
    .filter((x): x is string => typeof x === 'string' && x !== '')
    .join(' ')
}

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function buildQuiosquePath(name: string, id: string): string {
  const slug = slugify(name)
  const shortId = id.slice(0, 8)
  return `/quiosque/${slug}-${shortId}`
}

export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-')
  const shortId = parts[parts.length - 1]
  return shortId
}

export function getProxyImageUrl(url: string): string {
  const FALLBACK_IMAGE = '/api/placeholder/400/300'
  if (!url) return FALLBACK_IMAGE
  if (url.startsWith('/api/images/')) return url
  if (url.includes('r2.cloudflarestorage.com')) {
    try {
      const urlObj = new URL(url)
      return `/api/images/${urlObj.pathname.slice(1)}`
    } catch {
      return FALLBACK_IMAGE
    }
  }
  if (url.includes('supabase.co') && url.includes('quiosque-photos/')) {
    const match = url.match(/quiosque-photos\/(.+)$/)
    if (match) return `/api/images/${match[1]}`
  }
  return url
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
