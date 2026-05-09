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

// Holds pre-migrated member data from Mighty Networks.
// Applied automatically in ensureUser() on first Clerk sign-in, then deleted.
export const pendingTiers = pgTable('pending_tiers', {
  email:       text('email').primaryKey(),
  tier:        text('tier').notNull().default('free'),
  name:        text('name'),
  mnMemberId:  text('mn_member_id'),
  avatarUrl:   text('avatar_url'),
  courseSlugs: text('course_slugs').notNull().default('[]'), // JSON array
  eventSlugs:  text('event_slugs').notNull().default('[]'),  // JSON array
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const userProfiles = pgTable('user_profiles', {
  userId:      text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name'),
  headline:    text('headline'),
  bio:         text('bio'),
  location:    text('location'),
  company:     text('company'),
  jobTitle:    text('job_title'),
  website:     text('website'),
  linkedinUrl: text('linkedin_url'),
  twitterUrl:  text('twitter_url'),
  avatarUrl:   text('avatar_url'),
  isVisible:   boolean('is_visible').notNull().default(true),
  lastSeenAt:  timestamp('last_seen_at', { withTimezone: true }),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const pressPosts = pgTable('press_posts', {
  id:              text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug:            text('slug').notNull().unique(),
  title:           text('title').notNull(),
  author:          text('author').notNull().default('HYSKY Society'),
  excerpt:         text('excerpt'),
  content:         text('content'),
  coverImageUrl:   text('cover_image_url'),
  publishedAt:     timestamp('published_at', { withTimezone: true }).notNull(),
  readTimeMinutes: integer('read_time_minutes'),
  isPublished:     boolean('is_published').notNull().default(true),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const flyingHySpeakers = pgTable('flying_hy_speakers', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventYear:    integer('event_year').notNull(),
  name:         text('name').notNull(),
  title:        text('title'),
  organization: text('organization'),
  bio:          text('bio'),
  avatarUrl:    text('avatar_url'),
  sessionTitle: text('session_title'),
  displayOrder: integer('display_order').notNull().default(0),
  isPublished:  boolean('is_published').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const flyingHyAgenda = pgTable('flying_hy_agenda', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventYear:    integer('event_year').notNull(),
  timeSlot:     text('time_slot'),
  title:        text('title').notNull(),
  description:  text('description'),
  speakerName:  text('speaker_name'),
  sessionType:  text('session_type').notNull().default('session'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const directMessages = pgTable('direct_messages', {
  id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId:   text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:    text('content').notNull(),
  readAt:     timestamp('read_at', { withTimezone: true }),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type UserProfile = typeof userProfiles.$inferSelect
export type DiscountCode = typeof discountCodes.$inferSelect
export type CoursePurchase = typeof coursePurchases.$inferSelect
export type EventPurchase = typeof eventPurchases.$inferSelect
export type Sponsor = typeof sponsors.$inferSelect
export type HyskySession = typeof hyskySessions.$inferSelect
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect
export type PendingTier = typeof pendingTiers.$inferSelect
export type DirectMessage = typeof directMessages.$inferSelect
