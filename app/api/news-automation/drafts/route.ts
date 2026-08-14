import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { parseAutomatedDraft, secretsMatch } from '@/lib/news-automation'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!secretsMatch(request.headers.get('authorization'), process.env.NEWS_AUTOMATION_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const draft = parseAutomatedDraft(await request.json())
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
