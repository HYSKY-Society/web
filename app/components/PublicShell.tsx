import { auth, currentUser } from '@clerk/nextjs/server'
import { ensureUser, getProfile, getUserCourseSlugs, getUserEventSlugs } from '@/lib/members'
import { isAdmin } from '@/lib/admin'
import AppShell from './AppShell'
import PublicShellClient from './PublicShellClient'

export default async function PublicShell({ children }: { children: React.ReactNode }) {
  const { userId } = auth()

  if (!userId) {
    return <PublicShellClient isLoggedIn={false}>{children}</PublicShellClient>
  }

  const user = await currentUser()
  const primaryEmail = user?.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress

  if (!user || !primaryEmail) {
    return <PublicShellClient isLoggedIn={false}>{children}</PublicShellClient>
  }

  const tier = await ensureUser(user.id, primaryEmail)
  const [profile, courseSlugs, eventSlugs] = await Promise.all([
    getProfile(user.id),
    getUserCourseSlugs(user.id),
    getUserEventSlugs(user.id),
  ])

  return (
    <AppShell
      noPadding
      sidebarData={{
        tier,
        displayName:         profile?.displayName ?? null,
        email:               primaryEmail,
        enrolledCourseSlugs: courseSlugs,
        enrolledEventSlugs:  eventSlugs,
        isAdmin:             isAdmin(primaryEmail),
      }}
    >
      {children}
    </AppShell>
  )
}
