import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, userProfiles } from '@/lib/schema'
import { and, or, eq, asc } from 'drizzle-orm'
import { pusherServer, dmChannelName } from '@/lib/pusher'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isAdmin } from '@/lib/admin'

async function getAuthorizedUserId(): Promise<string | null> {
  const user = await currentUser()
  if (!user) return null
  const email = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  const tier = await getUserTier(user.id)
  return hasVipCommunityAccess(tier) || isAdmin(email) ? user.id : null
}

export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const myId = await getAuthorizedUserId()
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
  const myId = await getAuthorizedUserId()
  if (!myId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const toUserId = params.userId
  const { content } = await req.json() as { content?: string }
  if (!content?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  try {
    const [msg] = await db
      .insert(directMessages)
      .values({ fromUserId: myId, toUserId, content: content.trim() })
      .returning()

    // Fetch sender profile for notification payload
    const senderProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, myId),
    })
    const fromName   = senderProfile?.displayName ?? 'Member'
    const fromAvatar = senderProfile?.avatarUrl   ?? null

    // Deliver to DM channel (both parties receive new message)
    await pusherServer.trigger(
      dmChannelName(myId, toUserId),
      'new-message',
      msg,
    ).catch(() => {})

    // Notify recipient on their personal notification channel
    await pusherServer.trigger(
      `private-notify-${toUserId}`,
      'new-dm',
      {
        id:         msg.id,
        fromId:     myId,
        fromName,
        fromAvatar,
        preview:    content.trim().slice(0, 100),
      },
    ).catch(() => {})

    return NextResponse.json(msg)
  } catch {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
