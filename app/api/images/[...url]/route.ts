import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ url: string[] }> }
) {
  const params = await context.params
  const key = params.url.join('/')

  try {
    // Try R2 first
    const r2Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      })
    )

    const bytes = await r2Response.Body!.transformToByteArray()
    const buffer = Buffer.from(bytes)

    return new Response(buffer, {
      headers: {
        'Content-Type': r2Response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (r2Error: unknown) {
    const r2Err = r2Error as { name?: string }
    // If not found in R2, try Supabase Storage as fallback
    if (r2Err.name === 'NoSuchKey') {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseRes = await fetch(
          `${supabaseUrl}/storage/v1/object/public/quiosque-photos/${key}`
        )

        if (supabaseRes.ok) {
          const arrayBuffer = await supabaseRes.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const contentType = supabaseRes.headers.get('content-type') || 'image/jpeg'

          // Copy to R2 in background (auto-migration)
          s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME!,
              Key: key,
              Body: buffer,
              ContentType: contentType,
            })
          ).catch(() => {})

          return new Response(buffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          })
        }
      } catch {
        // Supabase fallback failed
      }
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }
}
