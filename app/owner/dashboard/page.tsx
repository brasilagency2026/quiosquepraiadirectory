import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Quiosque } from '@/types'
import DashboardClient from './DashboardClient'

export default async function OwnerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/proprietario')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.quiosque_id) {
    redirect('/owner/create-quiosque')
  }

  // Get quiosque
  const { data: quiosque } = await supabase
    .from('quiosques')
    .select('*')
    .eq('id', profile.quiosque_id)
    .single()

  if (!quiosque) {
    redirect('/owner/create-quiosque')
  }

  return <DashboardClient quiosque={quiosque as Quiosque} userEmail={user.email || ''} isPremium={profile.is_premium || false} />
}
