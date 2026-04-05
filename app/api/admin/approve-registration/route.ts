import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { randomUUID } from 'crypto'

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
    const token = randomUUID()

    // Update registration
    const { data: registration, error: updateError } = await supabaseAdmin
      .from('pending_registrations')
      .update({ status: 'approved', approval_token: token })
      .eq('id', id)
      .eq('status', 'pending')
      .select('email, whatsapp')
      .single()

    if (updateError || !registration) {
      return NextResponse.json({ error: 'Inscrição não encontrada.' }, { status: 404 })
    }

    // Send approval email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quiosquepraia.com'

    await sendEmail({
      to: registration.email,
      subject: 'Inscrição aprovada — quiosquepraia.com',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0f172a;">Sua inscrição foi aprovada! 🎉</h2>
          <p style="color: #475569;">Parabéns! Sua inscrição no portal quiosquepraia.com foi aprovada.</p>
          <p style="color: #475569;">Clique no botão abaixo para criar sua senha e ativar sua conta:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${appUrl}/inscription/finalizar?token=${token}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Criar minha conta
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Se você não solicitou esta inscrição, ignore este email.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve registration error:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
