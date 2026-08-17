import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import {
  feedPosts, feedPostLikes, feedPostReplies,
  userProfiles, users, hyskySessions,
} from '@/lib/schema'
import { eq, desc, asc, inArray, and, gte, ne, or, notInArray } from 'drizzle-orm'
import Link from 'next/link'
import { events as allEvents } from '@/lib/events'
import { courses as allCourses } from '@/lib/courses'
import { getRecentBlogPosts, type WixPost } from '@/lib/wix'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { getAdminEmails, isFeedModerator } from '@/lib/admin'
import FeedComposer from './FeedComposer'
import FeedPostCard, { type PostData, type PostAuthor, type ReplyData } from './FeedPostCard'

export const revalidate = 60

// ── Helpers ───────────────────────────────────────────────────────────────────

function authorFromRow(row: {
  authorId:       string
  authorName:     string | null
  authorAvatar:   string | null
  authorHeadline: string | null
  authorEmail:    string | null
}): PostAuthor {
  return {
    id:       row.authorId,
    name:     row.authorName,
    avatar:   row.authorAvatar,
    headline: row.authorHeadline,
    email:    row.authorEmail ?? '',
  }
}

function timeLabel(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Right Sidebar ─────────────────────────────────────────────────────────────

function EventPill({ label, date, href }: { label: string; date: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
    >
      <div
        className="shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center text-center"
        style={{ background: 'rgba(93,0,245,.2)', border: '1px solid rgba(93,0,245,.25)' }}
      >
        <span className="text-[9px] font-bold leading-none text-[#9b6dff]">
          {new Date(date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
        </span>
        <span className="text-sm font-black leading-none text-white mt-0.5">
          {new Date(date).getDate()}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white leading-snug truncate">{label}</p>
        <p className="text-xs text-white/35 mt-0.5">
          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </Link>
  )
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
    >
      <p className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
        {title}
      </p>
      {children}
    </div>
  )
}

// ── Blog Post Card ────────────────────────────────────────────────────────────

function BlogPostCard({ post }: { post: WixPost }) {
  const url = post.url ? post.url.base + post.url.path : '#'
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden transition-all hover:border-white/20"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
    >
      {post.coverMedia?.image?.url && (
        <div className="aspect-[16/6] overflow-hidden">
          <img
            src={post.coverMedia.image.url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: 'rgba(19,220,232,.12)', color: '#13dce8' }}
          >
            HySky BLOG
          </span>
          {post.firstPublishedDate && (
            <span className="text-xs text-white/30">{timeLabel(post.firstPublishedDate)}</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug mb-1.5 line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-xs text-white/50 leading-relaxed line-clamp-3">{post.excerpt}</p>
        )}
        <p className="mt-2 text-xs text-[#13dce8]/70">Read more →</p>
      </div>
    </a>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FeedPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/sign-in')

  const now = new Date()
  const clerkEmail = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? ''
  const viewerTier = await getUserTier(clerkUser.id)
  const canUseVipCommunity = hasVipCommunityAccess(viewerTier)
  const canModerateFeed = isFeedModerator(clerkEmail)

  const [rawPosts, myLikesRes, myProfile, upcomingSessions, _blogPosts] = await Promise.all([
    db
      .select({
        id:             feedPosts.id,
        content:        feedPosts.content,
        imageUrls:      feedPosts.imageUrls,
        repostOfId:     feedPosts.repostOfId,
        likeCount:      feedPosts.likeCount,
        replyCount:     feedPosts.replyCount,
        repostCount:    feedPosts.repostCount,
        createdAt:      feedPosts.createdAt,
        authorId:       feedPosts.authorId,
        authorName:     userProfiles.displayName,
        authorAvatar:   userProfiles.avatarUrl,
        authorHeadline: userProfiles.headline,
        authorEmail:    users.email,
      })
      .from(feedPosts)
      .leftJoin(userProfiles, eq(feedPosts.authorId, userProfiles.userId))
      .leftJoin(users, eq(feedPosts.authorId, users.id))
      .orderBy(desc(feedPosts.createdAt))
      .limit(30),

    db
      .select({ postId: feedPostLikes.postId })
      .from(feedPostLikes)
      .where(eq(feedPostLikes.userId, clerkUser.id)),

    db
      .select({ displayName: userProfiles.displayName, avatarUrl: userProfiles.avatarUrl })
      .from(userProfiles)
      .where(eq(userProfiles.userId, clerkUser.id))
      .limit(1),

    db
      .select()
      .from(hyskySessions)
      .where(and(eq(hyskySessions.isPublished, true), gte(hyskySessions.sessionDate, now)))
      .orderBy(asc(hyskySessions.sessionDate))
      .limit(3),

    getRecentBlogPosts(14, 5),
  ])

  const rawMentionMembers = canUseVipCommunity
    ? await db
        .select({
          id: userProfiles.userId,
          name: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          headline: userProfiles.headline,
        })
        .from(userProfiles)
        .innerJoin(users, eq(userProfiles.userId, users.id))
        .where(and(
          ne(userProfiles.userId, clerkUser.id),
          or(
            notInArray(users.email, getAdminEmails()),
            eq(userProfiles.isVisible, true),
          ),
        ))
        .orderBy(asc(userProfiles.displayName))
        .limit(1000)
    : []

  const mentionMembers = rawMentionMembers.flatMap((member) =>
    member.name
      ? [{ id: member.id, name: member.name, avatarUrl: member.avatarUrl, headline: member.headline }]
      : []
  )

  // Liked post IDs set
  const likedIds = new Set(myLikesRes.map((l) => l.postId))

  // Fetch replies for displayed posts
  const postIds = rawPosts.map((p) => p.id)
  const rawRepliesPromise = postIds.length > 0
    ? db
        .select({
          id:           feedPostReplies.id,
          postId:       feedPostReplies.postId,
          content:      feedPostReplies.content,
          createdAt:    feedPostReplies.createdAt,
          authorId:     feedPostReplies.authorId,
          authorName:   userProfiles.displayName,
          authorAvatar: userProfiles.avatarUrl,
          authorHeadline: userProfiles.headline,
          authorEmail:  users.email,
        })
        .from(feedPostReplies)
        .leftJoin(userProfiles, eq(feedPostReplies.authorId, userProfiles.userId))
        .leftJoin(users, eq(feedPostReplies.authorId, users.id))
        .where(inArray(feedPostReplies.postId, postIds))
        .orderBy(asc(feedPostReplies.createdAt))
    : Promise.resolve([])

  const rawLikersPromise = postIds.length > 0
    ? db
        .select({
          postId:         feedPostLikes.postId,
          authorId:       feedPostLikes.userId,
          authorName:     userProfiles.displayName,
          authorAvatar:   userProfiles.avatarUrl,
          authorHeadline: userProfiles.headline,
          authorEmail:    users.email,
        })
        .from(feedPostLikes)
        .innerJoin(users, eq(feedPostLikes.userId, users.id))
        .leftJoin(userProfiles, eq(feedPostLikes.userId, userProfiles.userId))
        .where(inArray(feedPostLikes.postId, postIds))
        .orderBy(asc(userProfiles.displayName))
    : Promise.resolve([])

  const [rawReplies, rawLikers] = await Promise.all([rawRepliesPromise, rawLikersPromise])

  // Fetch original posts for reposts
  const repostOfIds = rawPosts.map((p) => p.repostOfId).filter(Boolean) as string[]
  const originalPosts = repostOfIds.length > 0
    ? await db
        .select({
          id:             feedPosts.id,
          content:        feedPosts.content,
          imageUrls:      feedPosts.imageUrls,
          createdAt:      feedPosts.createdAt,
          authorId:       feedPosts.authorId,
          authorName:     userProfiles.displayName,
          authorAvatar:   userProfiles.avatarUrl,
          authorHeadline: userProfiles.headline,
          authorEmail:    users.email,
        })
        .from(feedPosts)
        .leftJoin(userProfiles, eq(feedPosts.authorId, userProfiles.userId))
        .leftJoin(users, eq(feedPosts.authorId, users.id))
        .where(inArray(feedPosts.id, repostOfIds))
    : []
  const originalMap = new Map(originalPosts.map((p) => [p.id, p]))

  // Group replies by postId
  const repliesByPost = new Map<string, ReplyData[]>()
  for (const r of rawReplies) {
    if (!repliesByPost.has(r.postId)) repliesByPost.set(r.postId, [])
    repliesByPost.get(r.postId)!.push({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt,
      author: authorFromRow(r),
    })
  }

  const likersByPost = new Map<string, PostAuthor[]>()
  for (const liker of rawLikers) {
    if (!likersByPost.has(liker.postId)) likersByPost.set(liker.postId, [])
    likersByPost.get(liker.postId)!.push(authorFromRow(liker))
  }

  function parseImageUrls(raw: string | null | undefined): string[] {
    try { return JSON.parse(raw ?? '[]') } catch { return [] }
  }

  // Build PostData array
  const posts: PostData[] = rawPosts.map((p) => {
    const orig = p.repostOfId ? originalMap.get(p.repostOfId) : undefined
    return {
      id:          p.id,
      content:     p.content,
      imageUrls:   parseImageUrls(p.imageUrls),
      repostOfId:  p.repostOfId,
      likeCount:   p.likeCount,
      replyCount:  p.replyCount,
      repostCount: p.repostCount,
      createdAt:   p.createdAt,
      author:      authorFromRow(p),
      isLiked:     likedIds.has(p.id),
      likers:      likersByPost.get(p.id) ?? [],
      replies:     repliesByPost.get(p.id) ?? [],
      originalPost: orig
        ? {
            id:        orig.id,
            content:   orig.content,
            imageUrls: parseImageUrls(orig.imageUrls),
            createdAt: orig.createdAt,
            author:    authorFromRow(orig),
          }
        : null,
    }
  })

  // Merge posts and blog posts sorted by date
  type FeedItem =
    | { kind: 'post'; post: PostData; date: Date }
    | { kind: 'blog'; post: WixPost; date: Date }

  const feedItems: FeedItem[] = posts.map((p) => ({
    kind: 'post' as const,
    post: p,
    date: new Date(p.createdAt),
  }))

  const upcomingEvents = allEvents.filter((e) => new Date(e.date) >= now)
  const profile = myProfile[0]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 max-w-5xl">

      {/* ── Main feed column ─────────────────────────────────────── */}
      <div className="space-y-4 min-w-0">

        <div className="mb-1">
          <h1 className="text-2xl font-black text-white">Community Feed</h1>
          <p className="text-sm text-white/40 mt-1">Updates and conversations from the HySky community.</p>
        </div>

        {/* Post composer */}
        {canUseVipCommunity ? (
          <FeedComposer
            avatarUrl={profile?.avatarUrl}
            displayName={profile?.displayName ?? clerkEmail}
            mentionMembers={mentionMembers}
          />
        ) : (
          <div
            className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
            style={{ background: 'rgba(93,0,245,.08)', border: '1px solid rgba(155,109,255,.22)' }}
          >
            <div>
              <p className="text-sm font-semibold text-white">Want to share an update?</p>
              <p className="text-xs text-white/45 mt-1">Posting and direct messages are included with VIP Connect.</p>
            </div>
            <a
              href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] text-white transition-colors"
            >
              Explore VIP
            </a>
          </div>
        )}

        {/* Feed items */}
        {feedItems.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
          >
            <p className="text-white/25 text-sm">
              Be the first to post something to the HySky community.
            </p>
          </div>
        ) : (
          feedItems.map((item) =>
            item.kind === 'post'
              ? <FeedPostCard key={item.post.id} post={item.post} canUseVipCommunity={canUseVipCommunity} canModerate={canModerateFeed} />
              : <BlogPostCard key={item.post.id} post={item.post} />
          )
        )}
      </div>

      {/* ── Right sidebar ─────────────────────────────────────────── */}
      <aside className="space-y-4 hidden xl:block">

        {/* Upcoming Events */}
        {(upcomingEvents.length > 0 || upcomingSessions.length > 0) && (
          <SidebarCard title="Upcoming Events">
            <div className="pb-2">
              {upcomingEvents.map((ev) => (
                <EventPill
                  key={ev.slug}
                  label={ev.title}
                  date={ev.date}
                  href={`/events/${ev.slug}`}
                />
              ))}
              <EventPill
                label="Advanced Sustainable Aviation Fuels & Aircraft Design"
                date="2026-09-22"
                href="https://aiaa.org/courses/advanced-sustainable-aviation-fuels-and-aircraft-design/"
              />
              {upcomingSessions.map((s) => (
                <EventPill
                  key={s.id}
                  label={s.title}
                  date={s.sessionDate.toISOString()}
                  href="/hysky-monthly"
                />
              ))}
            </div>
          </SidebarCard>
        )}

        {/* Courses */}
        <SidebarCard title="Courses">
          <div className="px-4 pb-4 space-y-2">
            {allCourses.slice(0, 3).map((c) => (
              <Link
                key={c.slug}
                href={`/courses/${c.slug}`}
                className="flex items-center gap-2 text-xs text-white/55 hover:text-white transition-colors"
              >
                <span>{c.badge.split(' ')[0]}</span>
                <span className="truncate">{c.title}</span>
              </Link>
            ))}
            <Link
              href="/courses"
              className="block text-xs text-[#9b6dff] hover:underline mt-1"
            >
              Browse all courses →
            </Link>
          </div>
        </SidebarCard>

        {/* Quick links */}
        <SidebarCard title="Quick Links">
          <div className="px-4 pb-4 space-y-1">
            {[
              { href: '/members', label: '👥 Browse Members' },
              { href: '/events', label: '📅 Browse Events' },
              { href: 'https://news.hysky.org', label: '📰 HySky News', newTab: false },
            ].map(({ href, label, newTab }) => (
              <Link
                key={href}
                href={href}
                {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="block text-xs text-white/50 hover:text-white transition-colors py-0.5"
              >
                {label}
              </Link>
            ))}
          </div>
        </SidebarCard>
      </aside>
    </div>
  )
}
