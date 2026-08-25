import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, userProfiles, users } from '@/lib/schema'
import { and, or, eq, asc, isNull } from 'drizzle-orm'
import { pusherServer, dmChannelName } from '@/lib/pusher'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import {
  createNotification,
  hasUnreadDirectMessageNotification,
  markDirectMessageNotificationsRead,
} from '@/lib/notifications'
import { sendDirectMessageEmail } from '@/lib/direct-message-email'

async function getAuthorizedUserId(): Promise<string | null> {
  const user = await currentUser()
  if (!user) return null
  const tier = await getUserTier(user.id)
  return hasVipCommunityAccess(tier) ? user.id : null
}

export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const myId = await getAuthorizedUserId()
  if (!myId) return NextResponse.json({ error: 'VIP membership required' }, { status: 403 })

  const otherId = params.userId

  try {
    await db
      .update(directMessages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(directMessages.fromUserId, otherId),
          eq(directMessages.toUserId, myId),
          isNull(directMessages.readAt),
        )
      )

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
    await markDirectMessageNotificationsRead(myId, otherId).catch(() => {})
    return NextResponse.json(msgs)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const myId = await getAuthorizedUserId()
  if (!myId) return NextResponse.json({ error: 'VIP membership required' }, { status: 403 })

  const toUserId = params.userId
  const { content } = await req.json() as { content?: string }
  if (!content?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  try {
    const shouldEmailRecipient = await hasUnreadDirectMessageNotification(toUserId, myId)
      .then((hasUnread) => !hasUnread)
      .catch(() => false)

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

    await createNotification({
      userId: toUserId,
      actorId: myId,
      type: 'dm',
      entityId: msg.id,
    }).catch(() => {})

    if (shouldEmailRecipient) {
      const recipient = await db.query.users.findFirst({
        where: eq(users.id, toUserId),
        columns: { email: true },
      })

      if (recipient?.email) {
        await sendDirectMessageEmail({
          to: recipient.email,
          senderName: fromName,
        }).catch((error) => {
          console.error('[direct-message-email] Failed to send notification', error)
        })
      }
    }

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
