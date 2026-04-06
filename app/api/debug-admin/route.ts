import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { key, email } = await request.json()

    if (key !== process.env.SETUP_SUPER_ADMIN_KEY) {
      return NextResponse.json({ error: 'Chave inválida' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // 1. Find auth user by email
    const { data: authList, error: authError } = await supabase.auth.admin.listUsers()
    const authUser = authList?.users?.find(u => u.email === email)

    // 2. Check users table
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)

    // 3. Check users table by auth id if found
    let profileById = null
    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      profileById = data
    }

    return NextResponse.json({
      auth_user_found: !!authUser,
      auth_user_id: authUser?.id || null,
      auth_user_email: authUser?.email || null,
      auth_error: authError?.message || null,
      profiles_by_email: profiles || [],
      profile_by_auth_id: profileById,
      profile_error: profileError?.message || null,
      service_role_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
