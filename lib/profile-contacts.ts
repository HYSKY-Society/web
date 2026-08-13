import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { profileContacts } from '@/lib/schema'

let contactsTableReady: Promise<void> | null = null

async function ensureProfileContactsTable() {
  if (!contactsTableReady) {
    contactsTableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS profile_contacts (
        user_id text PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_website text,
        phone_number text,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `).then(() => undefined).catch((error) => {
      contactsTableReady = null
      throw error
    })
  }
  return contactsTableReady
}

export async function getProfileContacts(userId: string) {
  await ensureProfileContactsTable()
  return db.query.profileContacts.findFirst({
    where: eq(profileContacts.userId, userId),
  }) ?? null
}

export async function upsertProfileContacts(userId: string, data: {
  companyWebsite?: string | null
  phoneNumber?: string | null
}) {
  await ensureProfileContactsTable()
  await db.insert(profileContacts)
    .values({ userId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: profileContacts.userId,
      set: { ...data, updatedAt: new Date() },
    })
}
