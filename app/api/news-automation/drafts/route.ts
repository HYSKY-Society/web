import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { parseAutomatedDraft, secretsMatch } from '@/lib/news-automation'

export const runtime = 'nodejs'

function canonicalSourceUrl(value: string) {
  try {
    const url = new URL(value)
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_') || ['fbclid', 'gclid'].includes(key.toLowerCase())) {
        url.searchParams.delete(key)
      }
    }
    return url.toString().replace(/\/$/, '').toLowerCase()
  } catch {
    return value.trim().replace(/\/$/, '').toLowerCase()
  }
}

function linkedUrls(content: string | null) {
  return [...(content || '').matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map(match => canonicalSourceUrl(match[1]))
}

export async function POST(request: Request) {
  if (!secretsMatch(request.headers.get('authorization'), process.env.NEWS_AUTOMATION_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const draft = parseAutomatedDraft(await request.json())
    const incomingSources = new Set(draft.sources.map(source => canonicalSourceUrl(source.url)))
    const existingPosts = await db
      .select({ id: pressPosts.id, title: pressPosts.title, content: pressPosts.content, isPublished: pressPosts.isPublished })
      .from(pressPosts)
    const repeated = existingPosts.find(post =>
      linkedUrls(post.content).some(url => incomingSources.has(url))
    )
    if (repeated) {
      return Response.json(
        {
          error: `This story already exists as ${repeated.isPublished ? 'a published article' : 'an unpublished draft'}.`,
          existingId: repeated.id,
          existingTitle: repeated.title,
          reviewPath: `/admin/press/${repeated.id}`,
        },
        { status: 409 }
      )
    }
    const [created] = await db.insert(pressPosts).values({
      slug: draft.slug, title: draft.title, author: 'HySky News', category: 'News Analysis',
      excerpt: draft.excerpt, content: draft.content, coverImageUrl: draft.coverImageUrl,
      imageAltText: draft.imageAltText, imageCredit: draft.imageCredit, imageSourceUrl: draft.imageSourceUrl,
      imageLicense: draft.imageLicense, imageLicenseUrl: draft.imageLicenseUrl, imageCaption: draft.imageCaption,
      imageModified: draft.imageModified ?? false,
      seoTitle: draft.seoTitle, seoDescription: draft.seoDescription,
      keywords: draft.keywords.join(', '), publishedAt: new Date(), readTimeMinutes: draft.readTimeMinutes,
      isPublished: false,
    }).returning({ id: pressPosts.id, slug: pressPosts.slug })
    return Response.json({ status: 'draft_created', id: created.id, slug: created.slug, reviewPath: `/admin/press/${created.id}` }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid draft payload.'
    const duplicate = /unique|duplicate/i.test(message)
    return Response.json({ error: duplicate ? 'A draft with this slug already exists.' : message }, { status: duplicate ? 409 : 400 })
  }
}
