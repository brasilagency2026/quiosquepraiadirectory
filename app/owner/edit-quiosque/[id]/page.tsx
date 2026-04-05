import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Quiosque } from '@/types'
import EditQuiosqueClient from './EditQuiosqueClient'

export default async function EditQuiosquePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/proprietario')
  }

  const { data: quiosque } = await supabase
    .from('quiosques')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!quiosque) {
    redirect('/owner/dashboard')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  return (
    <EditQuiosqueClient
      quiosque={quiosque as Quiosque}
      isPremium={profile?.is_premium || false}
    />
  )
}
