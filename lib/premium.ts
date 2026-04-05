import { createClient } from '@/lib/supabase/server'

export async function checkPremiumStatus(email: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('users')
      .select('is_premium')
      .eq('email', email)
      .single()
    return data?.is_premium === true
  } catch {
    return false
  }
}
