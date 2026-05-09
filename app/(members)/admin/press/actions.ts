'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function addPressPost(data: {
  slug: string
  title: string
  author: string
  excerpt: string | null
  content: string | null
  publishedAt: string
  readTimeMinutes: number | null
}) {
  await db.insert(pressPosts).values({
    slug: data.slug,
    title: data.title,
    author: data.author,
    excerpt: data.excerpt,
    content: data.content,
    publishedAt: new Date(data.publishedAt),
    readTimeMinutes: data.readTimeMinutes,
    isPublished: true,
  })
  revalidatePath('/press')
  revalidatePath('/admin/press')
}
