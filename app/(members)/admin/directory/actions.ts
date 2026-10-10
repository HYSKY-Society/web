'use server'

import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { isDirectoryAdmin } from '@/lib/admin'
import { getCompanyDirectory } from '@/lib/company-directory'
import { ensureProfileContactsTable, upsertProfileContacts } from '@/lib/profile-contacts'
import {
  pendingDirectMessages,
  pendingTiers,
  profileContacts,
  userProfiles,
  users,
  zohoPendingProfileDetails,
  zohoProfileDetails,
} from '@/lib/schema'
import { ensureZohoProfileDetailsTable } from '@/lib/zoho-crm'
import { notifyMembershipChanged } from '@/lib/membership-events'
import { addManualMember, ManualMemberError, type AddMemberState } from '@/lib/manual-members'

const TIERS = new Set(['free', 'member_courses', 'member_courses_events', 'member_full'])

function value(formData: FormData, name: string) {
  const raw = formData.get(name)
  return typeof raw === 'string' ? raw.trim() : ''
}

function nullable(formData: FormData, name: string) {
  return value(formData, name) || null
}

function list(formData: FormData, name: string) {
  return [...new Map(
    value(formData, name)
      .split(/[\n,;]+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => [entry.toLowerCase(), entry]),
  ).values()]
}

async function requireDirectoryAdmin() {
  const user = await currentUser()
  const email = user?.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  if (!user || !isDirectoryAdmin(email)) throw new Error('Forbidden')
  return user
}

export async function addMember(_state: AddMemberState, formData: FormData): Promise<AddMemberState> {
  const actor = await requireDirectoryAdmin()
  const primary = actor.emailAddresses.find((entry) => entry.id === actor.primaryEmailAddressId)
  if (primary?.verification?.status !== 'verified') return { error: 'Verify your admin email first.' }

  try {
    // Instantiate Clerk only after the local duplicate check requires it.
    const identity = (user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>['users']['getUser']>>) => ({
      id: user.id,
      primaryEmail: user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? '',
      name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || null,
    })
    const result = await addManualMember(primary.emailAddress, {
      email: value(formData, 'email'), name: value(formData, 'name'), tier: value(formData, 'tier'),
    }, {
      async findMember(email) {
        const active = await db.query.users.findFirst({ where: eq(users.email, email) })
        if (active) return { kind: 'active', id: active.id }
        const pending = await db.query.pendingTiers.findFirst({ where: eq(pendingTiers.email, email) })
        return pending ? { kind: 'pending', id: pending.email } : null
      },
      async findIdentity(email) {
        const matches = await (await clerkClient()).users.getUserList({ emailAddress: [email], limit: 2 })
        if (matches.data.length > 1) throw new ManualMemberError('Multiple Clerk accounts match this email. Review them in Clerk first.')
        return matches.data[0] ? identity(matches.data[0]) : null
      },
      async createIdentity(email) {
        return identity(await (await clerkClient()).users.createUser({
          emailAddress: [email], skipPasswordRequirement: true,
        }))
      },
      async saveMember(clerkUser, input) {
        // A Clerk user.created webhook may have already inserted this same ID
        // as Free. Apply the level explicitly selected by the owner in that case.
        await db.insert(users).values({ id: clerkUser.id, email: input.email, tier: input.tier })
          .onConflictDoUpdate({ target: users.id, set: { tier: input.tier, updatedAt: new Date() } })
        await db.insert(userProfiles).values({ userId: clerkUser.id, displayName: input.name || clerkUser.name })
          .onConflictDoUpdate({ target: userProfiles.userId, set: { displayName: input.name || clerkUser.name } })
      },
    })
    if (!result.existing) {
      refreshDirectory()
      revalidatePath('/admin/users')
      revalidatePath('/admin')
    }
    return {
      message: result.existing ? 'This member is already in Connect. Their membership has not changed.' : 'Member added to Connect and Clerk. No email was sent.',
      href: `/admin/directory?view=people&person=${encodeURIComponent(`${result.kind}:${result.id}`)}#selected-person`,
    }
  } catch (error) {
    // Clerk API errors are objects; expose only a useful message, never raw
    // responses, keys, or buyer data. Retrying reuses any created Clerk account.
    if (error && typeof error === 'object' && 'clerkError' in error) {
      return { error: 'Clerk could not add this account. Check its required sign-up fields and email-code sign-in settings, then retry.' }
    }
    return { error: error instanceof ManualMemberError ? error.message : 'Could not finish saving this member. Retry to reuse any Clerk account already created.' }
  }
}

async function selectedCompany(companyId: string) {
  if (!companyId) return null
  const company = (await getCompanyDirectory()).find((entry) => entry.id === companyId)
  if (!company) throw new Error('That company no longer exists.')
  return company
}

function accountIdFor(company: Awaited<ReturnType<typeof selectedCompany>>) {
  return company && !company.id.startsWith('name:') ? company.id : null
}

function refreshDirectory() {
  revalidatePath('/admin/directory')
  revalidatePath('/members')
  revalidatePath('/companies')
}

function savedRedirect(formData: FormData, kind: 'person' | 'company') {
  const returnTo = value(formData, 'returnTo')
  if (!returnTo.startsWith('/admin/directory?') || /[\r\n]/.test(returnTo)) return
  const url = new URL(returnTo, 'https://connect.hysky.org')
  url.searchParams.set('saved', kind)
  redirect(`${url.pathname}${url.search}`)
}

export async function savePerson(formData: FormData) {
  await requireDirectoryAdmin()
  await Promise.all([ensureZohoProfileDetailsTable(), ensureProfileContactsTable()])

  const kind = value(formData, 'kind')
  const personId = value(formData, 'personId')
  const company = await selectedCompany(value(formData, 'companyId'))
  const tier = TIERS.has(value(formData, 'tier')) ? value(formData, 'tier') : 'free'
  const displayName = nullable(formData, 'displayName')
  const jobTitle = nullable(formData, 'jobTitle')
  const emails = list(formData, 'emails')
  const phoneNumbers = list(formData, 'phoneNumbers')
  const contactCity = nullable(formData, 'contactCity')
  const contactState = nullable(formData, 'contactState')
  const contactCountry = nullable(formData, 'contactCountry')

  if (kind === 'active') {
    const member = await db.query.users.findFirst({ where: eq(users.id, personId) })
    if (!member) throw new Error('Member not found.')
    const existingZoho = await db.query.zohoProfileDetails.findFirst({ where: eq(zohoProfileDetails.userId, personId) })

    await db.update(users).set({ tier, updatedAt: new Date() }).where(eq(users.id, personId))
    if (member.tier !== tier) await notifyMembershipChanged(personId)
    await db.insert(userProfiles).values({
      userId: personId,
      displayName,
      headline: nullable(formData, 'headline'),
      bio: nullable(formData, 'bio'),
      location: nullable(formData, 'location'),
      company: company?.name ?? null,
      jobTitle,
      website: nullable(formData, 'website'),
      linkedinUrl: nullable(formData, 'linkedinUrl'),
      twitterUrl: nullable(formData, 'twitterUrl'),
      avatarUrl: nullable(formData, 'avatarUrl'),
      isVisible: formData.get('isVisible') === 'on',
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        displayName,
        headline: nullable(formData, 'headline'),
        bio: nullable(formData, 'bio'),
        location: nullable(formData, 'location'),
        company: company?.name ?? null,
        jobTitle,
        website: nullable(formData, 'website'),
        linkedinUrl: nullable(formData, 'linkedinUrl'),
        twitterUrl: nullable(formData, 'twitterUrl'),
        avatarUrl: nullable(formData, 'avatarUrl'),
        isVisible: formData.get('isVisible') === 'on',
        updatedAt: new Date(),
      },
    })

    await upsertProfileContacts(personId, {
      companyWebsite: company?.website ?? null,
      additionalEmails: JSON.stringify(emails),
      phoneNumber: phoneNumbers[0] ?? null,
      phoneNumbers: JSON.stringify(phoneNumbers),
      companyWhatWeDo: company?.summary ?? null,
      companyCity: company?.city ?? null,
      companyState: company?.state ?? null,
      companyCountry: company?.country ?? null,
      contactCity,
      contactState,
      contactCountry,
    })

    await db.insert(zohoProfileDetails).values({
      userId: personId,
      zohoContactId: existingZoho?.zohoContactId ?? `manual:${personId}`,
      contactName: displayName,
      emails: JSON.stringify(emails),
      phoneNumbers: JSON.stringify(phoneNumbers),
      accountId: accountIdFor(company),
      accountName: company?.name ?? null,
      jobTitle,
      companyWebsite: company?.website ?? null,
      companyWhatWeDo: company?.summary ?? null,
      accountIndustry: company?.category ?? null,
      accountCity: company?.city ?? null,
      accountState: company?.state ?? null,
      accountCountry: company?.country ?? null,
      contactCity,
      contactState,
      contactCountry,
      syncedAt: existingZoho?.syncedAt ?? new Date(),
    }).onConflictDoUpdate({
      target: zohoProfileDetails.userId,
      set: {
        contactName: displayName,
        emails: JSON.stringify(emails),
        phoneNumbers: JSON.stringify(phoneNumbers),
        accountId: accountIdFor(company),
        accountName: company?.name ?? null,
        jobTitle,
        companyWebsite: company?.website ?? null,
        companyWhatWeDo: company?.summary ?? null,
        accountIndustry: company?.category ?? null,
        accountCity: company?.city ?? null,
        accountState: company?.state ?? null,
        accountCountry: company?.country ?? null,
        contactCity,
        contactState,
        contactCountry,
      },
    })
  } else if (kind === 'pending') {
    const normalizedEmail = personId.toLowerCase()
    const pending = await db.query.pendingTiers.findFirst({ where: eq(pendingTiers.email, normalizedEmail) })
    if (!pending) throw new Error('Pending member not found.')
    const existingZoho = await db.query.zohoPendingProfileDetails.findFirst({ where: eq(zohoPendingProfileDetails.email, normalizedEmail) })

    await db.update(pendingTiers).set({
      tier,
      name: displayName,
      avatarUrl: nullable(formData, 'avatarUrl'),
    }).where(eq(pendingTiers.email, normalizedEmail))

    await db.insert(zohoPendingProfileDetails).values({
      email: normalizedEmail,
      zohoContactId: existingZoho?.zohoContactId ?? `manual:${normalizedEmail}`,
      contactName: displayName,
      emails: JSON.stringify(emails),
      phoneNumbers: JSON.stringify(phoneNumbers),
      accountId: accountIdFor(company),
      accountName: company?.name ?? null,
      jobTitle,
      companyWebsite: company?.website ?? null,
      companyWhatWeDo: company?.summary ?? null,
      accountIndustry: company?.category ?? null,
      accountCity: company?.city ?? null,
      accountState: company?.state ?? null,
      accountCountry: company?.country ?? null,
      contactCity,
      contactState,
      contactCountry,
      syncedAt: existingZoho?.syncedAt ?? new Date(),
    }).onConflictDoUpdate({
      target: zohoPendingProfileDetails.email,
      set: {
        contactName: displayName,
        emails: JSON.stringify(emails),
        phoneNumbers: JSON.stringify(phoneNumbers),
        accountId: accountIdFor(company),
        accountName: company?.name ?? null,
        jobTitle,
        companyWebsite: company?.website ?? null,
        companyWhatWeDo: company?.summary ?? null,
        accountIndustry: company?.category ?? null,
        accountCity: company?.city ?? null,
        accountState: company?.state ?? null,
        accountCountry: company?.country ?? null,
        contactCity,
        contactState,
        contactCountry,
      },
    })
  } else {
    throw new Error('Invalid person type.')
  }

  refreshDirectory()
  savedRedirect(formData, 'person')
}

function companyMatch(company: { id: string; name: string }, row: { accountId: string | null; accountName: string | null }) {
  if (!company.id.startsWith('name:')) return row.accountId === company.id
  return !row.accountId && row.accountName?.trim().toLowerCase() === company.name.trim().toLowerCase()
}

async function companyRows(companyId: string) {
  const company = (await getCompanyDirectory()).find((entry) => entry.id === companyId)
  if (!company) throw new Error('Company not found.')
  const [active, pending] = await Promise.all([
    db.select({ userId: zohoProfileDetails.userId, accountId: zohoProfileDetails.accountId, accountName: zohoProfileDetails.accountName }).from(zohoProfileDetails),
    db.select({ email: zohoPendingProfileDetails.email, accountId: zohoPendingProfileDetails.accountId, accountName: zohoPendingProfileDetails.accountName }).from(zohoPendingProfileDetails),
  ])
  return {
    company,
    userIds: active.filter((row) => companyMatch(company, row)).map((row) => row.userId),
    emails: pending.filter((row) => companyMatch(company, row)).map((row) => row.email),
  }
}

export async function saveCompany(formData: FormData) {
  await requireDirectoryAdmin()
  await Promise.all([ensureZohoProfileDetailsTable(), ensureProfileContactsTable()])
  const companyId = value(formData, 'companyId')
  const { userIds, emails } = await companyRows(companyId)
  const name = value(formData, 'name')
  if (!name) throw new Error('Company name is required.')
  const companyData = {
    accountName: name,
    accountIndustry: nullable(formData, 'category'),
    companyWebsite: nullable(formData, 'website'),
    companyWhatWeDo: nullable(formData, 'summary'),
    accountCity: nullable(formData, 'city'),
    accountState: nullable(formData, 'state'),
    accountCountry: nullable(formData, 'country'),
  }

  if (userIds.length) {
    await Promise.all([
      db.update(zohoProfileDetails).set(companyData).where(inArray(zohoProfileDetails.userId, userIds)),
      db.update(userProfiles).set({ company: name, updatedAt: new Date() }).where(inArray(userProfiles.userId, userIds)),
      db.update(profileContacts).set({
        companyWebsite: companyData.companyWebsite,
        companyWhatWeDo: companyData.companyWhatWeDo,
        companyCity: companyData.accountCity,
        companyState: companyData.accountState,
        companyCountry: companyData.accountCountry,
        updatedAt: new Date(),
      }).where(inArray(profileContacts.userId, userIds)),
    ])
  }
  if (emails.length) {
    await db.update(zohoPendingProfileDetails).set(companyData).where(inArray(zohoPendingProfileDetails.email, emails))
  }
  refreshDirectory()
  savedRedirect(formData, 'company')
}

export async function deleteCompany(formData: FormData) {
  await requireDirectoryAdmin()
  await Promise.all([ensureZohoProfileDetailsTable(), ensureProfileContactsTable()])
  const { userIds, emails } = await companyRows(value(formData, 'companyId'))
  const clearedCompany = {
    accountId: null,
    accountName: null,
    accountIndustry: null,
    companyWebsite: null,
    companyWhatWeDo: null,
    accountCity: null,
    accountState: null,
    accountCountry: null,
  }
  if (userIds.length) {
    await Promise.all([
      db.update(zohoProfileDetails).set(clearedCompany).where(inArray(zohoProfileDetails.userId, userIds)),
      db.update(userProfiles).set({ company: null, updatedAt: new Date() }).where(inArray(userProfiles.userId, userIds)),
      db.update(profileContacts).set({
        companyWebsite: null,
        companyWhatWeDo: null,
        companyCity: null,
        companyState: null,
        companyCountry: null,
        updatedAt: new Date(),
      }).where(inArray(profileContacts.userId, userIds)),
    ])
  }
  if (emails.length) {
    await db.update(zohoPendingProfileDetails).set(clearedCompany).where(inArray(zohoPendingProfileDetails.email, emails))
  }
  refreshDirectory()
}

export async function deletePerson(formData: FormData) {
  const admin = await requireDirectoryAdmin()
  const kind = value(formData, 'kind')
  const personId = value(formData, 'personId')
  if (kind === 'active') {
    if (personId === admin.id) throw new Error('You cannot delete your own account here.')
    await (await clerkClient()).users.deleteUser(personId)
    await db.delete(users).where(eq(users.id, personId))
  } else if (kind === 'pending') {
    const email = personId.toLowerCase()
    await Promise.all([
      db.delete(pendingDirectMessages).where(eq(pendingDirectMessages.toEmail, email)),
      db.delete(zohoPendingProfileDetails).where(eq(zohoPendingProfileDetails.email, email)),
    ])
    await db.delete(pendingTiers).where(eq(pendingTiers.email, email))
  } else {
    throw new Error('Invalid person type.')
  }
  refreshDirectory()
}
