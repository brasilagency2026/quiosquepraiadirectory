import { createClient } from '@/lib/supabase/server'
import HomeContent from '@/components/HomeContent'
import type { Quiosque } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('quiosques')
    .select('*')
    .eq('status', 'active')
    .order('plan', { ascending: false })
    .order('created_at', { ascending: false })

  const quiosques = (data as Quiosque[]) || []

  return <HomeContent quiosques={quiosques} />
}
