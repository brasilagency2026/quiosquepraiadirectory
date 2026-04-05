import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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

    const body = await request.json()

    const allowedFields = [
      'name', 'beach_name', 'address', 'city', 'state', 'lat', 'lng',
      'description', 'operating_hours', 'whatsapp', 'phone', 'instagram',
      'website', 'services', 'specialties', 'photos', 'google_place_id',
      'google_rating', 'google_reviews_count', 'status',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    const { error } = await supabase
      .from('quiosques')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin edit quiosque error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
