import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OwnerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/proprietario')
  }

  // Check if user has a quiosque
  const { data: profile } = await supabase
    .from('users')
    .select('quiosque_id')
    .eq('id', user.id)
    .single()

  if (profile?.quiosque_id) {
    redirect('/owner/dashboard')
  } else {
    redirect('/owner/create-quiosque')
  }
}
