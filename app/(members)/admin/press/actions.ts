'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'

export async function addPressPost(data: {
  slug: string
  title: string
  author: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  publishedAt: string
  readTimeMinutes: number | null
  isPublished: boolean
}) {
  await db.insert(pressPosts).values({
    slug: data.slug,
    title: data.title,
    author: data.author,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.coverImageUrl,
    publishedAt: new Date(data.publishedAt + 'T12:00:00Z'),
    readTimeMinutes: data.readTimeMinutes,
    isPublished: data.isPublished,
  })
  revalidatePath('/news')
  revalidatePath('/admin/press')
}
