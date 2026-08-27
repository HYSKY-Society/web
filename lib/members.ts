import { db } from './db'
import { users, userProfiles, profileContacts, coursePurchases, eventPurchases, pendingTiers, podcastEpisodes, zohoPendingProfileDetails, zohoProfileDetails } from './schema'
import { eq, and, or, isNull, count, notInArray, inArray } from 'drizzle-orm'

// Re-export from client-safe tiers module so server code imports one place
export type { Tier, MemberListItem } from './tiers'
export { TIER_LABELS, TIERS_WITH_COURSES, TIERS_WITH_EVENTS, PAID_TIERS, isPaidTier, hasVipCommunityAccess } from './tiers'
import type { Tier, MemberListItem } from './tiers'
import { TIERS_WITH_COURSES, TIERS_WITH_EVENTS } from './tiers'
import { getAdminEmails } from './admin'
import { getCourseSlugVariants, normalizeCourseSlug } from './course-slugs'
import { createHash } from 'crypto'
import { claimPendingZohoProfile, ensureZohoProfileDetailsTable } from './zoho-crm'
import { ensureProfileContactsTable } from './profile-contacts'
import { claimPendingDirectMessages } from './pending-direct-messages'

export function pendingMemberId(email: string): string {
  return createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 24)
}

// ── User CRUD ─────────────────────────────────────────────────────────────────

export async function getUserByClerkId(clerkId: string) {
  return db.query.users.findFirst({ where: eq(users.id, clerkId) })
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  })
}

export async function ensureUser(clerkId: string, email: string): Promise<Tier> {
  const existing = await getUserByClerkId(clerkId)
  if (existing) return existing.tier as Tier

  const normalizedEmail = email.toLowerCase().trim()

  const pending = await db.query.pendingTiers.findFirst({
    where: eq(pendingTiers.email, normalizedEmail),
  })

  const tier = (pending?.tier as Tier) ?? 'free'

  await db.insert(users).values({ id: clerkId, email: normalizedEmail, tier }).onConflictDoNothing()

  // Verify the insert actually landed — the email unique constraint causes
  // onConflictDoNothing to silently skip when the same email exists with a
  // different Clerk ID (e.g. after switching dev → prod instance).
  const inserted = await getUserByClerkId(clerkId)
  if (!inserted) {
    const byEmail = await getUserByEmail(normalizedEmail)
    return (byEmail?.tier as Tier) ?? tier
  }

  if (pending) {
    const courses = (JSON.parse(pending.courseSlugs) as string[]).map(normalizeCourseSlug)
    const events  = JSON.parse(pending.eventSlugs)  as string[]
    for (const slug of courses) await addCoursePurchase(clerkId, slug)
    for (const slug of events)  await addEventPurchase(clerkId, slug)
    if (pending.name || pending.avatarUrl) {
      await upsertProfile(clerkId, {
        displayName: pending.name ?? undefined,
        avatarUrl:   pending.avatarUrl ?? undefined,
      })
    }
    await claimPendingZohoProfile(normalizedEmail, clerkId)
    await claimPendingDirectMessages(normalizedEmail, clerkId)
    await db.delete(pendingTiers).where(eq(pendingTiers.email, normalizedEmail))
  }

  return tier
}

export async function getUserTier(clerkId: string): Promise<Tier> {
  const user = await getUserByClerkId(clerkId)
  return (user?.tier as Tier) ?? 'free'
}

export async function setUserTier(clerkId: string, tier: Tier) {
  await db.update(users).set({ tier }).where(eq(users.id, clerkId))
}

export async function setUserTierByEmail(email: string, tier: Tier) {
  await db.update(users).set({ tier }).where(eq(users.email, email.toLowerCase().trim()))
}

// ── Course / Event access ─────────────────────────────────────────────────────

export async function hasCourseMembership(clerkId: string): Promise<boolean> {
  const tier = await getUserTier(clerkId)
  return TIERS_WITH_COURSES.includes(tier)
}

export async function hasEventMembership(clerkId: string): Promise<boolean> {
  const tier = await getUserTier(clerkId)
  return TIERS_WITH_EVENTS.includes(tier)
}

export async function addCoursePurchase(userId: string, courseSlug: string) {
  const canonicalSlug = normalizeCourseSlug(courseSlug)
  const existing = await db.query.coursePurchases.findFirst({
    where: and(
      eq(coursePurchases.userId, userId),
      inArray(coursePurchases.courseSlug, getCourseSlugVariants(canonicalSlug))
    ),
  })
  if (!existing) {
    await db.insert(coursePurchases).values({ userId, courseSlug: canonicalSlug })
  }
}

export async function addEventPurchase(userId: string, eventSlug: string) {
  await db.insert(eventPurchases).values({ userId, eventSlug }).onConflictDoNothing()
}

export async function hasIndividualCourseAccess(userId: string, courseSlug: string): Promise<boolean> {
  const row = await db.query.coursePurchases.findFirst({
    where: and(
      eq(coursePurchases.userId, userId),
      inArray(coursePurchases.courseSlug, getCourseSlugVariants(courseSlug))
    ),
  })
  return !!row
}

export async function hasIndividualEventAccess(userId: string, eventSlug: string): Promise<boolean> {
  const row = await db.query.eventPurchases.findFirst({
    where: and(eq(eventPurchases.userId, userId), eq(eventPurchases.eventSlug, eventSlug)),
  })
  return !!row
}

export async function getUserCourseSlugs(userId: string): Promise<string[]> {
  const rows = await db.query.coursePurchases.findMany({
    where: eq(coursePurchases.userId, userId),
  })
  return [...new Set(rows.map(r => normalizeCourseSlug(r.courseSlug)))]
}

export async function getUserEventSlugs(userId: string): Promise<string[]> {
  const rows = await db.query.eventPurchases.findMany({
    where: eq(eventPurchases.userId, userId),
  })
  return rows.map(r => r.eventSlug)
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export interface ProfileData {
  displayName?: string | null
  headline?:    string | null
  bio?:         string | null
  location?:    string | null
  company?:     string | null
  jobTitle?:    string | null
  website?:     string | null
  linkedinUrl?: string | null
  twitterUrl?:  string | null
  avatarUrl?:   string | null
  isVisible?:   boolean
}

export async function getProfile(userId: string) {
  return db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) })
}

export async function upsertProfile(userId: string, data: ProfileData) {
  await db
    .insert(userProfiles)
    .values({ userId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: { ...data, updatedAt: new Date() },
    })
}

// ── Member directory ──────────────────────────────────────────────────────────

export async function getAllVisibleMembers(): Promise<MemberListItem[]> {
  await Promise.all([ensureZohoProfileDetailsTable(), ensureProfileContactsTable()])
  const adminEmails = getAdminEmails()
  const [activeRows, registeredEmails, pendingRows] = await Promise.all([
    db
      .select({
        id:          users.id,
        tier:        users.tier,
        displayName: userProfiles.displayName,
        headline:    userProfiles.headline,
        company:     userProfiles.company,
        jobTitle:    userProfiles.jobTitle,
        location:    userProfiles.location,
        contactCity: profileContacts.contactCity,
        contactState: profileContacts.contactState,
        contactCountry: profileContacts.contactCountry,
        zohoCompany: zohoProfileDetails.accountName,
        zohoJobTitle: zohoProfileDetails.jobTitle,
        zohoContactCity: zohoProfileDetails.contactCity,
        zohoContactState: zohoProfileDetails.contactState,
        zohoContactCountry: zohoProfileDetails.contactCountry,
        avatarUrl:   userProfiles.avatarUrl,
        isVisible:   userProfiles.isVisible,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(profileContacts, eq(users.id, profileContacts.userId))
      .leftJoin(zohoProfileDetails, eq(users.id, zohoProfileDetails.userId))
      .where(or(notInArray(users.email, adminEmails), isNull(userProfiles.isVisible), eq(userProfiles.isVisible, true))),
    db.select({ email: users.email }).from(users),
    db.select({
      email: pendingTiers.email,
      tier: pendingTiers.tier,
      name: pendingTiers.name,
      avatarUrl: pendingTiers.avatarUrl,
      company: zohoPendingProfileDetails.accountName,
      jobTitle: zohoPendingProfileDetails.jobTitle,
      contactCity: zohoPendingProfileDetails.contactCity,
      contactState: zohoPendingProfileDetails.contactState,
      contactCountry: zohoPendingProfileDetails.contactCountry,
    })
      .from(pendingTiers)
      .leftJoin(zohoPendingProfileDetails, eq(pendingTiers.email, zohoPendingProfileDetails.email)),
  ])

  const meaningfulTitle = (value: string | null | undefined) => {
    const cleaned = value?.trim() ?? ''
    return /^(x|n\/?a|none|-|unknown)$/i.test(cleaned) ? null : (cleaned || null)
  }
  const location = (...values: Array<string | null | undefined>) => {
    const parts = values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))
    return parts.length > 0 ? parts.join(', ') : null
  }
  const preferMemberValue = (memberValue: string | null | undefined, importedValue: string | null | undefined) =>
    memberValue?.trim() || importedValue?.trim() || null

  const activeMapped: MemberListItem[] = activeRows.map((row) => ({
    id: row.id,
    tier: row.tier,
    displayName: row.displayName,
    headline: row.headline,
    company: row.company?.trim() || row.zohoCompany?.trim() || null,
    jobTitle: meaningfulTitle(row.jobTitle) ?? meaningfulTitle(row.zohoJobTitle),
    location: row.location?.trim() || location(
      preferMemberValue(row.contactCity, row.zohoContactCity),
      preferMemberValue(row.contactState, row.zohoContactState),
      preferMemberValue(row.contactCountry, row.zohoContactCountry),
    ),
    avatarUrl: row.avatarUrl,
    isVisible: row.isVisible,
  }))

  const registeredSet = new Set(registeredEmails.map(r => r.email))

  const pendingMapped: MemberListItem[] = pendingRows
    .filter(r => !registeredSet.has(r.email))
    .map(r => ({
      // Use a URL-safe prefix. Colons in the previous IDs could be interpreted
      // inconsistently by the hosted router and lead to a 404.
      id:          `pending-${pendingMemberId(r.email)}`,
      tier:        r.tier,
      displayName: r.name,
      headline:    null,
      company:     r.company?.trim() || null,
      jobTitle:    meaningfulTitle(r.jobTitle),
      location:    location(r.contactCity, r.contactState, r.contactCountry),
      avatarUrl:   r.avatarUrl ?? null,
      isVisible:   true,
      isPending:   true,
    }))

  return [...activeMapped, ...pendingMapped]
}

export type MemberProfile = {
  id:          string
  email:       string
  tier:        string
  createdAt:   Date
  displayName: string | null
  headline:    string | null
  bio:         string | null
  company:     string | null
  jobTitle:    string | null
  location:    string | null
  website:     string | null
  linkedinUrl: string | null
  twitterUrl:  string | null
  avatarUrl:   string | null
  isPending?:  boolean
}

export async function getMemberProfile(userId: string): Promise<MemberProfile | null> {
  const pendingPrefix = userId.startsWith('pending-') ? 'pending-' : userId.startsWith('pending:') ? 'pending:' : null
  if (pendingPrefix) {
    const opaqueId = userId.slice(pendingPrefix.length)
    const pendingRows = await db.select().from(pendingTiers)
    const pending = pendingRows.find((row) => pendingMemberId(row.email) === opaqueId)
    if (!pending) return null

    return {
      id: userId,
      email: pending.email,
      tier: pending.tier,
      createdAt: pending.createdAt,
      displayName: pending.name,
      headline: null,
      bio: null,
      company: null,
      jobTitle: null,
      location: null,
      website: null,
      linkedinUrl: null,
      twitterUrl: null,
      avatarUrl: pending.avatarUrl,
      isPending: true,
    }
  }

  const rows = await db
    .select({
      id:          users.id,
      email:       users.email,
      tier:        users.tier,
      createdAt:   users.createdAt,
      displayName: userProfiles.displayName,
      headline:    userProfiles.headline,
      bio:         userProfiles.bio,
      company:     userProfiles.company,
      jobTitle:    userProfiles.jobTitle,
      location:    userProfiles.location,
      website:     userProfiles.website,
      linkedinUrl: userProfiles.linkedinUrl,
      twitterUrl:  userProfiles.twitterUrl,
      avatarUrl:   userProfiles.avatarUrl,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(eq(users.id, userId))
    .limit(1)

  return rows[0] ?? null
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getMemberStats() {
  const [activeRes, pendingRes, episodesRes] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(pendingTiers),
    db.select({ count: count() }).from(podcastEpisodes).where(eq(podcastEpisodes.isPublished, true)),
  ])
  return {
    totalMembers:    Number(activeRes[0].count) + Number(pendingRes[0].count),
    activeMembers:   Number(activeRes[0].count),
    podcastEpisodes: Number(episodesRes[0].count),
  }
}
