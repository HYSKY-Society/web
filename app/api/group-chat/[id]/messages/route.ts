import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { groupChats, groupChatMembers, groupMessages, userProfiles } from '@/lib/schema'
import { eq, and, asc } from 'drizzle-orm'
import { pusherServer, gmChannelName } from '@/lib/pusher'

async function assertMember(groupId: string, userId: string) {
  const rows = await db.select().from(groupChatMembers)
    .where(and(eq(groupChatMembers.groupId, groupId), eq(groupChatMembers.userId, userId)))
    .limit(1)
  return rows.length > 0
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await assertMember(params.id, userId))) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const msgs = await db
    .select({
      id:         groupMessages.id,
      groupId:    groupMessages.groupId,
      fromUserId: groupMessages.fromUserId,
      content:    groupMessages.content,
      createdAt:  groupMessages.createdAt,
      fromName:   userProfiles.displayName,
      fromAvatar: userProfiles.avatarUrl,
    })
    .from(groupMessages)
    .leftJoin(userProfiles, eq(groupMessages.fromUserId, userProfiles.userId))
    .where(eq(groupMessages.groupId, params.id))
    .orderBy(asc(groupMessages.createdAt))
    .limit(60)

  return Response.json(msgs)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await assertMember(params.id, userId))) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { content } = await req.json()
  if (!content?.trim()) return Response.json({ error: 'Content required' }, { status: 400 })

  const [profile] = await db
    .select({ displayName: userProfiles.displayName, avatarUrl: userProfiles.avatarUrl })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1)

  const id = crypto.randomUUID()
  const createdAt = new Date()
  await db.insert(groupMessages).values({ id, groupId: params.id, fromUserId: userId, content: content.trim(), createdAt })

  const msg = {
    id,
    groupId:    params.id,
    fromUserId: userId,
    content:    content.trim(),
    createdAt,
    fromName:   profile?.displayName ?? null,
    fromAvatar: profile?.avatarUrl   ?? null,
  }

  await pusherServer.trigger(gmChannelName(params.id), 'new-message', msg)

  // Notify other members via their personal channel
  const [groupRow, members] = await Promise.all([
    db.select({ name: groupChats.name }).from(groupChats).where(eq(groupChats.id, params.id)).limit(1),
    db.select({ userId: groupChatMembers.userId }).from(groupChatMembers).where(eq(groupChatMembers.groupId, params.id)),
  ])
  const groupName = groupRow[0]?.name ?? 'Group'

  await Promise.allSettled(
    members
      .filter(m => m.userId !== userId)
      .map(m =>
        pusherServer.trigger(`private-notify-${m.userId}`, 'new-gm', {
          id,
          groupId:   params.id,
          groupName,
          fromUserId: userId,
          fromName:  profile?.displayName ?? 'Member',
          preview:   content.slice(0, 60),
        })
      )
  )

  return Response.json(msg)
}
