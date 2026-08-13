import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, userProfiles } from '@/lib/schema'
import { desc, eq, sql } from 'drizzle-orm'

const ONLINE_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

export async function POST() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const now = new Date()

  try {
    await db
      .insert(userProfiles)
      .values({ userId, lastSeenAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { lastSeenAt: now },
      })
  } catch {
    // table may not have last_seen_at column yet — ignore
  }

  return NextResponse.json(await getOnlineUsers(userId))
}

export async function GET(request: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === 'true'

  return NextResponse.json(all ? await getAllUsers(userId) : await getOnlineUsers(userId))
}

async function getOnlineUsers(excludeUserId: string) {
  const since = new Date(Date.now() - ONLINE_WINDOW_MS)
  try {
    const rows = await db
      .select({
        id:          users.id,
        displayName: userProfiles.displayName,
        headline:    userProfiles.headline,
        avatarUrl:   userProfiles.avatarUrl,
        lastSeenAt:  userProfiles.lastSeenAt,
      })
      .from(userProfiles)
      .innerJoin(users, eq(userProfiles.userId, users.id))
      .where(
        sql`${userProfiles.lastSeenAt} >= ${since} AND ${userProfiles.userId} != ${excludeUserId} AND ${userProfiles.isVisible} = true`
      )
    return rows
  } catch {
    return []
  }
}

async function getAllUsers(excludeUserId: string) {
  try {
    const rows = await db
      .select({
        id:          users.id,
        displayName: userProfiles.displayName,
        headline:    userProfiles.headline,
        avatarUrl:   userProfiles.avatarUrl,
        lastSeenAt:  userProfiles.lastSeenAt,
      })
      .from(userProfiles)
      .innerJoin(users, eq(userProfiles.userId, users.id))
      .where(
        sql`${userProfiles.userId} != ${excludeUserId} AND ${userProfiles.isVisible} = true`
      )
      .orderBy(desc(userProfiles.lastSeenAt))
    return rows
  } catch {
    return []
  }
}
