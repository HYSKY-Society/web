import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { profileContacts } from '@/lib/schema'

let contactsTableReady: Promise<void> | null = null

export async function ensureProfileContactsTable() {
  if (!contactsTableReady) {
    contactsTableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS profile_contacts (
        user_id text PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_website text,
        phone_number text,
        additional_emails text,
        phone_numbers text,
        company_what_we_do text,
        company_city text,
        company_state text,
        company_country text,
        contact_city text,
        contact_state text,
        contact_country text,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `).then(async () => {
      await db.execute(sql`
        ALTER TABLE profile_contacts
          ADD COLUMN IF NOT EXISTS additional_emails text,
          ADD COLUMN IF NOT EXISTS phone_numbers text,
          ADD COLUMN IF NOT EXISTS company_what_we_do text,
          ADD COLUMN IF NOT EXISTS company_city text,
          ADD COLUMN IF NOT EXISTS company_state text,
          ADD COLUMN IF NOT EXISTS company_country text,
          ADD COLUMN IF NOT EXISTS contact_city text,
          ADD COLUMN IF NOT EXISTS contact_state text,
          ADD COLUMN IF NOT EXISTS contact_country text
      `)
    }).catch((error) => {
      contactsTableReady = null
      throw error
    })
  }
  return contactsTableReady
}

export async function getProfileContacts(userId: string) {
  await ensureProfileContactsTable()
  return (await db.query.profileContacts.findFirst({
    where: eq(profileContacts.userId, userId),
  })) ?? null
}

export async function upsertProfileContacts(userId: string, data: {
  companyWebsite?: string | null
  phoneNumber?: string | null
  additionalEmails?: string
  phoneNumbers?: string
  companyWhatWeDo?: string | null
  companyCity?: string | null
  companyState?: string | null
  companyCountry?: string | null
  contactCity?: string | null
  contactState?: string | null
  contactCountry?: string | null
}) {
  await ensureProfileContactsTable()
  await db.insert(profileContacts)
    .values({ userId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: profileContacts.userId,
      set: { ...data, updatedAt: new Date() },
    })
}
