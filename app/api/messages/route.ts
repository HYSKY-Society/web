import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, notifications, pendingTiers, userProfiles, users } from '@/lib/schema'
import { and, desc, eq, inArray, isNull, or } from 'drizzle-orm'
import { getUserTier, hasVipCommunityAccess, pendingMemberId } from '@/lib/members'
import { ensureNotificationsTable } from '@/lib/notifications'
import { getPendingMessagesFromUser } from '@/lib/pending-direct-messages'

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

    const [messages, pendingMessages] = await Promise.all([
      db
        .select()
        .from(directMessages)
        .where(or(eq(directMessages.fromUserId, user.id), eq(directMessages.toUserId, user.id)))
        .orderBy(desc(directMessages.createdAt))
        .limit(2000),
      getPendingMessagesFromUser(user.id),
    ])

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

    const pendingByEmail = new Map<string, typeof pendingMessages[number]>()
    for (const message of pendingMessages) {
      if (!pendingByEmail.has(message.toEmail)) pendingByEmail.set(message.toEmail, message)
    }

    const ids = Array.from(conversations.keys())

    const pendingEmails = Array.from(pendingByEmail.keys())
    const [members, pendingMembers] = await Promise.all([
      ids.length > 0
        ? db
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
        : Promise.resolve([]),
      pendingEmails.length > 0
        ? db
            .select({
              email: pendingTiers.email,
              name: pendingTiers.name,
              avatarUrl: pendingTiers.avatarUrl,
            })
            .from(pendingTiers)
            .where(inArray(pendingTiers.email, pendingEmails))
        : Promise.resolve([]),
    ])

    const memberById = new Map(members.map((member) => [member.id, member]))

    const activeConversations = Array.from(conversations.values()).map((conversation) => {
        const member = memberById.get(conversation.userId)
        return {
          ...conversation,
          displayName: member?.displayName ?? member?.email.split('@')[0] ?? 'Member',
          headline: member?.headline ?? null,
          avatarUrl: member?.avatarUrl ?? null,
        }
      })

    const pendingMemberByEmail = new Map(pendingMembers.map((member) => [member.email, member]))
    const queuedConversations = Array.from(pendingByEmail.entries()).map(([email, message]) => {
      const member = pendingMemberByEmail.get(email)
      return {
        userId: `pending-${pendingMemberId(email)}`,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
        lastMessageFromMe: true,
        unreadCount: 0,
        displayName: member?.name ?? email.split('@')[0] ?? 'Member',
        headline: null,
        avatarUrl: member?.avatarUrl ?? null,
      }
    })

    return NextResponse.json([...activeConversations, ...queuedConversations]
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()))
  } catch {
    return NextResponse.json([])
  }
}
