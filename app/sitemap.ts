import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'

const ORIGIN = 'https://news.hysky.org'

// Keep the article list current even when the database schema changes between builds.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: ORIGIN, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${ORIGIN}/subscribe`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
  try {
    const posts = await db.select().from(pressPosts).where(eq(pressPosts.isPublished, true)).orderBy(desc(pressPosts.publishedAt))
    return [...base, ...posts.map(post => ({ url: `${ORIGIN}/${post.slug}`, lastModified: post.updatedAt, changeFrequency: 'weekly' as const, priority: 0.9 }))]
  } catch {
    return base
  }
}
