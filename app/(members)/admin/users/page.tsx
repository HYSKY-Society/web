import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { users, coursePurchases } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { setUserTier, addCoursePurchase } from '@/lib/members'
import { revalidatePath } from 'next/cache'
import type { Tier } from '@/lib/members'
import { getAdminEmails, ADMIN_NAV } from '@/lib/admin'

const COURSES = [
  { slug: 'h2-aircraft-certification', label: 'Certification' },
  { slug: 'h2-safety-for-aviation',    label: 'Safety' },
  { slug: 'h2-aviation-policy',        label: 'Policy' },
]

async function updateTier(formData: FormData) {
  'use server'
  const id   = formData.get('id') as string
  const tier = formData.get('tier') as Tier
  if (id && ['free', 'member_courses', 'member_courses_events', 'member_full'].includes(tier)) {
    await setUserTier(id, tier)
    revalidatePath('/admin/users')
  }
}

async function grantCourse(formData: FormData) {
  'use server'
  const userId     = formData.get('userId') as string
  const courseSlug = formData.get('courseSlug') as string
  if (userId && courseSlug) {
    await addCoursePurchase(userId, courseSlug)
    revalidatePath('/admin/users')
  }
}

async function revokeCourse(formData: FormData) {
  'use server'
  const userId     = formData.get('userId') as string
  const courseSlug = formData.get('courseSlug') as string
  if (userId && courseSlug) {
    await db.delete(coursePurchases).where(
      and(eq(coursePurchases.userId, userId), eq(coursePurchases.courseSlug, courseSlug))
    )
    revalidatePath('/admin/users')
  }
}

export default async function AdminUsersPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const userEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''

  if (!getAdminEmails().includes(userEmail)) redirect('/dashboard')

  const [allUsers, allPurchases] = await Promise.all([
    db.select().from(users).orderBy(users.createdAt),
    db.select().from(coursePurchases),
  ])

  const purchasesByUser: Record<string, string[]> = {}
  for (const p of allPurchases) {
    if (!purchasesByUser[p.userId]) purchasesByUser[p.userId] = []
    purchasesByUser[p.userId].push(p.courseSlug)
  }

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

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/8">
          <h2 className="font-semibold">All Members</h2>
          <p className="text-white/35 text-xs mt-0.5">{allUsers.length} total</p>
        </div>

        {allUsers.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-12">No members yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {allUsers.map((u) => {
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
                    <form action={updateTier} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="tier"
                        defaultValue={u.tier}
                        className="bg-white/8 border border-white/15 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#5d00f5]/60"
                      >
                        <option value="free">Free</option>
                        <option value="member_courses">Member — Courses</option>
                        <option value="member_courses_events">Member — Courses + Events</option>
                        <option value="member_full">Member — Full</option>
                      </select>
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-[#5d00f5]/20 text-[#9b6dff] hover:bg-[#5d00f5]/40 border border-[#5d00f5]/30"
                      >
                        Save
                      </button>
                    </form>
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
