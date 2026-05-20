export type WixPost = {
  id: string
  title: string
  excerpt?: string
  slug: string
  url?: { base: string; path: string }
  coverMedia?: { image?: { url: string } }
  firstPublishedDate?: string
}

const WIX_API_KEY = process.env.WIX_API_KEY ?? ''
const WIX_SITE_ID = process.env.WIX_SITE_ID ?? 'c2691ccf-6e10-47b8-ace9-638673ce70b7'

export async function getRecentBlogPosts(limitDays = 14, maxResults = 5): Promise<WixPost[]> {
  if (!WIX_API_KEY) return []
  const since = new Date(Date.now() - limitDays * 24 * 60 * 60 * 1000)

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
        paging: { limit: 20, offset: 0 },
      }),
      next: { revalidate: 1800 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const posts: WixPost[] = data.posts ?? []
    return posts
      .filter((p) => !p.firstPublishedDate || new Date(p.firstPublishedDate) >= since)
      .slice(0, maxResults)
  } catch {
    return []
  }
}
