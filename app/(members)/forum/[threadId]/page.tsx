import { db } from '@/lib/db'
import { forumThreads, forumReplies, userProfiles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReplyForm from './ReplyForm'

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const CATEGORY_ICONS: Record<string, string> = {
  general:   '💬',
  policy:    '🏛️',
  technical: '⚗️',
  events:    '✈️',
}

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const thread = await db.query.forumThreads.findFirst({
    where: eq(forumThreads.id, params.threadId),
  })
  if (!thread) notFound()

  const [authorRow, replies] = await Promise.all([
    db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, thread.authorId) }),
    db
      .select({
        id:          forumReplies.id,
        content:     forumReplies.content,
        createdAt:   forumReplies.createdAt,
        authorId:    forumReplies.authorId,
        displayName: userProfiles.displayName,
      })
      .from(forumReplies)
      .leftJoin(userProfiles, eq(forumReplies.authorId, userProfiles.userId))
      .where(eq(forumReplies.threadId, params.threadId))
      .orderBy(forumReplies.createdAt),
  ])

  const icon = CATEGORY_ICONS[thread.category] ?? '💬'

  return (
    <div className="text-white max-w-3xl">
      <Link href="/forum" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
        ← Back to Forum
      </Link>

      {/* Thread header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          {thread.isPinned && (
            <span className="text-[10px] text-[#fbbf24] font-semibold uppercase tracking-wide">📌 Pinned</span>
          )}
          <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wide">{thread.category}</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
        <p className="text-xs text-white/35">
          by {authorRow?.displayName ?? 'Member'} · {timeAgo(new Date(thread.createdAt))}
        </p>
      </div>

      {/* Thread body */}
      <div className="bg-white/4 border border-white/8 rounded-2xl px-6 py-5 mb-10">
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{thread.content}</p>
      </div>

      {/* Replies */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        {replies.length === 0 ? (
          <p className="text-sm text-white/25 italic">No replies yet. Be the first to respond.</p>
        ) : (
          <div className="space-y-4">
            {replies.map(r => (
              <div key={r.id} className="flex gap-4">
                <div className="shrink-0 pt-0.5">
                  <div className="w-7 h-7 rounded-full bg-[#5d00f5]/30 flex items-center justify-center text-[10px] font-bold text-[#c4a0ff]">
                    {(r.displayName ?? 'M')[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{r.displayName ?? 'Member'}</span>
                    <span className="text-[10px] text-white/25">{timeAgo(new Date(r.createdAt))}</span>
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{r.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Post a Reply</h2>
        <ReplyForm threadId={params.threadId} />
      </div>
    </div>
  )
}
