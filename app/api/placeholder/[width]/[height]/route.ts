import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ width: string; height: string }> }
) {
  const params = await context.params
  const width = parseInt(params.width) || 400
  const height = parseInt(params.height) || 300

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#e2e8f0"/>
    <text x="50%" y="50%" font-family="system-ui" font-size="16" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">
      ${width}×${height}
    </text>
  </svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
