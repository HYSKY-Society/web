import { pgTable, text, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core'

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

export const courseLessonProgress = pgTable('course_lesson_progress', {
  userId:      text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseSlug:  text('course_slug').notNull(),
  lessonId:    text('lesson_id').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.courseSlug, t.lessonId] }),
])

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

export const profileContacts = pgTable('profile_contacts', {
  userId:         text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  companyWebsite: text('company_website'),
  phoneNumber:    text('phone_number'),
  additionalEmails: text('additional_emails'),
  phoneNumbers:     text('phone_numbers'),
  companyWhatWeDo:  text('company_what_we_do'),
  companyCity:      text('company_city'),
  companyState:     text('company_state'),
  companyCountry:   text('company_country'),
  contactCity:      text('contact_city'),
  contactState:     text('contact_state'),
  contactCountry:   text('contact_country'),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Read-only CRM enrichment for existing Connect accounts. Kept separate from
// member-entered profile fields so a Zoho sync never overwrites their data.
export const zohoProfileDetails = pgTable('zoho_profile_details', {
  userId:            text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  zohoContactId:     text('zoho_contact_id').notNull(),
  contactName:       text('contact_name'),
  emails:            text('emails').notNull().default('[]'),
  phoneNumbers:      text('phone_numbers').notNull().default('[]'),
  accountId:         text('account_id'),
  accountName:       text('account_name'),
  jobTitle:          text('job_title'),
  companyWebsite:    text('company_website'),
  companyWhatWeDo:   text('company_what_we_do'),
  accountIndustry:   text('account_industry'),
  accountCity:       text('account_city'),
  accountState:      text('account_state'),
  accountCountry:    text('account_country'),
  contactCity:       text('contact_city'),
  contactState:      text('contact_state'),
  contactCountry:    text('contact_country'),
  syncedAt:          timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
})

// CRM enrichment for members who have a migration record but have not signed
// into Connect yet. It is moved to zohoProfileDetails when they first sign in.
export const zohoPendingProfileDetails = pgTable('zoho_pending_profile_details', {
  email:             text('email').primaryKey(),
  zohoContactId:     text('zoho_contact_id').notNull(),
  contactName:       text('contact_name'),
  emails:            text('emails').notNull().default('[]'),
  phoneNumbers:      text('phone_numbers').notNull().default('[]'),
  accountId:         text('account_id'),
  accountName:       text('account_name'),
  jobTitle:          text('job_title'),
  companyWebsite:    text('company_website'),
  companyWhatWeDo:   text('company_what_we_do'),
  accountIndustry:   text('account_industry'),
  accountCity:       text('account_city'),
  accountState:      text('account_state'),
  accountCountry:    text('account_country'),
  contactCity:       text('contact_city'),
  contactState:      text('contact_state'),
  contactCountry:    text('contact_country'),
  syncedAt:          timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
})

export const pressPosts = pgTable('press_posts', {
  id:              text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug:            text('slug').notNull().unique(),
  title:           text('title').notNull(),
  author:          text('author').notNull().default('HySky News'),
  category:        text('category').notNull().default('News Analysis'),
  excerpt:         text('excerpt'),
  content:         text('content'),
  coverImageUrl:   text('cover_image_url'),
  imageAltText:    text('image_alt_text'),
  imageCredit:     text('image_credit'),
  imageSourceUrl:  text('image_source_url'),
  imageLicense:    text('image_license'),
  imageLicenseUrl: text('image_license_url'),
  imageCaption:    text('image_caption'),
  imageModified:   boolean('image_modified').notNull().default(false),
  seoTitle:        text('seo_title'),
  seoDescription:  text('seo_description'),
  keywords:        text('keywords'),
  publishedAt:     timestamp('published_at', { withTimezone: true }).notNull(),
  readTimeMinutes: integer('read_time_minutes'),
  isPublished:     boolean('is_published').notNull().default(true),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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

export const pendingNewsSubscriptions = pgTable('pending_news_subscriptions', {
  email:     text('email').primaryKey(),
  tier:      text('tier').notNull(), // monthly | annual
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const newsSubscriptions = pgTable('news_subscriptions', {
  userId:    text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  tier:      text('tier').notNull().default('free'), // free | complimentary (paid VIP Connect) | monthly | annual
  expiresAt: timestamp('expires_at', { withTimezone: true }), // null = free/complimentary (VIP status controls complimentary access)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const newsArticleViews = pgTable('news_article_views', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  articleId: text('article_id').notNull(),
  viewedAt:  timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
})

export const directMessages = pgTable('direct_messages', {
  id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId:   text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:    text('content').notNull(),
  readAt:     timestamp('read_at', { withTimezone: true }),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Messages addressed to migrated members before their first Connect sign-in.
// The opaque pending-member URL is resolved to an email only on the server.
// On first sign-in these rows are moved into direct_messages.
export const pendingDirectMessages = pgTable('pending_direct_messages', {
  id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toEmail:    text('to_email').notNull(),
  content:    text('content').notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const chatChannels = pgTable('chat_channels', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:        text('name').notNull(),
  slug:        text('slug').notNull().unique(),
  description: text('description'),
  icon:        text('icon').notNull().default('ðŸ’¬'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const chatMessages = pgTable('chat_messages', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  channelId: text('channel_id').notNull().references(() => chatChannels.id, { onDelete: 'cascade' }),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:   text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const forumThreads = pgTable('forum_threads', {
  id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title:      text('title').notNull(),
  content:    text('content').notNull(),
  authorId:   text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category:   text('category').notNull().default('general'),
  isPinned:   boolean('is_pinned').notNull().default(false),
  replyCount: integer('reply_count').notNull().default(0),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const forumReplies = pgTable('forum_replies', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  threadId:  text('thread_id').notNull().references(() => forumThreads.id, { onDelete: 'cascade' }),
  authorId:  text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:   text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const groupChats = pgTable('group_chats', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:      text('name').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const groupChatMembers = pgTable('group_chat_members', {
  groupId:  text('group_id').notNull().references(() => groupChats.id, { onDelete: 'cascade' }),
  userId:   text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.groupId, t.userId] })])

export const groupMessages = pgTable('group_messages', {
  id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId:    text('group_id').notNull().references(() => groupChats.id, { onDelete: 'cascade' }),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:    text('content').notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const feedPosts = pgTable('feed_posts', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  authorId:     text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:      text('content').notNull(),
  imageUrls:    text('image_urls').notNull().default('[]'),
  repostOfId:   text('repost_of_id'),
  likeCount:    integer('like_count').notNull().default(0),
  replyCount:   integer('reply_count').notNull().default(0),
  repostCount:  integer('repost_count').notNull().default(0),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const feedPostLikes = pgTable('feed_post_likes', {
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId:    text('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.postId] }),
])

export const feedPostReplies = pgTable('feed_post_replies', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId:    text('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  authorId:  text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:   text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const notifications = pgTable('notifications', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  actorId:   text('actor_id').references(() => users.id, { onDelete: 'set null' }),
  type:      text('type').notNull(), // post | like | reply | mention | dm
  entityId:  text('entity_id'),
  href:      text('href'),
  readAt:    timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type UserProfile = typeof userProfiles.$inferSelect
export type ProfileContact = typeof profileContacts.$inferSelect
export type ZohoProfileDetail = typeof zohoProfileDetails.$inferSelect
export type ZohoPendingProfileDetail = typeof zohoPendingProfileDetails.$inferSelect
export type DiscountCode = typeof discountCodes.$inferSelect
export type CoursePurchase = typeof coursePurchases.$inferSelect
export type CourseLessonProgress = typeof courseLessonProgress.$inferSelect
export type EventPurchase = typeof eventPurchases.$inferSelect
export type Sponsor = typeof sponsors.$inferSelect
export type HyskySession = typeof hyskySessions.$inferSelect
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect
export type PendingTier = typeof pendingTiers.$inferSelect
export type DirectMessage = typeof directMessages.$inferSelect
export type PendingDirectMessage = typeof pendingDirectMessages.$inferSelect
export type NewsSubscription = typeof newsSubscriptions.$inferSelect
export type NewsArticleView  = typeof newsArticleViews.$inferSelect
export type ChatChannel      = typeof chatChannels.$inferSelect
export type ChatMessage      = typeof chatMessages.$inferSelect
export type ForumThread      = typeof forumThreads.$inferSelect
export type ForumReply       = typeof forumReplies.$inferSelect
export const zeffyInvoices = pgTable('zeffy_invoices', {
  token:       text('token').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email:       text('email').notNull(),
  name:        text('name').notNull(),
  org:         text('org'),
  amount:      text('amount').notNull(),
  currency:    text('currency').notNull().default('USD'),
  eventName:   text('event_name').notNull(),
  paidAt:      timestamp('paid_at', { withTimezone: true }).notNull(),
  zeffyOrderId: text('zeffy_order_id'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Notification     = typeof notifications.$inferSelect
export type FeedPost         = typeof feedPosts.$inferSelect
export type FeedPostLike     = typeof feedPostLikes.$inferSelect
export type FeedPostReply    = typeof feedPostReplies.$inferSelect
export type ZeffyInvoice     = typeof zeffyInvoices.$inferSelect

