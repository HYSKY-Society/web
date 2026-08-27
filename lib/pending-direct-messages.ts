import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { db } from './db'
import { directMessages, notifications, pendingDirectMessages } from './schema'
import { ensureNotificationsTable } from './notifications'

let tableReady: Promise<void> | null = null

export function ensurePendingDirectMessagesTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pending_direct_messages (
          id text PRIMARY KEY,
          from_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          to_email text NOT NULL,
          content text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `)
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS pending_direct_messages_recipient_idx
          ON pending_direct_messages (to_email, created_at)
      `)
    })().catch((error) => {
      tableReady = null
      throw error
    })
  }
  return tableReady
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function queuePendingDirectMessage({
  fromUserId,
  toEmail,
  content,
}: {
  fromUserId: string
  toEmail: string
  content: string
}) {
  await ensurePendingDirectMessagesTable()
  const [message] = await db
    .insert(pendingDirectMessages)
    .values({ fromUserId, toEmail: normalizeEmail(toEmail), content })
    .returning()
  return message
}

export async function getPendingConversation(fromUserId: string, toEmail: string) {
  await ensurePendingDirectMessagesTable()
  return db
    .select()
    .from(pendingDirectMessages)
    .where(and(
      eq(pendingDirectMessages.fromUserId, fromUserId),
      eq(pendingDirectMessages.toEmail, normalizeEmail(toEmail)),
    ))
    .orderBy(asc(pendingDirectMessages.createdAt))
}

export async function getPendingMessagesFromUser(fromUserId: string) {
  await ensurePendingDirectMessagesTable()
  return db
    .select()
    .from(pendingDirectMessages)
    .where(eq(pendingDirectMessages.fromUserId, fromUserId))
    .orderBy(desc(pendingDirectMessages.createdAt))
}

export async function claimPendingDirectMessages(email: string, toUserId: string) {
  await ensurePendingDirectMessagesTable()
  const normalizedEmail = normalizeEmail(email)
  const queued = await db
    .select()
    .from(pendingDirectMessages)
    .where(eq(pendingDirectMessages.toEmail, normalizedEmail))
    .orderBy(asc(pendingDirectMessages.createdAt))

  if (queued.length === 0) return 0

  await db.insert(directMessages).values(queued.map((message) => ({
    id: message.id,
    fromUserId: message.fromUserId,
    toUserId,
    content: message.content,
    createdAt: message.createdAt,
  }))).onConflictDoNothing()

  await ensureNotificationsTable()
  await db.insert(notifications).values(queued.map((message) => ({
    userId: toUserId,
    actorId: message.fromUserId,
    type: 'dm',
    entityId: message.id,
  }))).catch(() => {})

  await db.delete(pendingDirectMessages).where(eq(pendingDirectMessages.toEmail, normalizedEmail))
  return queued.length
}
