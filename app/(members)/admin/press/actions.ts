'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin'

async function requireAdmin() {
  const user = await currentUser()
  const email = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  if (!user || !isAdmin(email)) throw new Error('Forbidden')
}

export async function addPressPost(data: {
  slug: string
  title: string
  author: string
  category: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  imageAltText: string | null
  seoTitle: string | null
  seoDescription: string | null
  keywords: string | null
  publishedAt: string
  readTimeMinutes: number | null
  isPublished: boolean
}) {
  await requireAdmin()
  const normalized = {
    ...data,
    title: data.title.replace(/\bHYSKY\b/g, 'HySky'),
    author: data.author.replace(/\bHYSKY\b/g, 'HySky'),
    excerpt: data.excerpt?.replace(/\bHYSKY\b/g, 'HySky') ?? null,
    content: data.content.replace(/\bHYSKY\b/g, 'HySky'),
  }

  if (data.isPublished) {
    const focusKeywords = (data.keywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
    const h2s = [...normalized.content.matchAll(/^##\s+(.+)$/gm)].map(match => match[1]).join(' ')
    const headingText = `${normalized.title} ${h2s}`.toLowerCase()
    const linkCount = (normalized.content.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || []).length
    if (!normalized.excerpt || normalized.excerpt.length < 70) throw new Error('Add a useful summary of at least 70 characters before publishing.')
    if (!data.coverImageUrl || !data.imageAltText) throw new Error('A cover image and descriptive alt text are required before publishing.')
    if (!data.seoDescription || data.seoDescription.length < 70) throw new Error('Add an SEO description of at least 70 characters before publishing.')
    if (!focusKeywords.length || !focusKeywords.some(keyword => headingText.includes(keyword))) throw new Error('Use at least one focus keyword in the headline or an H2 heading.')
    if (linkCount < 1) throw new Error('Add at least one relevant internal or authoritative link before publishing.')
  }

  await db.insert(pressPosts).values({
    slug: data.slug,
    title: normalized.title,
    author: normalized.author || 'HySky News',
    category: data.category || 'News Analysis',
    excerpt: normalized.excerpt,
    content: normalized.content,
    coverImageUrl: data.coverImageUrl,
    imageAltText: data.imageAltText,
    seoTitle: data.seoTitle || normalized.title,
    seoDescription: data.seoDescription || normalized.excerpt,
    keywords: data.keywords,
    publishedAt: new Date(data.publishedAt + 'T12:00:00Z'),
    readTimeMinutes: data.readTimeMinutes,
    isPublished: data.isPublished,
  })
  revalidatePath('/news')
  revalidatePath('/admin/press')
}

