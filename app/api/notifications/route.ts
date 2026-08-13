import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications } from '@/lib/schema'
import { ensureNotificationsTable, getNotifications } from '@/lib/notifications'

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const items = await getNotifications(user.id)
  return NextResponse.json({
    items,
    unreadCount: items.filter((item) => !item.readAt).length,
  })
}

export async function PATCH(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  await ensureNotificationsTable()
  const body = await req.json().catch(() => ({})) as { id?: string; all?: boolean }
  const now = new Date()

  if (body.all) {
    await db.update(notifications).set({ readAt: now }).where(and(
      eq(notifications.userId, user.id),
      isNull(notifications.readAt),
    ))
  } else if (body.id) {
    await db.update(notifications).set({ readAt: now }).where(and(
      eq(notifications.id, body.id),
      eq(notifications.userId, user.id),
    ))
  } else {
    return NextResponse.json({ error: 'Missing notification id' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
