import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications } from '@/lib/schema'
import { ensureNotificationsTable, getNotifications } from '@/lib/notifications'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const items = await getNotifications(userId)
  return NextResponse.json({
    items,
    unreadCount: items.filter((item) => !item.readAt).length,
  })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  await ensureNotificationsTable()
  const body = await req.json().catch(() => ({})) as { id?: string; all?: boolean }
  const now = new Date()

  if (body.all) {
    await db.update(notifications).set({ readAt: now }).where(and(
      eq(notifications.userId, userId),
      isNull(notifications.readAt),
    ))
  } else if (body.id) {
    await db.update(notifications).set({ readAt: now }).where(and(
      eq(notifications.id, body.id),
      eq(notifications.userId, userId),
    ))
  } else {
    return NextResponse.json({ error: 'Missing notification id' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
