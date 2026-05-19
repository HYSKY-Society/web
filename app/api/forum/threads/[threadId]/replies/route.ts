import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { forumReplies, forumThreads, userProfiles } from '@/lib/schema'
import { eq, asc, sql } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: { threadId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const rows = await db
    .select({
      id:          forumReplies.id,
      threadId:    forumReplies.threadId,
      authorId:    forumReplies.authorId,
      content:     forumReplies.content,
      createdAt:   forumReplies.createdAt,
      displayName: userProfiles.displayName,
      avatarUrl:   userProfiles.avatarUrl,
    })
    .from(forumReplies)
    .leftJoin(userProfiles, eq(forumReplies.authorId, userProfiles.userId))
    .where(eq(forumReplies.threadId, params.threadId))
    .orderBy(asc(forumReplies.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { content } = await req.json() as { content?: string }
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const [reply] = await db
    .insert(forumReplies)
    .values({ threadId: params.threadId, authorId: userId, content: content.trim() })
    .returning()

  await db
    .update(forumThreads)
    .set({
      replyCount: sql`${forumThreads.replyCount} + 1`,
      updatedAt:  new Date(),
    })
    .where(eq(forumThreads.id, params.threadId))

  return NextResponse.json(reply, { status: 201 })
}
