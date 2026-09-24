import { eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pendingTiers, users, zohoPendingProfileDetails, zohoProfileDetails } from '@/lib/schema'
import { ensureZohoProfileDetailsTable, importZohoSnapshot, type ZohoSnapshot } from '@/lib/zoho-crm'

type ZohoField = {
  api_name?: string
  data_type?: string
  field_label?: string
}

type ZohoRecord = Record<string, unknown> & { id: string }

let accessTokenCache: { token: string; apiDomain: string; expiresAt: number } | null = null
let fieldCache: Promise<{ emailFields: string[]; phoneFields: string[]; whatWeDoField: string | null }> | null = null
let blockedAccountCache: { ids: Set<string>; expiresAt: number } | null = null

const BLOCKED_ZOHO_EMAILS = new Set(['daniellemclean1@gmail.com'])

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is not configured.`)
  return value
}

function clean(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function uniqueStrings(values: Array<string | null>) {
  return [...new Map(values.filter((value): value is string => Boolean(value)).map((value) => [value.toLowerCase(), value])).values()]
}

function isBlockedContact(contact: { emails: string[] }) {
  return contact.emails.some((email) => BLOCKED_ZOHO_EMAILS.has(email.trim().toLowerCase()))
}

function lookup(value: unknown) {
  if (!value || typeof value !== 'object') return { id: null, name: null }
  const record = value as Record<string, unknown>
  return { id: clean(record.id), name: clean(record.name) }
}

function normalizedLabel(value: string | undefined) {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

async function accessToken() {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) return accessTokenCache

  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL?.trim() || 'https://accounts.zoho.com'
  const response = await fetch(`${accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: requiredEnv('ZOHO_CLIENT_ID'),
      client_secret: requiredEnv('ZOHO_CLIENT_SECRET'),
      refresh_token: requiredEnv('ZOHO_REFRESH_TOKEN'),
    }),
    cache: 'no-store',
  })
  const payload = await response.json() as { access_token?: string; api_domain?: string; expires_in?: number; error?: string }
  if (!response.ok || !payload.access_token) throw new Error(`Zoho authorization failed${payload.error ? `: ${payload.error}` : ''}.`)

  accessTokenCache = {
    token: payload.access_token,
    apiDomain: payload.api_domain || process.env.ZOHO_API_DOMAIN?.trim() || 'https://www.zohoapis.com',
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  }
  return accessTokenCache
}

async function zohoGet(path: string) {
  const auth = await accessToken()
  const response = await fetch(`${auth.apiDomain}${path}`, {
    headers: { Authorization: `Zoho-oauthtoken ${auth.token}` },
    cache: 'no-store',
  })
  const payload = await response.json() as { data?: ZohoRecord[]; fields?: ZohoField[]; info?: { more_records?: boolean }; code?: string }
  if (!response.ok) throw new Error(`Zoho request failed${payload.code ? `: ${payload.code}` : ''}.`)
  return payload
}

async function fields() {
  if (!fieldCache) {
    fieldCache = (async () => {
      const [contacts, accounts] = await Promise.all([
        zohoGet('/crm/v8/settings/fields?module=Contacts'),
        zohoGet('/crm/v8/settings/fields?module=Accounts'),
      ])
      const contactFields = contacts.fields ?? []
      const accountFields = accounts.fields ?? []
      return {
        emailFields: contactFields.filter((field) => field.data_type === 'email' && field.api_name).map((field) => field.api_name!),
        phoneFields: contactFields.filter((field) => field.data_type === 'phone' && field.api_name).map((field) => field.api_name!),
        whatWeDoField: accountFields.find((field) => normalizedLabel(field.field_label) === 'what we do')?.api_name ?? null,
      }
    })().catch((error) => {
      fieldCache = null
      throw error
    })
  }
  return fieldCache
}

function contactFromRecord(record: ZohoRecord, emailFields: string[], phoneFields: string[]) {
  const account = lookup(record.Account_Name)
  const firstName = clean(record.First_Name)
  const lastName = clean(record.Last_Name)
  return {
    id: String(record.id),
    name: clean(record.Full_Name) || [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed contact',
    emails: uniqueStrings(emailFields.map((field) => clean(record[field]))),
    phoneNumbers: uniqueStrings(phoneFields.map((field) => clean(record[field]))),
    accountId: account.id,
    accountName: account.name,
    jobTitle: clean(record.Title),
    city: clean(record.Mailing_City),
    state: clean(record.Mailing_State),
    country: clean(record.Mailing_Country),
  }
}

function accountFromRecord(record: ZohoRecord, whatWeDoField: string | null) {
  return {
    id: String(record.id),
    name: clean(record.Account_Name),
    website: clean(record.Website),
    whatWeDo: clean(whatWeDoField ? record[whatWeDoField] : null) || clean(record.Description),
    industry: clean(record.Industry),
    city: clean(record.Billing_City),
    state: clean(record.Billing_State),
    country: clean(record.Billing_Country),
  }
}

async function getRecords(module: 'Contacts' | 'Accounts', requestedFields: string[]) {
  const records: ZohoRecord[] = []
  const fieldList = [...new Set(requestedFields)].slice(0, 50).join(',')
  for (let page = 1; page <= 20; page += 1) {
    const params = new URLSearchParams({ fields: fieldList, per_page: '200', page: String(page) })
    const payload = await zohoGet(`/crm/v8/${module}?${params}`)
    records.push(...(payload.data ?? []))
    if (!payload.info?.more_records) break
  }
  return records
}

async function getRecord(module: 'Contacts' | 'Accounts', recordId: string, requestedFields: string[]) {
  const params = new URLSearchParams({ fields: [...new Set(requestedFields)].slice(0, 50).join(',') })
  const payload = await zohoGet(`/crm/v8/${module}/${encodeURIComponent(recordId)}?${params}`)
  const record = payload.data?.[0]
  if (!record) throw new Error(`${module} record ${recordId} was not found in Zoho.`)
  return record
}

const contactBaseFields = ['id', 'Full_Name', 'First_Name', 'Last_Name', 'Account_Name', 'Title', 'Mailing_City', 'Mailing_State', 'Mailing_Country']
const accountBaseFields = ['id', 'Account_Name', 'Website', 'Description', 'Industry', 'Billing_City', 'Billing_State', 'Billing_Country']

async function blockedZohoAccountIds(metadata: Awaited<ReturnType<typeof fields>>) {
  if (blockedAccountCache && blockedAccountCache.expiresAt > Date.now()) return blockedAccountCache.ids

  const records = await getRecords('Contacts', ['id', 'Account_Name', ...metadata.emailFields])
  const ids = new Set(
    records
      .map((record) => contactFromRecord(record, metadata.emailFields, []))
      .filter(isBlockedContact)
      .map((contact) => contact.accountId)
      .filter((accountId): accountId is string => Boolean(accountId)),
  )
  blockedAccountCache = { ids, expiresAt: Date.now() + 10 * 60 * 1000 }
  return ids
}

export async function fetchZohoSnapshot(): Promise<ZohoSnapshot> {
  const metadata = await fields()
  const [contacts, accounts] = await Promise.all([
    getRecords('Contacts', [...contactBaseFields, ...metadata.emailFields, ...metadata.phoneFields]),
    getRecords('Accounts', [...accountBaseFields, ...(metadata.whatWeDoField ? [metadata.whatWeDoField] : [])]),
  ])

  const parsedContacts = contacts.map((record) => contactFromRecord(record, metadata.emailFields, metadata.phoneFields))
  const blockedAccountIds = new Set(
    parsedContacts
      .filter(isBlockedContact)
      .map((contact) => contact.accountId)
      .filter((accountId): accountId is string => Boolean(accountId)),
  )
  blockedAccountCache = { ids: blockedAccountIds, expiresAt: Date.now() + 10 * 60 * 1000 }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    contacts: parsedContacts.filter(
      (contact) => !isBlockedContact(contact) && !blockedAccountIds.has(contact.accountId ?? ''),
    ),
    accounts: accounts
      .map((record) => accountFromRecord(record, metadata.whatWeDoField))
      .filter((account) => !blockedAccountIds.has(account.id)),
  }
}

export async function syncZohoDirectory() {
  const snapshot = await fetchZohoSnapshot()
  return importZohoSnapshot(snapshot)
}

export async function syncZohoRecord(moduleName: string, recordId: string) {
  await ensureZohoProfileDetailsTable()
  const module = moduleName.toLowerCase()
  const metadata = await fields()
  const blockedAccountIds = await blockedZohoAccountIds(metadata)

  if (module === 'accounts' || module === 'account') {
    if (blockedAccountIds.has(recordId)) return { module: 'Accounts', recordId, ignored: true, updated: 0 }
    const record = await getRecord('Accounts', recordId, [...accountBaseFields, ...(metadata.whatWeDoField ? [metadata.whatWeDoField] : [])])
    const account = accountFromRecord(record, metadata.whatWeDoField)
    const values = {
      accountName: account.name,
      companyWebsite: account.website,
      companyWhatWeDo: account.whatWeDo,
      accountIndustry: account.industry,
      accountCity: account.city,
      accountState: account.state,
      accountCountry: account.country,
      syncedAt: new Date(),
    }
    const [active, pending] = await Promise.all([
      db.update(zohoProfileDetails).set(values).where(eq(zohoProfileDetails.accountId, recordId)).returning({ id: zohoProfileDetails.userId }),
      db.update(zohoPendingProfileDetails).set(values).where(eq(zohoPendingProfileDetails.accountId, recordId)).returning({ id: zohoPendingProfileDetails.email }),
    ])
    return { module: 'Accounts', recordId, updated: active.length + pending.length }
  }

  if (module !== 'contacts' && module !== 'contact') throw new Error('Only Contacts and Accounts can be synchronized.')

  const record = await getRecord('Contacts', recordId, [...contactBaseFields, ...metadata.emailFields, ...metadata.phoneFields])
  const contact = contactFromRecord(record, metadata.emailFields, metadata.phoneFields)
  if (isBlockedContact(contact) || (contact.accountId && blockedAccountIds.has(contact.accountId))) {
    return { module: 'Contacts', recordId, ignored: true, updated: 0 }
  }
  const accountRecord = contact.accountId
    ? await getRecord('Accounts', contact.accountId, [...accountBaseFields, ...(metadata.whatWeDoField ? [metadata.whatWeDoField] : [])])
    : null
  const account = accountRecord ? accountFromRecord(accountRecord, metadata.whatWeDoField) : null
  const values = {
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
  }

  const [existingActive, existingPending] = await Promise.all([
    db.select({ id: zohoProfileDetails.userId }).from(zohoProfileDetails).where(eq(zohoProfileDetails.zohoContactId, recordId)),
    db.select({ email: zohoPendingProfileDetails.email }).from(zohoPendingProfileDetails).where(eq(zohoPendingProfileDetails.zohoContactId, recordId)),
  ])
  const normalizedEmails = contact.emails.map((email) => email.toLowerCase())
  const [emailUsers, emailPending] = normalizedEmails.length > 0
    ? await Promise.all([
        db.select({ id: users.id }).from(users).where(inArray(users.email, normalizedEmails)),
        db.select({ email: pendingTiers.email }).from(pendingTiers).where(inArray(pendingTiers.email, normalizedEmails)),
      ])
    : [[], []]
  const activeIds = [...new Set([...existingActive.map((row) => row.id), ...emailUsers.map((row) => row.id)])]
  const pendingEmails = [...new Set([...existingPending.map((row) => row.email), ...emailPending.map((row) => row.email)])]

  for (const userId of activeIds) {
    await db.insert(zohoProfileDetails).values({ userId, ...values }).onConflictDoUpdate({
      target: zohoProfileDetails.userId,
      set: values,
    })
  }
  for (const email of pendingEmails) {
    await db.insert(zohoPendingProfileDetails).values({ email, ...values }).onConflictDoUpdate({
      target: zohoPendingProfileDetails.email,
      set: values,
    })
  }

  return { module: 'Contacts', recordId, updated: activeIds.length + pendingEmails.length }
}
