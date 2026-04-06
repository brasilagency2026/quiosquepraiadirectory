import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'Token e senha (mín. 6 caracteres) são obrigatórios.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find approved registration by token
    const { data: registration, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('approval_token', token)
      .eq('status', 'approved')
      .single()

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Link inválido ou expirado.' }, { status: 404 })
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: registration.email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({ error: 'Erro ao criar conta.' }, { status: 500 })
    }

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: registration.email,
      role: 'proprietario',
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Create the quiosque if name/beach info was provided during inscription
    if (registration.quiosque_name) {
      const { data: quiosque, error: quiosqueError } = await supabase
        .from('quiosques')
        .insert({
          owner_id: authData.user.id,
          name: registration.quiosque_name,
          beach_name: registration.beach_name || '',
          city: registration.city || '',
          state: registration.state || '',
          plan: 'free',
          status: 'active',
        })
        .select('id')
        .single()

      if (quiosqueError) {
        console.error('Quiosque creation error:', quiosqueError)
      } else if (quiosque) {
        // Link quiosque to user profile
        await supabase
          .from('users')
          .update({ quiosque_id: quiosque.id })
          .eq('id', authData.user.id)
      }
    }

    // Mark registration as completed (update status so token can't be reused)
    await supabase
      .from('pending_registrations')
      .update({ status: 'completed' as any, approval_token: null })
      .eq('id', registration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete registration error:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
