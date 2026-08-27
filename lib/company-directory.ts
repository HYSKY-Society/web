import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pendingTiers, profileContacts, userProfiles, users, zohoPendingProfileDetails, zohoProfileDetails } from '@/lib/schema'
import { ensureZohoProfileDetailsTable } from '@/lib/zoho-crm'
import { ensureProfileContactsTable } from '@/lib/profile-contacts'

export type CompanyContact = {
  memberId: string
  name: string
  emails: string[]
  phoneNumbers: string[]
  title: string | null
  avatarUrl: string | null
  location: string | null
  isPending: boolean
}

export type DirectoryCompany = {
  id: string
  slug: string
  name: string
  initials: string
  category: string
  city: string | null
  state: string | null
  country: string | null
  website: string | null
  summary: string | null
  contacts: CompanyContact[]
}

function clean(value: string | null | undefined) {
  return value?.trim() || null
}

function parsedValues(serializedValues: string | null | undefined) {
  let parsed: unknown = []
  try {
    parsed = JSON.parse(serializedValues ?? '[]')
  } catch {
    parsed = []
  }
  return Array.isArray(parsed) ? parsed : []
}

function contactValues(values: unknown[]) {
  return [...new Map(
    values
      .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
      .map((value) => [value.trim().toLowerCase(), value.trim()]),
  ).values()]
}

function meaningfulTitle(value: string | null | undefined) {
  const cleaned = clean(value)
  return cleaned && !/^(x|n\/?a|none|-|unknown)$/i.test(cleaned) ? cleaned : null
}

function memberLocation(city: string | null, state: string | null, country: string | null) {
  const parts = [clean(city), clean(state), clean(country)].filter((value): value is string => Boolean(value))
  return parts.length > 0 ? parts.join(', ') : null
}

function pendingMemberId(email: string) {
  return createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 24)
}

function companySlug(name: string, accountKey: string) {
  const readable = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'company'
  const suffix = createHash('sha256').update(accountKey).digest('hex').slice(0, 7)
  return `${readable}-${suffix}`
}

function companyInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  return (words.length === 1 ? words[0].slice(0, 2) : words.slice(0, 2).map((word) => word[0]).join('')).toUpperCase()
}

export function companyLocation(company: Pick<DirectoryCompany, 'city' | 'state' | 'country'>) {
  return [company.city, company.state, company.country].filter(Boolean).join(', ')
}

export function companyWebsiteHref(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`
}

export async function getCompanyDirectory(options: { includeContactDetails?: boolean } = {}): Promise<DirectoryCompany[]> {
  await Promise.all([ensureZohoProfileDetailsTable(), ensureProfileContactsTable()])

  const [activeRows, pendingRows] = await Promise.all([
    db.select({
      accountId: zohoProfileDetails.accountId,
      accountName: zohoProfileDetails.accountName,
      accountIndustry: zohoProfileDetails.accountIndustry,
      accountCity: zohoProfileDetails.accountCity,
      accountState: zohoProfileDetails.accountState,
      accountCountry: zohoProfileDetails.accountCountry,
      website: zohoProfileDetails.companyWebsite,
      summary: zohoProfileDetails.companyWhatWeDo,
      contactName: zohoProfileDetails.contactName,
      jobTitle: zohoProfileDetails.jobTitle,
      contactCity: zohoProfileDetails.contactCity,
      contactState: zohoProfileDetails.contactState,
      contactCountry: zohoProfileDetails.contactCountry,
      primaryEmail: users.email,
      emails: zohoProfileDetails.emails,
      phoneNumbers: zohoProfileDetails.phoneNumbers,
      memberId: users.id,
      displayName: userProfiles.displayName,
      avatarUrl: userProfiles.avatarUrl,
      manualAccountName: userProfiles.company,
      manualJobTitle: userProfiles.jobTitle,
      manualEmails: profileContacts.additionalEmails,
      manualPhoneNumbers: profileContacts.phoneNumbers,
      legacyPhoneNumber: profileContacts.phoneNumber,
      manualWebsite: profileContacts.companyWebsite,
      manualSummary: profileContacts.companyWhatWeDo,
      manualAccountCity: profileContacts.companyCity,
      manualAccountState: profileContacts.companyState,
      manualAccountCountry: profileContacts.companyCountry,
      manualContactCity: profileContacts.contactCity,
      manualContactState: profileContacts.contactState,
      manualContactCountry: profileContacts.contactCountry,
    })
      .from(zohoProfileDetails)
      .innerJoin(users, eq(zohoProfileDetails.userId, users.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(profileContacts, eq(users.id, profileContacts.userId)),
    db.select({
      accountId: zohoPendingProfileDetails.accountId,
      accountName: zohoPendingProfileDetails.accountName,
      accountIndustry: zohoPendingProfileDetails.accountIndustry,
      accountCity: zohoPendingProfileDetails.accountCity,
      accountState: zohoPendingProfileDetails.accountState,
      accountCountry: zohoPendingProfileDetails.accountCountry,
      website: zohoPendingProfileDetails.companyWebsite,
      summary: zohoPendingProfileDetails.companyWhatWeDo,
      contactName: zohoPendingProfileDetails.contactName,
      jobTitle: zohoPendingProfileDetails.jobTitle,
      contactCity: zohoPendingProfileDetails.contactCity,
      contactState: zohoPendingProfileDetails.contactState,
      contactCountry: zohoPendingProfileDetails.contactCountry,
      primaryEmail: pendingTiers.email,
      emails: zohoPendingProfileDetails.emails,
      phoneNumbers: zohoPendingProfileDetails.phoneNumbers,
      displayName: pendingTiers.name,
      avatarUrl: pendingTiers.avatarUrl,
    })
      .from(zohoPendingProfileDetails)
      .innerJoin(pendingTiers, eq(zohoPendingProfileDetails.email, pendingTiers.email)),
  ])

  const companies = new Map<string, DirectoryCompany>()
  const addContact = (row: {
    accountId: string | null
    accountName: string | null
    accountIndustry: string | null
    accountCity: string | null
    accountState: string | null
    accountCountry: string | null
    website: string | null
    summary: string | null
    contactName: string | null
    jobTitle: string | null
    contactCity: string | null
    contactState: string | null
    contactCountry: string | null
    primaryEmail: string
    emails: string
    phoneNumbers: string
    memberId: string
    displayName: string | null
    avatarUrl: string | null
    manualAccountName: string | null
    manualJobTitle: string | null
    manualEmails: string | null
    manualPhoneNumbers: string | null
    legacyPhoneNumber: string | null
    manualWebsite: string | null
    manualSummary: string | null
    manualAccountCity: string | null
    manualAccountState: string | null
    manualAccountCountry: string | null
    manualContactCity: string | null
    manualContactState: string | null
    manualContactCountry: string | null
    isPending: boolean
  }) => {
    const name = clean(row.manualAccountName) ?? clean(row.accountName)
    if (!name) return
    const accountKey = clean(row.accountId) ?? `name:${name.toLowerCase()}`
    let company = companies.get(accountKey)
    if (!company) {
      company = {
        id: accountKey,
        slug: companySlug(name, accountKey),
        name,
        initials: companyInitials(name),
        category: clean(row.accountIndustry) ?? '',
        city: clean(row.manualAccountCity) ?? clean(row.accountCity),
        state: clean(row.manualAccountState) ?? clean(row.accountState),
        country: clean(row.manualAccountCountry) ?? clean(row.accountCountry),
        website: clean(row.manualWebsite) ?? clean(row.website),
        summary: clean(row.manualSummary) ?? clean(row.summary),
        contacts: [],
      }
      companies.set(accountKey, company)
    } else {
      const manuallyEnteredName = clean(row.manualAccountName)
      if (manuallyEnteredName) {
        company.name = manuallyEnteredName
        company.initials = companyInitials(manuallyEnteredName)
        company.slug = companySlug(manuallyEnteredName, accountKey)
      }
      company.city = clean(row.manualAccountCity) ?? company.city
      company.state = clean(row.manualAccountState) ?? company.state
      company.country = clean(row.manualAccountCountry) ?? company.country
      company.website = clean(row.manualWebsite) ?? company.website
      company.summary = clean(row.manualSummary) ?? company.summary
    }

    if (!company.contacts.some((contact) => contact.memberId === row.memberId)) {
      company.contacts.push({
        memberId: row.memberId,
        name: clean(row.displayName) ?? clean(row.contactName) ?? 'HySky member',
        emails: options.includeContactDetails ? contactValues([
          row.primaryEmail,
          ...parsedValues(row.manualEmails),
          ...parsedValues(row.emails),
        ]) : [],
        phoneNumbers: options.includeContactDetails ? contactValues([
          row.legacyPhoneNumber,
          ...parsedValues(row.manualPhoneNumbers),
          ...parsedValues(row.phoneNumbers),
        ]) : [],
        title: meaningfulTitle(row.manualJobTitle) ?? meaningfulTitle(row.jobTitle),
        avatarUrl: clean(row.avatarUrl),
        location: memberLocation(
          clean(row.manualContactCity) ?? row.contactCity,
          clean(row.manualContactState) ?? row.contactState,
          clean(row.manualContactCountry) ?? row.contactCountry,
        ),
        isPending: row.isPending,
      })
    }
  }

  for (const row of activeRows) addContact({ ...row, isPending: false })
  for (const row of pendingRows) addContact({
    ...row,
    memberId: `pending-${pendingMemberId(row.primaryEmail)}`,
    manualAccountName: null,
    manualJobTitle: null,
    manualEmails: null,
    manualPhoneNumbers: null,
    legacyPhoneNumber: null,
    manualWebsite: null,
    manualSummary: null,
    manualAccountCity: null,
    manualAccountState: null,
    manualAccountCountry: null,
    manualContactCity: null,
    manualContactState: null,
    manualContactCountry: null,
    isPending: true,
  })

  return [...companies.values()]
    .map((company) => ({
      ...company,
      contacts: company.contacts.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getDirectoryCompany(slug: string, options: { includeContactDetails?: boolean } = {}) {
  return (await getCompanyDirectory(options)).find((company) => company.slug === slug) ?? null
}
