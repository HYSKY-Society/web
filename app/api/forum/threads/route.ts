import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { forumThreads, userProfiles } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const category = req.nextUrl.searchParams.get('category') ?? undefined

  const rows = await db
    .select({
      id:          forumThreads.id,
      title:       forumThreads.title,
      content:     forumThreads.content,
      authorId:    forumThreads.authorId,
      category:    forumThreads.category,
      isPinned:    forumThreads.isPinned,
      replyCount:  forumThreads.replyCount,
      createdAt:   forumThreads.createdAt,
      updatedAt:   forumThreads.updatedAt,
      displayName: userProfiles.displayName,
      avatarUrl:   userProfiles.avatarUrl,
    })
    .from(forumThreads)
    .leftJoin(userProfiles, eq(forumThreads.authorId, userProfiles.userId))
    .where(category ? eq(forumThreads.category, category) : undefined)
    .orderBy(desc(forumThreads.isPinned), desc(forumThreads.updatedAt))
    .limit(50)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { title, content, category } = await req.json() as {
    title?: string; content?: string; category?: string
  }

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  const validCategories = ['general', 'policy', 'technical', 'events']
  const cat = validCategories.includes(category ?? '') ? category! : 'general'

  const [thread] = await db
    .insert(forumThreads)
    .values({ title: title.trim(), content: content.trim(), authorId: userId, category: cat })
    .returning()

  return NextResponse.json(thread, { status: 201 })
}
