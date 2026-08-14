import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, users } from '@/lib/schema'
import { and, or, eq, asc } from 'drizzle-orm'
import { getProfile, getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { notFound, redirect } from 'next/navigation'
import DMChatClient from './DMChatClient'

export default async function DMConversationPage({ params }: { params: { userId: string } }) {
  const clerkUser = await currentUser()
  const myId = clerkUser!.id  const tier = await getUserTier(myId)
  if (!hasVipCommunityAccess(tier)) redirect('/messages')

  const otherId = params.userId

  const [otherProfile, otherUser] = await Promise.all([
    getProfile(otherId),
    db.query.users.findFirst({ where: eq(users.id, otherId) }),
  ])
  if (!otherUser) notFound()

  const otherName   = otherProfile?.displayName ?? otherUser!.email.split('@')[0]
  const otherAvatar = otherProfile?.avatarUrl   ?? null

  const messages = await db
    .select()
    .from(directMessages)
    .where(
      or(
        and(eq(directMessages.fromUserId, myId),    eq(directMessages.toUserId, otherId)),
        and(eq(directMessages.fromUserId, otherId),  eq(directMessages.toUserId, myId)),
      )
    )
    .orderBy(asc(directMessages.createdAt))
    .limit(100)

  return (
    <DMChatClient
      myId={myId}
      otherId={otherId}
      otherName={otherName}
      otherAvatar={otherAvatar}
      initialMessages={messages.map(m => ({
        id:         m.id,
        fromUserId: m.fromUserId,
        toUserId:   m.toUserId,
        content:    m.content,
        createdAt:  m.createdAt.toISOString(),
      }))}
    />
  )
}
