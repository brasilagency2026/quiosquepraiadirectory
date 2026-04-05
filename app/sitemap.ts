import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { buildQuiosquePath } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://quiosquepraia.com'

  const { data: quiosques } = await supabase
    .from('quiosques')
    .select('id, name, created_at')
    .eq('status', 'active')

  const quiosqueUrls: MetadataRoute.Sitemap = (quiosques || []).map((q) => ({
    url: `${baseUrl}${buildQuiosquePath(q.name, q.id)}`,
    lastModified: q.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/suporte-contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...quiosqueUrls,
  ]
}
