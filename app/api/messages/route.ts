import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, userProfiles, users } from '@/lib/schema'
import { desc, eq, inArray, or } from 'drizzle-orm'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const email = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  const tier = await getUserTier(user.id)
  if (!hasVipCommunityAccess(tier) && !isAdmin(email)) {
    return NextResponse.json({ error: 'VIP membership required' }, { status: 403 })
  }

  try {
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
          unreadCount: message.toUserId === user.id && !message.readAt ? 1 : 0,
        })
      } else if (message.toUserId === user.id && !message.readAt) {
        existing.unreadCount += 1
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
