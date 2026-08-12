import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isAdmin } from '@/lib/admin'

export default async function MessagesPage() {
  const user = await currentUser()
  const email = user!.emailAddresses.find((entry) => entry.id === user!.primaryEmailAddressId)?.emailAddress ?? ''
  const tier = await getUserTier(user!.id)

  if (hasVipCommunityAccess(tier) || isAdmin(email)) redirect('/network')

  return (
    <div className="max-w-xl text-white">
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}>
        <div className="text-3xl mb-4" aria-hidden>🔒</div>
        <h1 className="text-2xl font-black">Direct Messages</h1>
        <p className="text-sm text-white/50 leading-relaxed mt-3 mb-6">
          Direct messaging and full member profiles are included with VIP Connect.
          You can still browse members, read the community feed, and join conversations through comments.
        </p>
        <a
          href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex px-5 py-2.5 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] text-sm font-semibold text-white transition-colors"
        >
          Explore VIP Connect
        </a>
      </div>
    </div>
  )
}
