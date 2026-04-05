import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('quiosques').select('id').limit(1)

    if (error) {
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', count: data?.length || 0 })
  } catch (error) {
    console.error('Test supabase error:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
