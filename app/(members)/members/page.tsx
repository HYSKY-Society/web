import { currentUser } from '@clerk/nextjs/server'
import { getAllVisibleMembers, getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isAdmin } from '@/lib/admin'
import MemberDirectory from './MemberDirectory'

export default async function MembersPage() {
  const user = await currentUser()
  const userId = user!.id
  const email = user!.emailAddresses.find((entry) => entry.id === user!.primaryEmailAddressId)?.emailAddress ?? ''
  const [members, tier] = await Promise.all([
    getAllVisibleMembers(),
    getUserTier(userId),
  ])
  const canAccessProfiles = hasVipCommunityAccess(tier) || isAdmin(email)

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Member Directory</h1>
        <p className="text-white/40">Connect with the hydrogen aviation ecosystem.</p>
      </div>
      <MemberDirectory members={members} canAccessProfiles={canAccessProfiles} />
    </div>
  )
}
