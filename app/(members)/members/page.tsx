import { auth } from '@clerk/nextjs/server'
import { getAllVisibleMembers, getUserTier } from '@/lib/members'
import MemberDirectory from './MemberDirectory'

export default async function MembersPage() {
  const { userId } = auth()
  const [members, tier] = await Promise.all([
    getAllVisibleMembers(),
    getUserTier(userId!),
  ])

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Member Directory</h1>
        <p className="text-white/40">Connect with the hydrogen aviation ecosystem.</p>
      </div>
      <MemberDirectory members={members} viewerTier={tier} />
    </div>
  )
}
