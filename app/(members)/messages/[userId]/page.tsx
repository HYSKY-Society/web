import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, userProfiles } from '@/lib/schema'
import { and, or, eq, asc } from 'drizzle-orm'
import { getProfile } from '@/lib/members'
import { notFound } from 'next/navigation'
import DMChatClient from './DMChatClient'

export default async function DMConversationPage({ params }: { params: { userId: string } }) {
  const clerkUser = await currentUser()
  const myId = clerkUser!.id
  const otherId = params.userId

  const otherProfile = await getProfile(otherId)
  if (!otherProfile) notFound()

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
      otherName={otherProfile.displayName ?? 'Member'}
      otherAvatar={otherProfile.avatarUrl ?? null}
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
