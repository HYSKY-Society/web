import { db } from './db'
import { users, userProfiles, coursePurchases, eventPurchases, pendingTiers, podcastEpisodes } from './schema'
import { eq, and, or, isNull, count } from 'drizzle-orm'

// Re-export from client-safe tiers module so server code imports one place
export type { Tier } from './tiers'
export { TIER_LABELS, TIERS_WITH_COURSES, TIERS_WITH_EVENTS, PAID_TIERS, isPaidTier } from './tiers'
import type { Tier } from './tiers'
import { TIERS_WITH_COURSES, TIERS_WITH_EVENTS } from './tiers'

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

  if (pending) {
    const courses = JSON.parse(pending.courseSlugs) as string[]
    const events  = JSON.parse(pending.eventSlugs)  as string[]
    for (const slug of courses) await addCoursePurchase(clerkId, slug)
    for (const slug of events)  await addEventPurchase(clerkId, slug)
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
  await db.insert(coursePurchases).values({ userId, courseSlug }).onConflictDoNothing()
}

export async function addEventPurchase(userId: string, eventSlug: string) {
  await db.insert(eventPurchases).values({ userId, eventSlug }).onConflictDoNothing()
}

export async function hasIndividualCourseAccess(userId: string, courseSlug: string): Promise<boolean> {
  const row = await db.query.coursePurchases.findFirst({
    where: and(eq(coursePurchases.userId, userId), eq(coursePurchases.courseSlug, courseSlug)),
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
  return rows.map(r => r.courseSlug)
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

export type MemberListItem = {
  id:          string
  tier:        string
  displayName: string | null
  headline:    string | null
  company:     string | null
  jobTitle:    string | null
  location:    string | null
  avatarUrl:   string | null
  isVisible:   boolean | null
}

export async function getAllVisibleMembers(): Promise<MemberListItem[]> {
  const rows = await db
    .select({
      id:          users.id,
      tier:        users.tier,
      displayName: userProfiles.displayName,
      headline:    userProfiles.headline,
      company:     userProfiles.company,
      jobTitle:    userProfiles.jobTitle,
      location:    userProfiles.location,
      avatarUrl:   userProfiles.avatarUrl,
      isVisible:   userProfiles.isVisible,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(or(isNull(userProfiles.isVisible), eq(userProfiles.isVisible, true)))

  return rows
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
}

export async function getMemberProfile(userId: string): Promise<MemberProfile | null> {
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
