import { db } from './db'
import { users, coursePurchases, eventPurchases, pendingTiers } from './schema'
import { eq, and } from 'drizzle-orm'

// Tiers in ascending order of access
export type Tier = 'free' | 'instructor' | 'member_courses' | 'member_courses_events' | 'member_full'

const TIERS_WITH_COURSES: Tier[] = ['member_courses', 'member_courses_events', 'member_full']
const TIERS_WITH_EVENTS: Tier[] = ['member_courses_events', 'member_full']

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

  // Check for pre-migrated tier from Mighty Networks
  const pending = await db.query.pendingTiers.findFirst({
    where: eq(pendingTiers.email, normalizedEmail),
  })

  const tier = (pending?.tier as Tier) ?? 'free'

  await db.insert(users).values({
    id: clerkId,
    email: normalizedEmail,
    tier,
  }).onConflictDoNothing()

  if (pending) {
    // Apply any pre-purchased courses and events
    const courses = JSON.parse(pending.courseSlugs) as string[]
    const events = JSON.parse(pending.eventSlugs) as string[]
    for (const slug of courses) await addCoursePurchase(clerkId, slug)
    for (const slug of events) await addEventPurchase(clerkId, slug)
    // Clean up — no longer needed once the user account exists
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
  await db
    .update(users)
    .set({ tier })
    .where(eq(users.email, email.toLowerCase().trim()))
}

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
