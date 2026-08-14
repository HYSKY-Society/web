import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { directMessages, userProfiles, users } from '@/lib/schema'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'

export default async function MessagesPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const tier = await getUserTier(user.id)
  if (hasVipCommunityAccess(tier)) redirect('/network')

  const rows = await db
    .select({
      id: directMessages.id,
      fromUserId: directMessages.fromUserId,
      content: directMessages.content,
      createdAt: directMessages.createdAt,
      displayName: userProfiles.displayName,
      avatarUrl: userProfiles.avatarUrl,
      email: users.email,
    })
    .from(directMessages)
    .leftJoin(userProfiles, eq(directMessages.fromUserId, userProfiles.userId))
    .leftJoin(users, eq(directMessages.fromUserId, users.id))
    .where(eq(directMessages.toUserId, user.id))
    .orderBy(desc(directMessages.createdAt))
    .limit(20)

  const seenSenders = new Set<string>()
  const previews = rows.flatMap((message) => {
    if (seenSenders.has(message.fromUserId)) return []
    seenSenders.add(message.fromUserId)
    const sender = message.displayName || message.email?.split('@')[0] || 'HySky member'
    const preview = message.content.length > 96 ? `${message.content.slice(0, 96)}…` : message.content
    return [{ ...message, sender, preview }]
  })

  return (
    <div className="max-w-2xl text-white">
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}>
        <div className="text-3xl mb-4" aria-hidden>🔒</div>
        <h1 className="text-2xl font-black">Direct Messages</h1>
        <p className="text-sm text-white/50 leading-relaxed mt-3 mb-6">
          You can receive messages and read a short preview on the Free plan. Upgrade to VIP Connect to open complete conversations and send replies.
        </p>
        <a
          href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex px-5 py-2.5 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] text-sm font-semibold text-white transition-colors"
        >
          Upgrade to read and reply
        </a>
      </div>

      {previews.length > 0 ? (
        <section id="message-previews" className="mt-6 scroll-mt-24">
          <h2 className="mb-3 text-lg font-bold">Message previews</h2>
          <div className="space-y-3">
            {previews.map((message) => (
              <article
                key={message.id}
                className="rounded-2xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#5d00f5]/20 font-bold text-[#9b6dff]">
                    {message.avatarUrl
                      ? <img src={message.avatarUrl} alt="" className="h-full w-full object-cover" />
                      : message.sender[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{message.sender}</p>
                    <p className="mt-1 text-sm text-white/55">{message.preview}</p>
                    <p className="mt-2 text-[11px] text-white/30">
                      {message.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#5d00f5]/15 px-2 py-1 text-[10px] font-semibold text-[#9b6dff]">Preview</span>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-white/40">Upgrade to reveal full conversations and reply.</p>
        </section>
      ) : null}
    </div>
  )
}
