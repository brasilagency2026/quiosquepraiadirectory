import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { key, email } = await request.json()

    if (key !== process.env.SETUP_SUPER_ADMIN_KEY) {
      return NextResponse.json({ error: 'Chave inválida' }, { status: 403 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find auth user by email
    const { data: authList } = await supabase.auth.admin.listUsers()
    const authUser = authList?.users?.find(u => u.email === email)

    if (!authUser) {
      return NextResponse.json({ error: `Nenhum usuário encontrado com email: ${email}` }, { status: 404 })
    }

    // Upsert user profile with super_admin role
    const { error } = await supabase
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email,
          role: 'super_admin',
        },
        { onConflict: 'id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `${email} agora é super_admin` })
  } catch (error) {
    console.error('Setup super admin error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
