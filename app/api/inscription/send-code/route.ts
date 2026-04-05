import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, whatsapp } = await request.json()

    if (!email || !whatsapp) {
      return NextResponse.json({ error: 'Email e WhatsApp são obrigatórios.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if email already has a Supabase auth account
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já possui uma conta. Faça login.' },
        { status: 409 }
      )
    }

    // Check if already approved
    const { data: existing } = await supabase
      .from('pending_registrations')
      .select('status, code_sent_at')
      .eq('email', email)
      .single()

    if (existing?.status === 'approved') {
      return NextResponse.json(
        { error: 'Sua inscrição já foi aprovada. Verifique seu email.' },
        { status: 409 }
      )
    }

    // Rate limit: no resend within 60 seconds
    if (existing?.code_sent_at) {
      const lastSent = new Date(existing.code_sent_at).getTime()
      if (Date.now() - lastSent < 60000) {
        return NextResponse.json(
          { error: 'Aguarde 60 segundos antes de reenviar o código.' },
          { status: 429 }
        )
      }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Upsert pending registration
    const { error: dbError } = await supabase
      .from('pending_registrations')
      .upsert(
        {
          email,
          whatsapp,
          verification_code: code,
          code_sent_at: new Date().toISOString(),
          verified: false,
          status: 'pending',
        },
        { onConflict: 'email' }
      )

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar dados.' }, { status: 500 })
    }

    // Send verification email
    const sent = await sendEmail({
      to: email,
      subject: 'Código de verificação — quiosquepraia.com',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 440px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0f172a; margin-bottom: 8px;">Verificação de Email</h2>
          <p style="color: #64748b;">Use o código abaixo para verificar seu email no portal quiosquepraia.com:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; text-align: center; padding: 24px; background: #f0f9ff; border-radius: 12px; color: #0891b2; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Este código expira em 10 minutos.</p>
        </div>
      `,
    })

    if (!sent) {
      return NextResponse.json({ error: 'Erro ao enviar email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
