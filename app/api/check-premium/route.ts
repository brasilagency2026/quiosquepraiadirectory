import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkPremiumStatus } from '@/lib/premium'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const email = user.email
    if (!email) {
      return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
    }

    const isPremium = await checkPremiumStatus(email)

    // Update user record
    await supabase
      .from('users')
      .update({ is_premium: isPremium })
      .eq('id', user.id)

    // Update quiosque plan
    const { data: userProfile } = await supabase
      .from('users')
      .select('quiosque_id')
      .eq('id', user.id)
      .single()

    if (userProfile?.quiosque_id) {
      await supabase
        .from('quiosques')
        .update({
          plan: isPremium ? 'premium' : 'free',
          premium_verified_at: isPremium ? new Date().toISOString() : null,
        })
        .eq('id', userProfile.quiosque_id)
    }

    return NextResponse.json({ isPremium })
  } catch (error) {
    console.error('Check premium error:', error)
    return NextResponse.json({ error: 'Erro ao verificar premium' }, { status: 500 })
  }
}
