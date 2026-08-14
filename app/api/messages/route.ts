import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, notifications, userProfiles, users } from '@/lib/schema'
import { and, desc, eq, inArray, isNull, or } from 'drizzle-orm'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { ensureNotificationsTable } from '@/lib/notifications'

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const tier = await getUserTier(user.id)
  if (!hasVipCommunityAccess(tier)) {
    return NextResponse.json({ error: 'VIP membership required' }, { status: 403 })
  }

  try {
    await ensureNotificationsTable()
    const unreadDmNotifications = await db
      .select({ actorId: notifications.actorId })
      .from(notifications)
      .where(and(
        eq(notifications.userId, user.id),
        eq(notifications.type, 'dm'),
        isNull(notifications.readAt),
      ))
    const unreadBySender = new Map<string, number>()
    for (const notification of unreadDmNotifications) {
      if (!notification.actorId) continue
      unreadBySender.set(notification.actorId, (unreadBySender.get(notification.actorId) ?? 0) + 1)
    }

    const messages = await db
      .select()
      .from(directMessages)
      .where(or(eq(directMessages.fromUserId, user.id), eq(directMessages.toUserId, user.id)))
      .orderBy(desc(directMessages.createdAt))
      .limit(2000)

    const conversations = new Map<string, {
      userId: string
      lastMessage: string
      lastMessageAt: Date
      lastMessageFromMe: boolean
      unreadCount: number
    }>()

    for (const message of messages) {
      const otherId = message.fromUserId === user.id ? message.toUserId : message.fromUserId
      const existing = conversations.get(otherId)

      if (!existing) {
        conversations.set(otherId, {
          userId: otherId,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          lastMessageFromMe: message.fromUserId === user.id,
          unreadCount: unreadBySender.get(otherId) ?? 0,
        })
      }
    }

    const ids = Array.from(conversations.keys())
    if (ids.length === 0) return NextResponse.json([])

    const members = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: userProfiles.displayName,
        headline: userProfiles.headline,
        avatarUrl: userProfiles.avatarUrl,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(inArray(users.id, ids))

    const memberById = new Map(members.map((member) => [member.id, member]))

    return NextResponse.json(
      Array.from(conversations.values()).map((conversation) => {
        const member = memberById.get(conversation.userId)
        return {
          ...conversation,
          displayName: member?.displayName ?? member?.email.split('@')[0] ?? 'Member',
          headline: member?.headline ?? null,
          avatarUrl: member?.avatarUrl ?? null,
        }
      })
    )
  } catch {
    return NextResponse.json([])
  }
}
