import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { groupChatMembers } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const isMember = await db.select().from(groupChatMembers)
    .where(and(eq(groupChatMembers.groupId, params.id), eq(groupChatMembers.userId, userId)))
    .limit(1)
  if (!isMember.length) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { memberId } = await req.json()
  if (!memberId) return Response.json({ error: 'memberId required' }, { status: 400 })

  await db.insert(groupChatMembers).values({ groupId: params.id, userId: memberId }).onConflictDoNothing()
  return Response.json({ ok: true })
}
