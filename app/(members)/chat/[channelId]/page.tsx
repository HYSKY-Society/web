import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { chatChannels, chatMessages, userProfiles } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { getProfile } from '@/lib/members'
import ChannelChatClient from './ChannelChatClient'

export default async function ChannelPage({ params }: { params: { channelId: string } }) {
  const clerkUser = await currentUser()
  const myId = clerkUser!.id

  const channel = await db.query.chatChannels.findFirst({
    where: eq(chatChannels.id, params.channelId),
  })
  if (!channel) notFound()

  const myProfile = await getProfile(myId)

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

  return (
    <ChannelChatClient
      myId={myId}
      myName={myProfile?.displayName ?? 'Member'}
      myAvatar={myProfile?.avatarUrl ?? null}
      channel={{ id: channel.id, name: channel.name, icon: channel.icon }}
      initialMessages={rows.reverse().map(m => ({
        id:          m.id,
        channelId:   m.channelId,
        userId:      m.userId,
        content:     m.content,
        createdAt:   m.createdAt.toISOString(),
        displayName: m.displayName ?? 'Member',
        avatarUrl:   m.avatarUrl ?? null,
      }))}
    />
  )
}
