import NetworkClient from './NetworkClient'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'

export default async function NetworkPage() {
  const user = await currentUser()
  const tier = await getUserTier(user!.id)
  if (!hasVipCommunityAccess(tier)) redirect('/messages')

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Messages</h1>
        <p className="text-white/40 text-sm">Continue recent conversations or start a new one.</p>
      </div>
      <NetworkClient />
    </div>
  )
}
