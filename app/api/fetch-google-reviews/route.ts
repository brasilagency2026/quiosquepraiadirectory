import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { quiosqueId, googlePlaceId } = await request.json()

    if (!quiosqueId || !googlePlaceId) {
      return NextResponse.json(
        { error: 'quiosqueId e googlePlaceId são obrigatórios' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key não configurada' },
        { status: 500 }
      )
    }

    // Fetch place details from Google Places API — include reviews
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(googlePlaceId)}&fields=rating,user_ratings_total,name,reviews&language=pt-BR&key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK' || !data.result) {
      return NextResponse.json(
        { error: `Google Places API error: ${data.status}` },
        { status: 400 }
      )
    }

    const rating = data.result.rating ?? null
    const reviewsCount = data.result.user_ratings_total ?? 0
    const reviews = (data.result.reviews || []).map((r: { author_name: string; rating: number; text: string; time: number; profile_photo_url?: string; relative_time_description?: string }) => ({
      author_name: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.time,
      photo_url: r.profile_photo_url || null,
      relative_time: r.relative_time_description || null,
    }))

    // Update quiosque in database
    const supabase = createAdminClient()
    const { error: updateError } = await supabase
      .from('quiosques')
      .update({
        google_place_id: googlePlaceId,
        google_rating: rating,
        google_reviews_count: reviewsCount,
        google_reviews: reviews,
        premium_verified_at: new Date().toISOString(),
      })
      .eq('id', quiosqueId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao atualizar o banco de dados' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      rating,
      reviewsCount,
      reviews,
      placeName: data.result.name,
    })
  } catch (error) {
    console.error('Fetch Google reviews error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
