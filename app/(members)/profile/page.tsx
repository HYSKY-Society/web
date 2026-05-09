import { currentUser } from '@clerk/nextjs/server'
import { getProfile } from '@/lib/members'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const user = await currentUser()
  const profile = await getProfile(user!.id)

  const clerkName  = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const clerkEmail = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? ''

  return (
    <div className="text-white max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Edit Profile</h1>
        <p className="text-white/40">Your profile is visible to other members in the directory.</p>
      </div>
      <ProfileForm profile={profile ?? null} clerkName={clerkName} clerkEmail={clerkEmail} />
    </div>
  )
}
