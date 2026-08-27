import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, userProfiles, users } from '@/lib/schema'
import { and, or, eq, asc, isNull } from 'drizzle-orm'
import { pusherServer, dmChannelName } from '@/lib/pusher'
import { getMemberProfile, getUserTier, hasVipCommunityAccess } from '@/lib/members'
import {
  createNotification,
  markDirectMessageNotificationsRead,
} from '@/lib/notifications'
import { sendDirectMessageEmail } from '@/lib/direct-message-email'
import { getPendingConversation, queuePendingDirectMessage } from '@/lib/pending-direct-messages'

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
    if (otherId.startsWith('pending-') || otherId.startsWith('pending:')) {
      const pendingMember = await getMemberProfile(otherId)
      if (!pendingMember?.isPending) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      const queued = await getPendingConversation(myId, pendingMember.email)
      return NextResponse.json(queued.map((message) => ({
        id: message.id,
        fromUserId: message.fromUserId,
        toUserId: otherId,
        content: message.content,
        readAt: null,
        createdAt: message.createdAt,
        pending: true,
      })))
    }

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
  if (content.trim().length > 5_000) return NextResponse.json({ error: 'Message is too long' }, { status: 400 })

  try {
    const senderProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, myId),
    })
    const fromName   = senderProfile?.displayName ?? 'A HySky Connect member'
    const fromAvatar = senderProfile?.avatarUrl   ?? null

    if (toUserId.startsWith('pending-') || toUserId.startsWith('pending:')) {
      const pendingMember = await getMemberProfile(toUserId)
      if (!pendingMember?.isPending) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      const queued = await queuePendingDirectMessage({
        fromUserId: myId,
        toEmail: pendingMember.email,
        content: content.trim(),
      })

      await sendDirectMessageEmail({
        to: pendingMember.email,
        senderName: fromName,
      }).catch((error) => {
        console.error('[direct-message-email] Failed to notify pending member', error)
      })

      return NextResponse.json({
        id: queued.id,
        fromUserId: queued.fromUserId,
        toUserId,
        content: queued.content,
        readAt: null,
        createdAt: queued.createdAt,
        pending: true,
      })
    }

    const [msg] = await db
      .insert(directMessages)
      .values({ fromUserId: myId, toUserId, content: content.trim() })
      .returning()

    await createNotification({
      userId: toUserId,
      actorId: myId,
      type: 'dm',
      entityId: msg.id,
    }).catch(() => {})

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
