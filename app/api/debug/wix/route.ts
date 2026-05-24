import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const WIX_API_KEY = process.env.WIX_API_KEY ?? ''
  const WIX_SITE_ID = process.env.WIX_SITE_ID ?? ''

  if (!WIX_API_KEY) return Response.json({ error: 'WIX_API_KEY not set' })
  if (!WIX_SITE_ID) return Response.json({ error: 'WIX_SITE_ID not set' })

  try {
    const res = await fetch('https://www.wixapis.com/blog/v3/posts/query', {
      method: 'POST',
      headers: {
        Authorization: WIX_API_KEY,
        'wix-site-id': WIX_SITE_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldsets: ['URL', 'METRICS', 'CONTENT_TEXT'],
        paging: { limit: 5, offset: 0 },
      }),
      cache: 'no-store',
    })

    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }

    return Response.json({
      status:    res.status,
      ok:        res.ok,
      keyPrefix: WIX_API_KEY.slice(0, 20) + '...',
      siteId:    WIX_SITE_ID,
      response:  data,
    })
  } catch (err) {
    return Response.json({ error: String(err) })
  }
}
