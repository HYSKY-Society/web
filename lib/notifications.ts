import { and, desc, eq, inArray, isNull, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications, userProfiles, users } from '@/lib/schema'
import { pusherServer } from '@/lib/pusher'

export type NotificationType = 'post' | 'like' | 'reply' | 'mention' | 'dm'

let notificationsTableReady: Promise<void> | null = null

export function ensureNotificationsTable(): Promise<void> {
  if (!notificationsTableReady) {
    notificationsTableReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id text PRIMARY KEY NOT NULL,
          user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          actor_id text REFERENCES users(id) ON DELETE SET NULL,
          type text NOT NULL,
          entity_id text,
          href text,
          read_at timestamp with time zone,
          created_at timestamp with time zone DEFAULT now() NOT NULL
        )
      `)
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS notifications_user_created_idx
        ON notifications (user_id, created_at DESC)
      `)
    })().catch((error) => {
      notificationsTableReady = null
      throw error
    })
  }
  return notificationsTableReady!
}

export async function createNotification({
  userId,
  actorId,
  type,
  entityId,
  href,
}: {
  userId: string
  actorId: string
  type: NotificationType
  entityId?: string
  href?: string
}) {
  if (userId === actorId) return
  await ensureNotificationsTable()
  const [notification] = await db.insert(notifications).values({
    userId,
    actorId,
    type,
    entityId: entityId ?? null,
    href: href ?? null,
  }).returning({ id: notifications.id })

  await pusherServer.trigger(`private-notify-${userId}`, 'new-notification', {
    id: notification.id,
  }).catch(() => {})
}

export async function notifyNewPost(actorId: string, postId: string, excludedUserIds: string[] = []) {
  await ensureNotificationsTable()
  const excluded = new Set(excludedUserIds)
  const recipients = (await db.select({ id: users.id }).from(users).where(ne(users.id, actorId)))
    .filter((recipient) => !excluded.has(recipient.id))
  if (recipients.length) {
    await db.insert(notifications).values(recipients.map((recipient) => ({
      userId: recipient.id,
      actorId,
      type: 'post' as const,
      entityId: postId,
      href: `/feed#post-${postId}`,
    })))
  }

  await pusherServer.trigger('community-notifications', 'new-post', {
    actorId,
    postId,
  }).catch(() => {})
}

export async function removeNotification({
  userId,
  actorId,
  type,
  entityId,
}: {
  userId: string
  actorId: string
  type: NotificationType
  entityId: string
}) {
  await ensureNotificationsTable()
  await db.delete(notifications).where(and(
    eq(notifications.userId, userId),
    eq(notifications.actorId, actorId),
    eq(notifications.type, type),
    eq(notifications.entityId, entityId),
  ))
}

export async function markDirectMessageNotificationsRead(userId: string, actorId: string) {
  await ensureNotificationsTable()
  await db.update(notifications).set({ readAt: new Date() }).where(and(
    eq(notifications.userId, userId),
    eq(notifications.actorId, actorId),
    eq(notifications.type, 'dm'),
    isNull(notifications.readAt),
  ))
}

export async function hasUnreadDirectMessageNotification(userId: string, actorId: string) {
  await ensureNotificationsTable()
  const [notification] = await db.select({ id: notifications.id }).from(notifications).where(and(
    eq(notifications.userId, userId),
    eq(notifications.actorId, actorId),
    eq(notifications.type, 'dm'),
    isNull(notifications.readAt),
  )).limit(1)

  return Boolean(notification)
}

export async function getNotifications(userId: string) {
  await ensureNotificationsTable()
  const rows = await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(40)

  const actorIds = [...new Set(rows.flatMap((row) => row.actorId ? [row.actorId] : []))]
  const actors = actorIds.length
    ? await db.select({
        userId: userProfiles.userId,
        displayName: userProfiles.displayName,
        avatarUrl: userProfiles.avatarUrl,
      }).from(userProfiles).where(inArray(userProfiles.userId, actorIds))
    : []
  const actorMap = new Map(actors.map((actor) => [actor.userId, actor]))

  return rows.map((row) => ({
    ...row,
    actor: row.actorId ? actorMap.get(row.actorId) ?? null : null,
  }))
}
