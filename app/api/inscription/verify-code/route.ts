import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: registration, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Inscrição não encontrada.' }, { status: 404 })
    }

    // Check code expiry (10 minutes)
    if (registration.code_sent_at) {
      const sentAt = new Date(registration.code_sent_at).getTime()
      if (Date.now() - sentAt > 10 * 60 * 1000) {
        return NextResponse.json({ error: 'Código expirado. Solicite um novo.' }, { status: 410 })
      }
    }

    // Verify code
    if (registration.verification_code !== code) {
      return NextResponse.json({ error: 'Código inválido.' }, { status: 400 })
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('pending_registrations')
      .update({ verified: true })
      .eq('id', registration.id)

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar.' }, { status: 500 })
    }

    // Notify admin
    const whatsappDigits = registration.whatsapp.replace(/\D/g, '')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quiosquepraia.com'

    await sendEmail({
      to: process.env.SUPER_ADMIN_NOTIFICATION_EMAIL || 'glwebagency2@gmail.com',
      subject: `Nova inscrição pendente — ${email}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0f172a;">Nova inscrição no portal</h2>
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 16px 0;">
            <p style="margin: 8px 0;"><strong>Email:</strong> ${registration.email}</p>
            <p style="margin: 8px 0;"><strong>WhatsApp:</strong> ${registration.whatsapp}</p>
          </div>
          <div style="margin-top: 20px;">
            <a href="https://wa.me/${whatsappDigits}" style="display: inline-block; padding: 10px 20px; background: #25D366; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 10px;">
              WhatsApp
            </a>
            <a href="${appUrl}/admin/dashboard" style="display: inline-block; padding: 10px 20px; background: #0891b2; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Painel Admin
            </a>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
