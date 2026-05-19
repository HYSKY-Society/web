import { db } from '@/lib/db'
import { forumThreads, userProfiles } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'all',       label: 'All',                icon: '🗂️' },
  { key: 'general',   label: 'General',            icon: '💬' },
  { key: 'policy',    label: 'Policy & Advocacy',  icon: '🏛️' },
  { key: 'technical', label: 'Technical',          icon: '⚗️' },
  { key: 'events',    label: 'Events',             icon: '✈️' },
]

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const cat = searchParams.category && searchParams.category !== 'all' ? searchParams.category : undefined

  const rows = await db
    .select({
      id:          forumThreads.id,
      title:       forumThreads.title,
      category:    forumThreads.category,
      isPinned:    forumThreads.isPinned,
      replyCount:  forumThreads.replyCount,
      createdAt:   forumThreads.createdAt,
      updatedAt:   forumThreads.updatedAt,
      displayName: userProfiles.displayName,
    })
    .from(forumThreads)
    .leftJoin(userProfiles, eq(forumThreads.authorId, userProfiles.userId))
    .where(cat ? eq(forumThreads.category, cat) : undefined)
    .orderBy(desc(forumThreads.isPinned), desc(forumThreads.updatedAt))
    .limit(50)

  const catIcon = (key: string) => CATEGORIES.find(c => c.key === key)?.icon ?? '💬'

  return (
    <div className="text-white max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Forum</h1>
          <p className="text-white/40 text-sm">Community discussions and threads.</p>
        </div>
        <Link
          href="/forum/new"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-[#5d00f5] text-white hover:bg-[#4a00d4] transition-colors"
        >
          + New Thread
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(c => {
          const active = (searchParams.category ?? 'all') === c.key
          return (
            <Link
              key={c.key}
              href={c.key === 'all' ? '/forum' : `/forum?category=${c.key}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'bg-[#5d00f5]/30 border-[#5d00f5]/60 text-[#c4a0ff]'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
              }`}
            >
              {c.icon} {c.label}
            </Link>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-white/30 text-sm">No threads yet.</p>
          <Link href="/forum/new" className="text-[#9b6dff] text-sm hover:underline mt-2 inline-block">
            Start the first discussion →
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {rows.map(t => (
            <Link
              key={t.id}
              href={`/forum/${t.id}`}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/6 transition-colors group"
            >
              <span className="text-xl shrink-0">{catIcon(t.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {t.isPinned && <span className="text-[10px] text-[#fbbf24] font-semibold uppercase tracking-wide">📌 Pinned</span>}
                  <p className="font-semibold text-sm text-white group-hover:text-[#c4a0ff] transition-colors truncate">
                    {t.title}
                  </p>
                </div>
                <p className="text-xs text-white/35 mt-0.5">
                  by {t.displayName ?? 'Member'} · {timeAgo(new Date(t.updatedAt))}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs text-white/30">{t.replyCount} {t.replyCount === 1 ? 'reply' : 'replies'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
