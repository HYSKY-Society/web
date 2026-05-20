import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { groupChats, groupChatMembers } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({ id: groupChats.id, name: groupChats.name, createdBy: groupChats.createdBy, createdAt: groupChats.createdAt })
    .from(groupChatMembers)
    .innerJoin(groupChats, eq(groupChatMembers.groupId, groupChats.id))
    .where(eq(groupChatMembers.userId, userId))
    .orderBy(desc(groupChats.createdAt))

  return Response.json(rows)
}

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 })

  const id = crypto.randomUUID()
  await db.transaction(async (tx) => {
    await tx.insert(groupChats).values({ id, name: name.trim(), createdBy: userId })
    await tx.insert(groupChatMembers).values({ groupId: id, userId })
  })

  return Response.json({ id, name: name.trim(), createdBy: userId })
}
