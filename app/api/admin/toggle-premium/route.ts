import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { quiosqueId, premium } = await request.json()

    if (!quiosqueId || typeof premium !== 'boolean') {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
    }

    // Update quiosque plan
    const { error: quiosqueError } = await supabase
      .from('quiosques')
      .update({
        plan: premium ? 'premium' : 'free',
        premium_verified_at: premium ? new Date().toISOString() : null,
      })
      .eq('id', quiosqueId)

    if (quiosqueError) {
      return NextResponse.json({ error: 'Erro ao atualizar quiosque' }, { status: 500 })
    }

    // Update owner's is_premium flag
    const { data: owner } = await supabase
      .from('users')
      .select('id')
      .eq('quiosque_id', quiosqueId)
      .single()

    if (owner) {
      await supabase
        .from('users')
        .update({ is_premium: premium })
        .eq('id', owner.id)
    }

    return NextResponse.json({ success: true, premium })
  } catch (error) {
    console.error('Toggle premium error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
