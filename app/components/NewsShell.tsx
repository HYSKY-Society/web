import { auth, currentUser } from '@clerk/nextjs/server'
import NewsTopBar from './NewsTopBar'
import { ensureNewsUser, hasVipConnectMembership, type NewsTier } from '@/lib/news'
import { getProfile } from '@/lib/members'
import { getProfileContacts } from '@/lib/profile-contacts'
import type { ProfileContact, UserProfile } from '@/lib/schema'

export default async function NewsShell({ children }: { children: React.ReactNode }) {
  const { userId } = auth()

  let tier: NewsTier | undefined
  let isVipMember = false
  let profile: UserProfile | null = null
  let contacts: ProfileContact | null = null
  let clerkName = ''
  let clerkEmail = ''

  if (userId) {
    const [newsTier, vipAccess, memberProfile, profileContacts, clerkUser] = await Promise.all([
      ensureNewsUser(userId),
      hasVipConnectMembership(userId),
      getProfile(userId),
      getProfileContacts(userId),
      currentUser(),
    ])
    tier = newsTier
    isVipMember = vipAccess
    profile = memberProfile ?? null
    contacts = profileContacts
    clerkName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')
    clerkEmail = clerkUser?.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? ''
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <NewsTopBar
        isLoggedIn={!!userId}
        tier={tier}
        isVipMember={isVipMember}
        profile={profile}
        contacts={contacts}
        clerkName={clerkName}
        clerkEmail={clerkEmail}
      />
      <main>{children}</main>
    </div>
  )
}
