import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(projectRoot, '.env.local')
const outputPath = resolve(projectRoot, '.private', 'zoho-connect-snapshot.json')

function parseEnv(source) {
  const values = {}
  for (const line of source.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    const rawValue = match[2].trim()
    values[match[1]] = rawValue.replace(/^(['"])(.*)\1$/, '$2')
  }
  return values
}

const env = parseEnv(await readFile(envPath, 'utf8'))
for (const key of ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN']) {
  if (!env[key]) throw new Error(`${key} is missing from .env.local`)
}

const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    refresh_token: env.ZOHO_REFRESH_TOKEN,
  }),
})
const tokenPayload = await tokenResponse.json()
if (!tokenResponse.ok || !tokenPayload.access_token) {
  throw new Error(`Zoho authorization failed${tokenPayload.error ? `: ${tokenPayload.error}` : ''}`)
}

const apiDomain = tokenPayload.api_domain || env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'
const headers = { Authorization: `Zoho-oauthtoken ${tokenPayload.access_token}` }

async function zohoGet(path) {
  const response = await fetch(`${apiDomain}${path}`, { headers })
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(`Zoho request failed${payload.code ? `: ${payload.code}` : ''}`)
  }
  return payload
}

async function getFields(module) {
  return (await zohoGet(`/crm/v8/settings/fields?module=${module}`)).fields ?? []
}

async function getRecords(module, fields) {
  const records = []
  const requestedFields = [...new Set(fields)].slice(0, 50).join(',')
  for (let page = 1; page <= 10; page += 1) {
    const params = new URLSearchParams({ fields: requestedFields, per_page: '200', page: String(page) })
    const payload = await zohoGet(`/crm/v8/${module}?${params}`)
    records.push(...(payload.data ?? []))
    if (!payload.info?.more_records) break
  }
  return records
}

function stringValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function uniqueStrings(values) {
  return [...new Map(values.filter(Boolean).map((value) => [value.toLowerCase(), value])).values()]
}

function lookupValue(value) {
  if (!value || typeof value !== 'object') return { id: null, name: null }
  return { id: stringValue(value.id), name: stringValue(value.name) }
}

function normalizedLabel(value) {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

const [contactFields, accountFields] = await Promise.all([getFields('Contacts'), getFields('Accounts')])
const emailFields = contactFields.filter((field) => field.data_type === 'email').map((field) => field.api_name)
const phoneFields = contactFields.filter((field) => field.data_type === 'phone').map((field) => field.api_name)
const whatWeDoField = accountFields.find((field) => normalizedLabel(field.field_label) === 'what we do')?.api_name

const [rawContacts, rawAccounts] = await Promise.all([
  getRecords('Contacts', [
    'id', 'Full_Name', 'First_Name', 'Last_Name', 'Account_Name', 'Title',
    ...emailFields, ...phoneFields,
  ]),
  getRecords('Accounts', [
    'id', 'Account_Name', 'Website', 'Description', ...(whatWeDoField ? [whatWeDoField] : []),
  ]),
])

const contacts = rawContacts.map((contact) => {
  const account = lookupValue(contact.Account_Name)
  const firstName = stringValue(contact.First_Name)
  const lastName = stringValue(contact.Last_Name)
  return {
    id: String(contact.id),
    name: stringValue(contact.Full_Name) || [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed contact',
    emails: uniqueStrings(emailFields.map((field) => stringValue(contact[field]))),
    phoneNumbers: uniqueStrings(phoneFields.map((field) => stringValue(contact[field]))),
    accountId: account.id,
    accountName: account.name,
    jobTitle: stringValue(contact.Title),
  }
})

const accounts = rawAccounts.map((account) => ({
  id: String(account.id),
  name: stringValue(account.Account_Name),
  website: stringValue(account.Website),
  whatWeDo: stringValue(account[whatWeDoField ?? '']) || stringValue(account.Description),
}))

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, JSON.stringify({
  version: 1,
  generatedAt: new Date().toISOString(),
  contacts,
  accounts,
}, null, 2))

console.log(`Private Zoho snapshot created with ${contacts.length} contacts and ${accounts.length} accounts.`)
console.log(outputPath)
