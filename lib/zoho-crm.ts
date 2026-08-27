import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pendingTiers, users, zohoPendingProfileDetails, zohoProfileDetails } from '@/lib/schema'

export type ZohoProfileData = {
  emails: string[]
  phoneNumbers: string[]
  accountName: string | null
  jobTitle: string | null
  companyWebsite: string | null
  companyWhatWeDo: string | null
  accountCity: string | null
  accountState: string | null
  accountCountry: string | null
  contactCity: string | null
  contactState: string | null
  contactCountry: string | null
  syncedAt: Date
}

type SnapshotContact = {
  id: string
  name: string
  emails: string[]
  phoneNumbers: string[]
  accountId: string | null
  accountName: string | null
  jobTitle: string | null
  city: string | null
  state: string | null
  country: string | null
}

type SnapshotAccount = {
  id: string
  name: string | null
  website: string | null
  whatWeDo: string | null
  industry: string | null
  city: string | null
  state: string | null
  country: string | null
}

type ZohoSnapshot = {
  version: 1
  generatedAt: string
  contacts: SnapshotContact[]
  accounts: SnapshotAccount[]
}

let zohoTableReady: Promise<void> | null = null

export async function ensureZohoProfileDetailsTable() {
  if (!zohoTableReady) {
    zohoTableReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS zoho_profile_details (
          user_id text PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          zoho_contact_id text NOT NULL,
          contact_name text,
          emails text DEFAULT '[]' NOT NULL,
          phone_numbers text DEFAULT '[]' NOT NULL,
          account_id text,
          account_name text,
          job_title text,
          company_website text,
          company_what_we_do text,
          account_industry text,
          account_city text,
          account_state text,
          account_country text,
          contact_city text,
          contact_state text,
          contact_country text,
          synced_at timestamp with time zone DEFAULT now() NOT NULL
        )
      `)
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS zoho_pending_profile_details (
          email text PRIMARY KEY NOT NULL,
          zoho_contact_id text NOT NULL,
          contact_name text,
          emails text DEFAULT '[]' NOT NULL,
          phone_numbers text DEFAULT '[]' NOT NULL,
          account_id text,
          account_name text,
          job_title text,
          company_website text,
          company_what_we_do text,
          account_industry text,
          account_city text,
          account_state text,
          account_country text,
          contact_city text,
          contact_state text,
          contact_country text,
          synced_at timestamp with time zone DEFAULT now() NOT NULL
        )
      `)
      await db.execute(sql`
        ALTER TABLE zoho_profile_details
          ADD COLUMN IF NOT EXISTS contact_name text,
          ADD COLUMN IF NOT EXISTS account_industry text,
          ADD COLUMN IF NOT EXISTS account_city text,
          ADD COLUMN IF NOT EXISTS account_state text,
          ADD COLUMN IF NOT EXISTS account_country text,
          ADD COLUMN IF NOT EXISTS contact_city text,
          ADD COLUMN IF NOT EXISTS contact_state text,
          ADD COLUMN IF NOT EXISTS contact_country text
      `)
      await db.execute(sql`
        ALTER TABLE zoho_pending_profile_details
          ADD COLUMN IF NOT EXISTS contact_name text,
          ADD COLUMN IF NOT EXISTS account_industry text,
          ADD COLUMN IF NOT EXISTS account_city text,
          ADD COLUMN IF NOT EXISTS account_state text,
          ADD COLUMN IF NOT EXISTS account_country text,
          ADD COLUMN IF NOT EXISTS contact_city text,
          ADD COLUMN IF NOT EXISTS contact_state text,
          ADD COLUMN IF NOT EXISTS contact_country text
      `)
    })().catch((error) => {
      zohoTableReady = null
      throw error
    })
  }
  return zohoTableReady
}

function parseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function cleanString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Map(
    value
      .map(cleanString)
      .filter((item): item is string => Boolean(item))
      .map((item) => [item.toLowerCase(), item]),
  ).values()]
}

function familyName(value: string) {
  const parts = value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return parts.length > 1 ? parts.at(-1)!.replace(/[^a-z0-9]/g, '') : ''
}

function mergeDuplicateContacts(candidates: SnapshotContact[], preferred?: SnapshotContact): SnapshotContact | null {
  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  const familyNames = new Set(candidates.map((contact) => familyName(contact.name)).filter(Boolean))
  if (familyNames.size !== 1 || candidates.some((contact) => !familyName(contact.name))) return null

  const score = (contact: SnapshotContact) => [
    contact.accountId,
    contact.accountName,
    contact.jobTitle,
    ...contact.phoneNumbers,
  ].filter(Boolean).length
  const primary = preferred ?? [...candidates].sort((a, b) => score(b) - score(a))[0]
  const locationSource = [...candidates].sort((a, b) =>
    [b.city, b.state, b.country].filter(Boolean).length - [a.city, a.state, a.country].filter(Boolean).length,
  )[0]

  return {
    ...primary,
    emails: [...new Set(candidates.flatMap((contact) => contact.emails))],
    phoneNumbers: [...new Set(candidates.flatMap((contact) => contact.phoneNumbers))],
    city: locationSource.city ?? candidates.find((contact) => contact.city)?.city ?? null,
    state: locationSource.state ?? candidates.find((contact) => contact.state)?.state ?? null,
    country: locationSource.country ?? candidates.find((contact) => contact.country)?.country ?? null,
  }
}

function parseSnapshot(value: unknown): ZohoSnapshot {
  if (!value || typeof value !== 'object') throw new Error('This is not a valid Zoho snapshot.')
  const candidate = value as Partial<ZohoSnapshot>
  if (candidate.version !== 1 || !Array.isArray(candidate.contacts) || !Array.isArray(candidate.accounts)) {
    throw new Error('This Zoho snapshot format is not supported.')
  }

  const contacts = candidate.contacts.map((contact) => ({
    id: cleanString(contact?.id) ?? '',
    name: cleanString(contact?.name) ?? 'Unnamed contact',
    emails: cleanStringArray(contact?.emails),
    phoneNumbers: cleanStringArray(contact?.phoneNumbers),
    accountId: cleanString(contact?.accountId),
    accountName: cleanString(contact?.accountName),
    jobTitle: cleanString(contact?.jobTitle),
    city: cleanString(contact?.city),
    state: cleanString(contact?.state),
    country: cleanString(contact?.country),
  })).filter((contact) => contact.id)

  const accounts = candidate.accounts.map((account) => ({
    id: cleanString(account?.id) ?? '',
    name: cleanString(account?.name),
    website: cleanString(account?.website),
    whatWeDo: cleanString(account?.whatWeDo),
    industry: cleanString(account?.industry),
    city: cleanString(account?.city),
    state: cleanString(account?.state),
    country: cleanString(account?.country),
  })).filter((account) => account.id)

  return {
    version: 1,
    generatedAt: cleanString(candidate.generatedAt) ?? new Date().toISOString(),
    contacts,
    accounts,
  }
}

function profileDataFromRow(row: {
  emails: string
  phoneNumbers: string
  accountName: string | null
  jobTitle: string | null
  companyWebsite: string | null
  companyWhatWeDo: string | null
  accountCity: string | null
  accountState: string | null
  accountCountry: string | null
  contactCity: string | null
  contactState: string | null
  contactCountry: string | null
  syncedAt: Date
}): ZohoProfileData {
  return {
    emails: parseStringArray(row.emails),
    phoneNumbers: parseStringArray(row.phoneNumbers),
    accountName: row.accountName,
    jobTitle: row.jobTitle,
    companyWebsite: row.companyWebsite,
    companyWhatWeDo: row.companyWhatWeDo,
    accountCity: row.accountCity,
    accountState: row.accountState,
    accountCountry: row.accountCountry,
    contactCity: row.contactCity,
    contactState: row.contactState,
    contactCountry: row.contactCountry,
    syncedAt: row.syncedAt,
  }
}

export async function getZohoProfileDetails(userId: string, memberEmail?: string): Promise<ZohoProfileData | null> {
  await ensureZohoProfileDetailsTable()
  if (userId.startsWith('pending-') || userId.startsWith('pending:')) {
    if (!memberEmail) return null
    const row = await db.query.zohoPendingProfileDetails.findFirst({
      where: eq(zohoPendingProfileDetails.email, memberEmail.trim().toLowerCase()),
    })
    return row ? profileDataFromRow(row) : null
  }

  const row = await db.query.zohoProfileDetails.findFirst({
    where: eq(zohoProfileDetails.userId, userId),
  })
  return row ? profileDataFromRow(row) : null
}

export async function importZohoSnapshot(value: unknown) {
  const snapshot = parseSnapshot(value)
  await ensureZohoProfileDetailsTable()

  const [connectUsers, pendingMembers] = await Promise.all([
    db.select({ id: users.id, email: users.email }).from(users),
    db.select({ email: pendingTiers.email }).from(pendingTiers),
  ])
  const accountsById = new Map(snapshot.accounts.map((account) => [account.id, account]))
  const contactsByEmail = new Map<string, SnapshotContact[]>()
  const connectEmails = new Set(connectUsers.map((connectUser) => connectUser.email.trim().toLowerCase()))

  for (const contact of snapshot.contacts) {
    for (const email of contact.emails) {
      const key = email.toLowerCase()
      contactsByEmail.set(key, [...(contactsByEmail.get(key) ?? []), contact])
    }
  }

  const contactForEmail = (email: string) => {
    const direct = [...new Map(
      (contactsByEmail.get(email.trim().toLowerCase()) ?? []).map((contact) => [contact.id, contact]),
    ).values()]
    const connected = new Map(direct.map((contact) => [contact.id, contact]))
    for (const contact of direct) {
      for (const relatedEmail of contact.emails) {
        for (const related of contactsByEmail.get(relatedEmail.toLowerCase()) ?? []) {
          connected.set(related.id, related)
        }
      }
    }
    const exactSingleEmail = direct.filter((contact) => contact.emails.length === 1)
    const preferred = direct.length === 1 ? direct[0] : exactSingleEmail.length === 1 ? exactSingleEmail[0] : undefined
    return mergeDuplicateContacts([...connected.values()], preferred)
  }

  let matched = 0
  let unmatched = 0
  let ambiguous = 0
  let pendingMatched = 0
  let pendingUnmatched = 0
  let pendingAmbiguous = 0
  const rows: Array<typeof zohoProfileDetails.$inferInsert> = []
  const pendingRows: Array<typeof zohoPendingProfileDetails.$inferInsert> = []

  for (const connectUser of connectUsers) {
    const directCandidates = contactsByEmail.get(connectUser.email.trim().toLowerCase()) ?? []
    if (directCandidates.length === 0) {
      unmatched += 1
      continue
    }
    const contact = contactForEmail(connectUser.email)
    if (!contact) {
      ambiguous += 1
      continue
    }

    const account = contact.accountId ? accountsById.get(contact.accountId) : undefined
    rows.push({
      userId: connectUser.id,
      zohoContactId: contact.id,
      contactName: contact.name,
      emails: JSON.stringify(contact.emails),
      phoneNumbers: JSON.stringify(contact.phoneNumbers),
      accountId: contact.accountId,
      accountName: contact.accountName ?? account?.name ?? null,
      jobTitle: contact.jobTitle,
      companyWebsite: account?.website ?? null,
      companyWhatWeDo: account?.whatWeDo ?? null,
      accountIndustry: account?.industry ?? null,
      accountCity: account?.city ?? null,
      accountState: account?.state ?? null,
      accountCountry: account?.country ?? null,
      contactCity: contact.city,
      contactState: contact.state,
      contactCountry: contact.country,
      syncedAt: new Date(),
    })
    matched += 1
  }

  for (const pendingMember of pendingMembers) {
    const normalizedEmail = pendingMember.email.trim().toLowerCase()
    const directCandidates = contactsByEmail.get(normalizedEmail) ?? []
    if (directCandidates.length === 0) {
      pendingUnmatched += 1
      continue
    }
    const contact = contactForEmail(normalizedEmail)
    if (!contact) {
      pendingAmbiguous += 1
      continue
    }

    const account = contact.accountId ? accountsById.get(contact.accountId) : undefined
    pendingRows.push({
      email: normalizedEmail,
      zohoContactId: contact.id,
      contactName: contact.name,
      emails: JSON.stringify(contact.emails),
      phoneNumbers: JSON.stringify(contact.phoneNumbers),
      accountId: contact.accountId,
      accountName: contact.accountName ?? account?.name ?? null,
      jobTitle: contact.jobTitle,
      companyWebsite: account?.website ?? null,
      companyWhatWeDo: account?.whatWeDo ?? null,
      accountIndustry: account?.industry ?? null,
      accountCity: account?.city ?? null,
      accountState: account?.state ?? null,
      accountCountry: account?.country ?? null,
      contactCity: contact.city,
      contactState: contact.state,
      contactCountry: contact.country,
      syncedAt: new Date(),
    })
    pendingMatched += 1
  }

  for (let index = 0; index < rows.length; index += 100) {
    await db.insert(zohoProfileDetails)
      .values(rows.slice(index, index + 100))
      .onConflictDoUpdate({
        target: zohoProfileDetails.userId,
        set: {
          zohoContactId: sql`excluded.zoho_contact_id`,
          contactName: sql`excluded.contact_name`,
          emails: sql`excluded.emails`,
          phoneNumbers: sql`excluded.phone_numbers`,
          accountId: sql`excluded.account_id`,
          accountName: sql`excluded.account_name`,
          jobTitle: sql`excluded.job_title`,
          companyWebsite: sql`excluded.company_website`,
          companyWhatWeDo: sql`excluded.company_what_we_do`,
          accountIndustry: sql`excluded.account_industry`,
          accountCity: sql`excluded.account_city`,
          accountState: sql`excluded.account_state`,
          accountCountry: sql`excluded.account_country`,
          contactCity: sql`excluded.contact_city`,
          contactState: sql`excluded.contact_state`,
          contactCountry: sql`excluded.contact_country`,
          syncedAt: sql`excluded.synced_at`,
        },
      })
  }

  for (let index = 0; index < pendingRows.length; index += 100) {
    await db.insert(zohoPendingProfileDetails)
      .values(pendingRows.slice(index, index + 100))
      .onConflictDoUpdate({
        target: zohoPendingProfileDetails.email,
        set: {
          zohoContactId: sql`excluded.zoho_contact_id`,
          contactName: sql`excluded.contact_name`,
          emails: sql`excluded.emails`,
          phoneNumbers: sql`excluded.phone_numbers`,
          accountId: sql`excluded.account_id`,
          accountName: sql`excluded.account_name`,
          jobTitle: sql`excluded.job_title`,
          companyWebsite: sql`excluded.company_website`,
          companyWhatWeDo: sql`excluded.company_what_we_do`,
          accountIndustry: sql`excluded.account_industry`,
          accountCity: sql`excluded.account_city`,
          accountState: sql`excluded.account_state`,
          accountCountry: sql`excluded.account_country`,
          contactCity: sql`excluded.contact_city`,
          contactState: sql`excluded.contact_state`,
          contactCountry: sql`excluded.contact_country`,
          syncedAt: sql`excluded.synced_at`,
        },
      })
  }

  const knownConnectEmails = new Set([...connectEmails, ...pendingMembers.map((member) => member.email.trim().toLowerCase())])
  const zohoOnlyContacts = snapshot.contacts
    .filter((contact) => contact.emails.length > 0 && !contact.emails.some((email) => knownConnectEmails.has(email.toLowerCase())))
    .map((contact) => ({ id: contact.id, name: contact.name, emails: contact.emails }))

  return {
    connectAccountsChecked: connectUsers.length,
    pendingAccountsChecked: pendingMembers.length,
    zohoContactsChecked: snapshot.contacts.length,
    matched,
    unmatched,
    ambiguous,
    pendingMatched,
    pendingUnmatched,
    pendingAmbiguous,
    zohoWithoutConnectCount: zohoOnlyContacts.length,
    zohoWithoutConnect: zohoOnlyContacts,
  }
}

export async function claimPendingZohoProfile(email: string, userId: string) {
  const normalizedEmail = email.trim().toLowerCase()
  await ensureZohoProfileDetailsTable()
  const pending = await db.query.zohoPendingProfileDetails.findFirst({
    where: eq(zohoPendingProfileDetails.email, normalizedEmail),
  })
  if (!pending) return

  await db.insert(zohoProfileDetails)
    .values({
      userId,
      zohoContactId: pending.zohoContactId,
      contactName: pending.contactName,
      emails: pending.emails,
      phoneNumbers: pending.phoneNumbers,
      accountId: pending.accountId,
      accountName: pending.accountName,
      jobTitle: pending.jobTitle,
      companyWebsite: pending.companyWebsite,
      companyWhatWeDo: pending.companyWhatWeDo,
      accountIndustry: pending.accountIndustry,
      accountCity: pending.accountCity,
      accountState: pending.accountState,
      accountCountry: pending.accountCountry,
      contactCity: pending.contactCity,
      contactState: pending.contactState,
      contactCountry: pending.contactCountry,
      syncedAt: pending.syncedAt,
    })
    .onConflictDoUpdate({
      target: zohoProfileDetails.userId,
      set: {
        zohoContactId: pending.zohoContactId,
        contactName: pending.contactName,
        emails: pending.emails,
        phoneNumbers: pending.phoneNumbers,
        accountId: pending.accountId,
        accountName: pending.accountName,
        jobTitle: pending.jobTitle,
        companyWebsite: pending.companyWebsite,
        companyWhatWeDo: pending.companyWhatWeDo,
        accountIndustry: pending.accountIndustry,
        accountCity: pending.accountCity,
        accountState: pending.accountState,
        accountCountry: pending.accountCountry,
        contactCity: pending.contactCity,
        contactState: pending.contactState,
        contactCountry: pending.contactCountry,
        syncedAt: pending.syncedAt,
      },
    })
  await db.delete(zohoPendingProfileDetails).where(eq(zohoPendingProfileDetails.email, normalizedEmail))
}
