import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 })
    }

    // Verify admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const supabaseAdmin = createAdminClient()

    const { data: registration, error: updateError } = await supabaseAdmin
      .from('pending_registrations')
      .update({ status: 'rejected' })
      .eq('id', id)
      .eq('status', 'pending')
      .select('email')
      .single()

    if (updateError || !registration) {
      return NextResponse.json({ error: 'Inscrição não encontrada.' }, { status: 404 })
    }

    // Send rejection email
    await sendEmail({
      to: registration.email,
      subject: 'Atualização da inscrição — quiosquepraia.com',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0f172a;">Inscrição não aprovada</h2>
          <p style="color: #475569;">Infelizmente, sua inscrição no portal quiosquepraia.com não foi aprovada neste momento.</p>
          <p style="color: #475569;">Se você acredita que houve um erro, entre em contato conosco.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reject registration error:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
