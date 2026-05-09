import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  // 'free' | 'member_courses' | 'member_courses_events' | 'member_full'
  tier: text('tier').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const discountCodes = pgTable('discount_codes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull().unique(),
  usesRemaining: integer('uses_remaining'), // null = unlimited
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const coursePurchases = pgTable('course_purchases', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseSlug: text('course_slug').notNull(),
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).defaultNow().notNull(),
})

export const eventPurchases = pgTable('event_purchases', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventSlug: text('event_slug').notNull(),
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).defaultNow().notNull(),
})

// VIP tier: vip_free | vip_early_bird | vip_startup | vip_copper | vip_bronze | vip_silver | vip_gold | vip_platinum
export const sponsors = pgTable('sponsors', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  website: text('website'),
  description: text('description'),
  tier: text('tier').notNull().default('vip_free'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const hyskySessions = pgTable('hysky_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  sessionDate: timestamp('session_date', { withTimezone: true }).notNull(),
  youtubeUrl: text('youtube_url'),   // populated after recording goes live
  zoomUrl: text('zoom_url'),         // registration / join link pre-event
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const podcastEpisodes = pgTable('podcast_episodes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  episodeNumber: integer('episode_number'),
  description: text('description'),
  youtubeUrl: text('youtube_url').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type DiscountCode = typeof discountCodes.$inferSelect
export type CoursePurchase = typeof coursePurchases.$inferSelect
export type EventPurchase = typeof eventPurchases.$inferSelect
export type Sponsor = typeof sponsors.$inferSelect
export type HyskySession = typeof hyskySessions.$inferSelect
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect
