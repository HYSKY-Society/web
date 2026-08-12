import { db } from './db'
import { users, newsSubscriptions, newsArticleViews, pendingNewsSubscriptions } from './schema'
import { eq, and, gte, count } from 'drizzle-orm'

export type NewsTier = 'free' | 'complimentary' | 'monthly' | 'annual'

export const TIER_LIMITS: Record<NewsTier, number | null> = {
  free:          1,
  complimentary: null,
  monthly:       null,
  annual:        null,
}

export const TIER_LABELS: Record<NewsTier, string> = {
  free:          'Free',
  complimentary: 'VIP Connect',
  monthly:       'Monthly',
  annual:        'Annual',
}

export const TIER_DESCRIPTIONS: Record<NewsTier, string> = {
  free:          '1 article per month',
  complimentary: 'Unlimited articles + archive',
  monthly:       'Unlimited articles + archive',
  annual:        'Unlimited articles + archive',
}

function addSubscriptionPeriod(tier: 'monthly' | 'annual', from: Date): Date {
  const expiresAt = new Date(from)
  if (tier === 'monthly') {
    expiresAt.setUTCDate(expiresAt.getUTCDate() + 30)
  } else {
    expiresAt.setUTCDate(expiresAt.getUTCDate() + 365)
  }
  return expiresAt
}

// Grants news access from a successful Zeffy payment. If the buyer has not
// created a Clerk account yet, the entitlement waits safely under their email.
export async function grantNewsSubscriptionByEmail(
  email: string,
  tier: 'monthly' | 'annual',
  paidAt = new Date()
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim()
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))

  if (user) {
    const [existing] = await db
      .select({ tier: newsSubscriptions.tier, expiresAt: newsSubscriptions.expiresAt })
      .from(newsSubscriptions)
      .where(eq(newsSubscriptions.userId, user.id))

    const expiresAt = addSubscriptionPeriod(tier, paidAt)
    if (existing?.expiresAt && existing.expiresAt >= expiresAt) return

    await db
      .insert(newsSubscriptions)
      .values({ userId: user.id, tier, expiresAt })
      .onConflictDoUpdate({
        target: newsSubscriptions.userId,
        set: { tier, expiresAt, updatedAt: new Date() },
      })
    return
  }

  const [pending] = await db
    .select({ tier: pendingNewsSubscriptions.tier, expiresAt: pendingNewsSubscriptions.expiresAt })
    .from(pendingNewsSubscriptions)
    .where(eq(pendingNewsSubscriptions.email, normalizedEmail))

  const expiresAt = addSubscriptionPeriod(tier, paidAt)
  if (pending?.expiresAt && pending.expiresAt >= expiresAt) return

  await db
    .insert(pendingNewsSubscriptions)
    .values({ email: normalizedEmail, tier, expiresAt })
    .onConflictDoUpdate({
      target: pendingNewsSubscriptions.email,
      set: { tier, expiresAt, updatedAt: new Date() },
    })
}

// Returns the user's current news tier, creating or synchronizing a record if needed.
// Paid HYSKY Connect VIP members receive complimentary unlimited news access.
export async function ensureNewsUser(userId: string): Promise<NewsTier> {
  try {
    const [[existing], [webUser]] = await Promise.all([
      db
        .select()
        .from(newsSubscriptions)
        .where(eq(newsSubscriptions.userId, userId)),
      db
        .select({ tier: users.tier, email: users.email })
        .from(users)
        .where(eq(users.id, userId)),
    ])

    const isVipConnectMember = webUser?.tier === 'member_full'

    // Attach a Zeffy purchase made before the buyer's first Clerk sign-in.
    if (webUser?.email) {
      const [pending] = await db
        .select()
        .from(pendingNewsSubscriptions)
        .where(eq(pendingNewsSubscriptions.email, webUser.email))

      if (pending && pending.expiresAt >= new Date()) {
        await db.transaction(async tx => {
          await tx
            .insert(newsSubscriptions)
            .values({
              userId,
              tier: pending.tier,
              expiresAt: pending.expiresAt,
            })
            .onConflictDoUpdate({
              target: newsSubscriptions.userId,
              set: {
                tier: pending.tier,
                expiresAt: pending.expiresAt,
                updatedAt: new Date(),
              },
            })
          await tx
            .delete(pendingNewsSubscriptions)
            .where(eq(pendingNewsSubscriptions.email, webUser.email))
        })
        return pending.tier as NewsTier
      }
    }

    if (existing) {
      const isPaidNewsTier = existing.tier === 'monthly' || existing.tier === 'annual'
      const paidNewsAccessIsActive =
        isPaidNewsTier && (!existing.expiresAt || existing.expiresAt >= new Date())

      // A standalone paid news subscription takes precedence over Connect access.
      if (paidNewsAccessIsActive) return existing.tier as NewsTier

      // Keep complimentary access aligned with the member's current VIP status.
      const tier: NewsTier = isVipConnectMember ? 'complimentary' : 'free'
      if (existing.tier !== tier || existing.expiresAt) {
        await db
          .update(newsSubscriptions)
          .set({ tier, expiresAt: null, updatedAt: new Date() })
          .where(eq(newsSubscriptions.userId, userId))
      }
      return tier
    }

    const tier: NewsTier = isVipConnectMember ? 'complimentary' : 'free'
    await db
      .insert(newsSubscriptions)
      .values({ userId, tier })
      .onConflictDoNothing()

    return tier
  } catch {
    return 'free'
  }
}

type ReadResult = {
  allowed: boolean
  tier: NewsTier
  viewsThisMonth: number
  limit: number | null
}

// Check if the user can read a specific article this month.
// Re-reading the same article never costs an extra view.
export async function canReadArticle(userId: string, articleId: string): Promise<ReadResult> {
  const tier = await ensureNewsUser(userId)
  const limit = TIER_LIMITS[tier]

  if (limit === null) return { allowed: true, tier, viewsThisMonth: 0, limit }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  try {
    // Has the user already read this specific article this month?
    const [alreadyRead] = await db
      .select({ id: newsArticleViews.id })
      .from(newsArticleViews)
      .where(
        and(
          eq(newsArticleViews.userId, userId),
          eq(newsArticleViews.articleId, articleId),
          gte(newsArticleViews.viewedAt, startOfMonth)
        )
      )

    if (alreadyRead) return { allowed: true, tier, viewsThisMonth: 0, limit }

    // Count distinct articles read this month
    const [{ total }] = await db
      .select({ total: count() })
      .from(newsArticleViews)
      .where(
        and(
          eq(newsArticleViews.userId, userId),
          gte(newsArticleViews.viewedAt, startOfMonth)
        )
      )

    const viewsThisMonth = Number(total)
    return { allowed: viewsThisMonth < limit, tier, viewsThisMonth, limit }
  } catch {
    return { allowed: true, tier, viewsThisMonth: 0, limit }
  }
}

// Record a view. Safe to call multiple times — idempotent within the same month.
export async function recordArticleView(userId: string, articleId: string): Promise<void> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  try {
    const [existing] = await db
      .select({ id: newsArticleViews.id })
      .from(newsArticleViews)
      .where(
        and(
          eq(newsArticleViews.userId, userId),
          eq(newsArticleViews.articleId, articleId),
          gte(newsArticleViews.viewedAt, startOfMonth)
        )
      )

    if (!existing) {
      await db.insert(newsArticleViews).values({ userId, articleId })
    }
  } catch { /* ignore */ }
}
