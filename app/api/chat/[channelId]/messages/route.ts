import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { chatMessages, chatChannels, userProfiles } from '@/lib/schema'
import { eq, asc, desc } from 'drizzle-orm'
import { pusherServer, chatChannelName } from '@/lib/pusher'
import { getProfile } from '@/lib/members'

export async function GET(_req: NextRequest, { params }: { params: { channelId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const channel = await db.query.chatChannels.findFirst({
    where: eq(chatChannels.id, params.channelId),
  })
  if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rows = await db
    .select({
      id:          chatMessages.id,
      channelId:   chatMessages.channelId,
      userId:      chatMessages.userId,
      content:     chatMessages.content,
      createdAt:   chatMessages.createdAt,
      displayName: userProfiles.displayName,
      avatarUrl:   userProfiles.avatarUrl,
    })
    .from(chatMessages)
    .leftJoin(userProfiles, eq(chatMessages.userId, userProfiles.userId))
    .where(eq(chatMessages.channelId, params.channelId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(60)

  return NextResponse.json(rows.reverse())
}

export async function POST(req: NextRequest, { params }: { params: { channelId: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { content } = await req.json() as { content?: string }
  if (!content?.trim()) return NextResponse.json({ error: 'Empty' }, { status: 400 })

  const [msg] = await db
    .insert(chatMessages)
    .values({ channelId: params.channelId, userId, content: content.trim() })
    .returning()

  const profile = await getProfile(userId)
  const payload = {
    ...msg,
    displayName: profile?.displayName ?? 'Member',
    avatarUrl:   profile?.avatarUrl ?? null,
  }

  await pusherServer.trigger(
    chatChannelName(params.channelId),
    'new-message',
    payload,
  ).catch(() => {})

  return NextResponse.json(payload)
}
