import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({ url: '' }))
  if (!url || !url.startsWith('http')) return NextResponse.json({ ok: false })

  try {
    const isYoutube = /youtube\.com\/watch|youtu\.be\//.test(url)
    let title = ''
    let description = ''

    // YouTube: oEmbed gives a reliable title without bot detection
    if (isYoutube) {
      try {
        const oembed = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        if (oembed.ok) {
          const data = await oembed.json()
          title = data.title || ''
        }
      } catch {}
    }

    // Fetch the full page with browser-like headers
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
      },
      redirect: 'follow',
    })

    if (!res.ok) {
      // Even if page fetch fails, return what we have from oEmbed
      return NextResponse.json({ ok: !!title, title, description: '' })
    }

    const html = await res.text()

    // Extract title from HTML if oEmbed didn't get it
    if (!title) {
      const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      title = (ogTitle?.[1] || titleTag?.[1] || '').replace(/ - YouTube$/, '').trim()
    }

    if (isYoutube) {
      // Try multiple patterns — YouTube page structure varies by region/version
      const descPatterns = [
        /"shortDescription":"((?:[^"\\]|\\.)*)"/,
        /"description":\{"simpleText":"((?:[^"\\]|\\.)*)"\}/,
        /"description":\{"runs":\[.*?"text":"((?:[^"\\]|\\.)*)"\]/,
      ]
      for (const pat of descPatterns) {
        const m = html.match(pat)
        if (m?.[1] && m[1].length > 5) {
          description = m[1]
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\u003c/g, '<')
            .replace(/\\u003e/g, '>')
            .replace(/\\u0026/g, '&')
          break
        }
      }
    }

    // Fallback: og:description / meta description (works for most recipe sites)
    if (!description) {
      const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/)
      const metaDesc = html.match(/<meta name="description" content="([^"]+)"/)
      description = (ogDesc?.[1] || metaDesc?.[1] || '').trim()
    }

    return NextResponse.json({ ok: true, title, description })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) })
  }
}
