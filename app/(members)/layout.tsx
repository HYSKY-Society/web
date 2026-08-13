import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureUser, getProfile, upsertProfile, getUserCourseSlugs, getUserEventSlugs } from '@/lib/members'
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

  const clerkName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || null

  const [profile, courseSlugs, eventSlugs] = await Promise.all([
    getProfile(user.id),
    getUserCourseSlugs(user.id),
    getUserEventSlugs(user.id),
  ])

  // Backfill: fill in any null profile fields from Clerk without overwriting user-set data
  const needsName   = !profile?.displayName && !!clerkName
  const needsAvatar = !profile?.avatarUrl   && !!user.imageUrl
  if (!profile || needsName || needsAvatar) {
    const updates: Record<string, string | null> = {}
    if (needsName)   updates.displayName = clerkName
    if (needsAvatar) updates.avatarUrl   = user.imageUrl
    await upsertProfile(user.id, updates)
  }

  const sidebarData: SidebarData = {
    myId:                 user.id,
    tier,
    displayName:          profile?.displayName ?? clerkName ?? null,
    avatarUrl:            profile?.avatarUrl ?? user.imageUrl ?? null,
    email:                primaryEmail,
    enrolledCourseSlugs:  courseSlugs,
    enrolledEventSlugs:   eventSlugs,
    isAdmin:              isAdmin(primaryEmail),
  }

  return <AppShell sidebarData={sidebarData}>{children}</AppShell>
}
