import NetworkClient from './NetworkClient'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isAdmin } from '@/lib/admin'

export default async function NetworkPage() {
  const user = await currentUser()
  const email = user!.emailAddresses.find((entry) => entry.id === user!.primaryEmailAddressId)?.emailAddress ?? ''
  const tier = await getUserTier(user!.id)
  if (!hasVipCommunityAccess(tier) && !isAdmin(email)) redirect('/messages')

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Network</h1>
        <p className="text-white/40 text-sm">See who&apos;s online and start a conversation.</p>
      </div>
      <NetworkClient />
    </div>
  )
}
