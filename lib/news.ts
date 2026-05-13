import { db } from './db'
import { users, newsSubscriptions, newsArticleViews } from './schema'
import { eq, and, gte, count } from 'drizzle-orm'

export type NewsTier = 'free' | 'complimentary' | 'monthly' | 'annual'

export const TIER_LIMITS: Record<NewsTier, number | null> = {
  free:          1,
  complimentary: 5,
  monthly:       null,
  annual:        null,
}

export const TIER_LABELS: Record<NewsTier, string> = {
  free:          'Free',
  complimentary: 'Complimentary',
  monthly:       'Monthly',
  annual:        'Annual',
}

export const TIER_DESCRIPTIONS: Record<NewsTier, string> = {
  free:          '1 article per month',
  complimentary: '5 articles per month',
  monthly:       'Unlimited articles + archive',
  annual:        'Unlimited articles + archive',
}

// Returns the user's current news tier, creating a subscription record if needed.
// HYSKY web members automatically receive the complimentary tier.
export async function ensureNewsUser(userId: string): Promise<NewsTier> {
  try {
    const [existing] = await db
      .select()
      .from(newsSubscriptions)
      .where(eq(newsSubscriptions.userId, userId))

    if (existing) {
      // Paid tiers expire — downgrade to free if past expiry
      if (existing.expiresAt && existing.expiresAt < new Date()) {
        await db
          .update(newsSubscriptions)
          .set({ tier: 'free', expiresAt: null, updatedAt: new Date() })
          .where(eq(newsSubscriptions.userId, userId))
        return 'free'
      }
      return existing.tier as NewsTier
    }

    // First visit — check if they are a HYSKY web member
    const [webUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))

    const tier: NewsTier = webUser ? 'complimentary' : 'free'
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
