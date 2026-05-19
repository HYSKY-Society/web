import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { directMessages, userProfiles, users } from '@/lib/schema'
import { eq, or, and, sql, desc } from 'drizzle-orm'
import Link from 'next/link'

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60)   return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default async function MessagesPage() {
  const clerkUser = await currentUser()
  const myId = clerkUser!.id

  // Latest message per conversation partner
  const rows = await db.execute(sql`
    SELECT DISTINCT ON (other_id)
      CASE WHEN from_user_id = ${myId} THEN to_user_id ELSE from_user_id END AS other_id,
      content  AS last_message,
      created_at AS last_at,
      from_user_id
    FROM direct_messages
    WHERE from_user_id = ${myId} OR to_user_id = ${myId}
    ORDER BY other_id, created_at DESC
  `) as { other_id: string; last_message: string; last_at: Date; from_user_id: string }[]

  const otherIds = rows.map(r => r.other_id)

  const profiles = otherIds.length
    ? await db
        .select({ userId: userProfiles.userId, displayName: userProfiles.displayName, avatarUrl: userProfiles.avatarUrl, headline: userProfiles.headline })
        .from(userProfiles)
        .where(sql`${userProfiles.userId} = ANY(${otherIds})`)
    : []

  const profileMap = Object.fromEntries(profiles.map(p => [p.userId, p]))

  const sorted = [...rows].sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime())

  return (
    <div className="text-white max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Messages</h1>
        <p className="text-white/40 text-sm">Your direct message conversations.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-white/30 text-sm">No messages yet.</p>
          <p className="text-white/20 text-xs mt-1">Visit the <Link href="/network" className="underline hover:text-white/50">Network</Link> tab to start a conversation.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {sorted.map(row => {
            const p = profileMap[row.other_id]
            const initials = (p?.displayName ?? 'M').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
            const isMine = row.from_user_id === myId
            return (
              <Link
                key={row.other_id}
                href={`/messages/${row.other_id}`}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/6 transition-colors"
              >
                <div
                  className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden"
                  style={{ background: p?.avatarUrl ? undefined : '#5d00f520', border: '1px solid #5d00f540' }}
                >
                  {p?.avatarUrl
                    ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-sm text-white truncate">{p?.displayName ?? 'Member'}</span>
                    <span className="text-xs text-white/25 shrink-0">{timeAgo(new Date(row.last_at))}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate mt-0.5">
                    {isMine ? 'You: ' : ''}{row.last_message}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
