import { db } from './db'
import { users } from './schema'
import { eq } from 'drizzle-orm'

export type Tier = 'free' | 'paid'

export async function getUserByClerkId(clerkId: string) {
  return db.query.users.findFirst({ where: eq(users.id, clerkId) })
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  })
}

/** Creates user with free tier if they don't exist. Returns the tier. */
export async function ensureUser(clerkId: string, email: string): Promise<Tier> {
  const existing = await getUserByClerkId(clerkId)
  if (existing) return existing.tier as Tier

  await db.insert(users).values({
    id: clerkId,
    email: email.toLowerCase().trim(),
    tier: 'free',
  }).onConflictDoNothing()

  return 'free'
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
