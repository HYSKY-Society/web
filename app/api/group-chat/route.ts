import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { groupChats, groupChatMembers, userProfiles } from '@/lib/schema'
import { eq, desc, inArray } from 'drizzle-orm'

export async function GET() {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({ id: groupChats.id, name: groupChats.name, createdBy: groupChats.createdBy })
    .from(groupChatMembers)
    .innerJoin(groupChats, eq(groupChatMembers.groupId, groupChats.id))
    .where(eq(groupChatMembers.userId, userId))
    .orderBy(desc(groupChats.createdAt))

  if (rows.length === 0) return Response.json([])

  // Fetch all members for these groups in one query
  const groupIds = rows.map(r => r.id)
  const allMembers = await db
    .select({
      groupId:     groupChatMembers.groupId,
      userId:      groupChatMembers.userId,
      displayName: userProfiles.displayName,
      avatarUrl:   userProfiles.avatarUrl,
    })
    .from(groupChatMembers)
    .leftJoin(userProfiles, eq(groupChatMembers.userId, userProfiles.userId))
    .where(inArray(groupChatMembers.groupId, groupIds))

  const membersByGroup = new Map<string, typeof allMembers>()
  for (const m of allMembers) {
    if (!membersByGroup.has(m.groupId)) membersByGroup.set(m.groupId, [])
    membersByGroup.get(m.groupId)!.push(m)
  }

  return Response.json(rows.map(r => ({ ...r, members: membersByGroup.get(r.id) ?? [] })))
}

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 })

  const id = crypto.randomUUID()
  try {
    await db.insert(groupChats).values({ id, name: name.trim(), createdBy: userId })
    await db.insert(groupChatMembers).values({ groupId: id, userId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 500 })
  }

  return Response.json({ id, name: name.trim(), createdBy: userId, members: [] })
}
