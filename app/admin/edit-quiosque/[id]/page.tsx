import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Quiosque } from '@/types'
import AdminEditQuiosqueClient from './AdminEditQuiosqueClient'

export default async function AdminEditQuiosquePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/admin')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/')
  }

  const { data: quiosque } = await supabase
    .from('quiosques')
    .select('*')
    .eq('id', id)
    .single()

  if (!quiosque) {
    redirect('/admin/dashboard')
  }

  return <AdminEditQuiosqueClient quiosque={quiosque as Quiosque} />
}
