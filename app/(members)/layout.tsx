import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureUser, getProfile, getUserCourseSlugs, getUserEventSlugs } from '@/lib/members'
import { isAdmin } from '@/lib/admin'
import AppShell from '@/app/components/AppShell'
import type { SidebarData } from '@/app/components/AppShell'

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress
  if (!primaryEmail) redirect('/sign-in')

  const tier = await ensureUser(user.id, primaryEmail)

  const [profile, courseSlugs, eventSlugs] = await Promise.all([
    getProfile(user.id),
    getUserCourseSlugs(user.id),
    getUserEventSlugs(user.id),
  ])

  const sidebarData: SidebarData = {
    tier,
    displayName:          profile?.displayName ?? null,
    email:                primaryEmail,
    enrolledCourseSlugs:  courseSlugs,
    enrolledEventSlugs:   eventSlugs,
    isAdmin:              isAdmin(primaryEmail),
  }

  return <AppShell sidebarData={sidebarData}>{children}</AppShell>
}
