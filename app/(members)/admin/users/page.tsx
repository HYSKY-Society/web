import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { users, coursePurchases } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { addCoursePurchase } from '@/lib/members'
import { revalidatePath } from 'next/cache'
import { getAdminEmails, ADMIN_NAV } from '@/lib/admin'
import MakeVipButton from './MakeVipButton'
import UserSearch from './UserSearch'
import InviteUserButton from './InviteUserButton'

const COURSES = [
  { slug: 'h2-aircraft-certification', label: 'Certification' },
  { slug: 'h2-safety-for-aviation',    label: 'Safety' },
  { slug: 'h2-aviation-policy',        label: 'Policy' },
]

async function getCurrentEmail() {
  const user = await currentUser()
  return user?.emailAddresses
    .find((email) => email.id === user.primaryEmailAddressId)
    ?.emailAddress?.trim().toLowerCase() ?? ''
}

async function requireAdmin() {
  const email = await getCurrentEmail()
  if (!getAdminEmails().includes(email)) throw new Error('Forbidden')
}

async function updateMembership(formData: FormData) {
  'use server'
  const email = await getCurrentEmail()
  if (!getAdminEmails().includes(email)) throw new Error('Only Danielle or Rishav can change membership.')
  const userId = String(formData.get('userId') ?? '').trim()
  const targetTier = String(formData.get('targetTier') ?? '')
  if (!userId || !['free', 'member_full'].includes(targetTier)) return
  await db
    .update(users)
    .set({ tier: targetTier as 'free' | 'member_full' })
    .where(eq(users.id, userId))
  revalidatePath('/admin/users')
}

async function grantCourse(formData: FormData) {
  'use server'
  await requireAdmin()
  const userId     = formData.get('userId') as string
  const courseSlug = formData.get('courseSlug') as string
  if (userId && courseSlug) {
    await addCoursePurchase(userId, courseSlug)
    revalidatePath('/admin/users')
  }
}

async function revokeCourse(formData: FormData) {
  'use server'
  await requireAdmin()
  const userId     = formData.get('userId') as string
  const courseSlug = formData.get('courseSlug') as string
  if (userId && courseSlug) {
    await db.delete(coursePurchases).where(
      and(eq(coursePurchases.userId, userId), eq(coursePurchases.courseSlug, courseSlug))
    )
    revalidatePath('/admin/users')
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const userEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''

  if (!getAdminEmails().includes(userEmail)) redirect('/dashboard')
  const canManageMembership = getAdminEmails().includes(userEmail)
  const query = (await searchParams).q?.trim().toLowerCase() ?? ''

  const [allUsers, allPurchases] = await Promise.all([
    db.select().from(users).orderBy(users.createdAt),
    db.select().from(coursePurchases),
  ])

  const purchasesByUser: Record<string, string[]> = {}
  for (const p of allPurchases) {
    if (!purchasesByUser[p.userId]) purchasesByUser[p.userId] = []
    purchasesByUser[p.userId].push(p.courseSlug)
  }

  const visibleUsers = query
    ? allUsers.filter((member) => member.email.toLowerCase().includes(query))
    : allUsers

  return (
    <div className="text-white max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Admin</h1>
        <p className="text-white/40 text-sm">Manage members, tiers, and discount codes.</p>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 w-fit flex-wrap">
        {ADMIN_NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              l.href === '/admin/users' ? 'bg-[#5d00f5] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
        <div>
          <h2 className="font-semibold">User Management</h2>
          <p className="mt-0.5 text-xs text-white/40">Invite someone to create a HySky Connect account.</p>
        </div>
        <InviteUserButton />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/8">
          <h2 className="font-semibold">All Members</h2>
          <p className="text-white/35 text-xs mt-0.5">
            {query ? `${visibleUsers.length} of ${allUsers.length} members` : `${allUsers.length} total`}
          </p>
          <UserSearch initialQuery={query} />
        </div>

        {visibleUsers.length === 0 ? (
          <p className="text-white/35 text-sm text-center py-12">
            {query ? 'No users match that search.' : 'No members yet.'}
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {visibleUsers.map((u) => {
              const userCourses = purchasesByUser[u.id] ?? []
              return (
                <div key={u.id} className="px-6 py-4 space-y-3">
                  {/* Row 1: email + tier */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-mono text-sm text-white/80">{u.email}</p>
                      <p className="text-white/30 text-xs mt-0.5">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        u.tier === 'member_full'
                          ? 'border-[#5d00f5]/40 bg-[#5d00f5]/15 text-[#9b6dff]'
                          : 'border-white/15 bg-white/5 text-white/45'
                      }`}>
                        {u.tier === 'member_full' ? 'VIP Member' : u.tier === 'free' ? 'Free' : 'Member'}
                      </span>
                      {canManageMembership && (
                        <MakeVipButton
                          action={updateMembership}
                          userId={u.id}
                          userEmail={u.email}
                          currentTier={u.tier}
                        />
                      )}
                    </div>
                  </div>

                  {/* Row 2: per-course access */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">Courses:</span>
                    {COURSES.map((c) => {
                      const has = userCourses.includes(c.slug)
                      return (
                        <form key={c.slug} action={has ? revokeCourse : grantCourse}>
                          <input type="hidden" name="userId"     value={u.id} />
                          <input type="hidden" name="courseSlug" value={c.slug} />
                          <button
                            type="submit"
                            className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold transition-colors ${
                              has
                                ? 'bg-green-500/15 border-green-500/40 text-green-400 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400'
                                : 'bg-white/5 border-white/15 text-white/30 hover:bg-[#5d00f5]/20 hover:border-[#5d00f5]/40 hover:text-[#9b6dff]'
                            }`}
                            title={has ? `Revoke ${c.label}` : `Grant ${c.label}`}
                          >
                            {has ? `✓ ${c.label}` : `+ ${c.label}`}
                          </button>
                        </form>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
