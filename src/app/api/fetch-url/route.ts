import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({ url: '' }))
  if (!url || !url.startsWith('http')) return NextResponse.json({ ok: false })

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  }

  try {
    const isYoutube = /youtube\.com\/watch|youtu\.be\//.test(url)

    const res = await fetch(url, { headers })
    if (!res.ok) return NextResponse.json({ ok: false })
    const html = await res.text()

    let title = ''
    let description = ''

    // Extract title
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    title = (ogTitle?.[1] || titleTag?.[1] || '').replace(' - YouTube', '').trim()

    if (isYoutube) {
      // Extract shortDescription from ytInitialData embedded in the page
      const shortDescMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/)
      if (shortDescMatch) {
        description = shortDescMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/\\u003c/g, '<')
          .replace(/\\u003e/g, '>')
          .replace(/\\u0026/g, '&')
      }
    }

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
