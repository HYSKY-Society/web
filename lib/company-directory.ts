import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pendingTiers, userProfiles, users, zohoPendingProfileDetails, zohoProfileDetails } from '@/lib/schema'
import { ensureZohoProfileDetailsTable } from '@/lib/zoho-crm'

export type CompanyContact = {
  memberId: string
  name: string
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

export async function getCompanyDirectory(): Promise<DirectoryCompany[]> {
  await ensureZohoProfileDetailsTable()

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
      memberId: users.id,
      displayName: userProfiles.displayName,
      avatarUrl: userProfiles.avatarUrl,
    })
      .from(zohoProfileDetails)
      .innerJoin(users, eq(zohoProfileDetails.userId, users.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId)),
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
      email: pendingTiers.email,
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
    memberId: string
    displayName: string | null
    avatarUrl: string | null
    isPending: boolean
  }) => {
    const name = clean(row.accountName)
    if (!name) return
    const accountKey = clean(row.accountId) ?? `name:${name.toLowerCase()}`
    let company = companies.get(accountKey)
    if (!company) {
      company = {
        id: accountKey,
        slug: companySlug(name, accountKey),
        name,
        initials: companyInitials(name),
        category: clean(row.accountIndustry) ?? 'HySky Connect Company',
        city: clean(row.accountCity),
        state: clean(row.accountState),
        country: clean(row.accountCountry),
        website: clean(row.website),
        summary: clean(row.summary),
        contacts: [],
      }
      companies.set(accountKey, company)
    }

    if (!company.contacts.some((contact) => contact.memberId === row.memberId)) {
      company.contacts.push({
        memberId: row.memberId,
        name: clean(row.displayName) ?? clean(row.contactName) ?? 'HySky member',
        title: clean(row.jobTitle),
        avatarUrl: clean(row.avatarUrl),
        location: memberLocation(row.contactCity, row.contactState, row.contactCountry),
        isPending: row.isPending,
      })
    }
  }

  for (const row of activeRows) addContact({ ...row, isPending: false })
  for (const row of pendingRows) addContact({
    ...row,
    memberId: `pending-${pendingMemberId(row.email)}`,
    isPending: true,
  })

  return [...companies.values()]
    .map((company) => ({
      ...company,
      contacts: company.contacts.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getDirectoryCompany(slug: string) {
  return (await getCompanyDirectory()).find((company) => company.slug === slug) ?? null
}
