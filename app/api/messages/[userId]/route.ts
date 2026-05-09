import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages } from '@/lib/schema'
import { and, or, eq, asc } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId: myId } = auth()
  if (!myId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const otherId = params.userId

  try {
    const msgs = await db
      .select()
      .from(directMessages)
      .where(
        or(
          and(eq(directMessages.fromUserId, myId),    eq(directMessages.toUserId, otherId)),
          and(eq(directMessages.fromUserId, otherId),  eq(directMessages.toUserId, myId))
        )
      )
      .orderBy(asc(directMessages.createdAt))
    return NextResponse.json(msgs)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId: myId } = auth()
  if (!myId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { content } = await req.json() as { content?: string }
  if (!content?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  try {
    const [msg] = await db
      .insert(directMessages)
      .values({ fromUserId: myId, toUserId: params.userId, content: content.trim() })
      .returning()
    return NextResponse.json(msg)
  } catch {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
