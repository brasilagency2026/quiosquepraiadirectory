import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json()

    if (key !== process.env.SETUP_SUPER_ADMIN_KEY) {
      return NextResponse.json({ error: 'Chave inválida' }, { status: 403 })
    }

    const { email } = await request.json()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    )

    const { error } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('email', email)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Setup super admin error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
