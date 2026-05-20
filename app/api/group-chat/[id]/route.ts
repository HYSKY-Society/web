import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { groupChats, groupChatMembers } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await db.select().from(groupChatMembers)
    .where(and(eq(groupChatMembers.groupId, params.id), eq(groupChatMembers.userId, userId)))
    .limit(1)
  if (!member.length) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 })

  await db.update(groupChats).set({ name: name.trim() }).where(eq(groupChats.id, params.id))
  return Response.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const group = await db.select().from(groupChats)
    .where(and(eq(groupChats.id, params.id), eq(groupChats.createdBy, userId)))
    .limit(1)
  if (!group.length) return Response.json({ error: 'Forbidden — only creator can delete' }, { status: 403 })

  await db.delete(groupChats).where(eq(groupChats.id, params.id))
  return Response.json({ ok: true })
}
