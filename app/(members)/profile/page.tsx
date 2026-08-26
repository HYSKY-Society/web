import { currentUser } from '@clerk/nextjs/server'
import { getProfile, getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { getProfileContacts } from '@/lib/profile-contacts'
import ProfileForm from './ProfileForm'
import { isAdmin } from '@/lib/admin'

export default async function ProfilePage() {
  const user = await currentUser()
  const [profile, contacts, tier] = await Promise.all([
    getProfile(user!.id),
    getProfileContacts(user!.id),
    getUserTier(user!.id),
  ])

  const clerkName  = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const clerkEmail = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? ''

  return (
    <div className="text-white max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>
      <ProfileForm
        profile={profile ?? null}
        contacts={contacts}
        clerkName={clerkName}
        clerkEmail={clerkEmail}
        canEditLinks={hasVipCommunityAccess(tier)}
        canManageVisibility={isAdmin(clerkEmail)}
      />
    </div>
  )
}
