import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { getAdminEmails, ADMIN_NAV } from '@/lib/admin'

export default async function AdminPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const userEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''

  if (!getAdminEmails().includes(userEmail)) redirect('/dashboard')

  const [totalResult, freeResult, paidResult, clerkUsersRes] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.tier, 'free')),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.tier, 'paid')),
    clerkClient.users.getUserList({ limit: 500, orderBy: '-created_at' }),
  ])

  const total = Number(totalResult[0]?.count ?? 0)
  const freeCount = Number(freeResult[0]?.count ?? 0)
  const paidCount = Number(paidResult[0]?.count ?? 0)
  const clerkCount = clerkUsersRes.data?.length ?? 0

  const stats = [
    { label: 'Total Members', value: total, color: 'text-[#5d00f5]' },
    { label: 'Free Tier', value: freeCount, color: 'text-amber-400' },
    { label: 'Paid Tier', value: paidCount, color: 'text-emerald-400' },
    { label: 'Clerk Accounts', value: clerkCount, color: 'text-[#13dce8]' },
  ]

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
              l.href === '/admin' ? 'bg-[#5d00f5] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="group bg-white/5 border border-white/10 hover:border-[#5d00f5]/50 rounded-2xl p-6 transition-all hover:bg-white/8"
        >
          <div className="text-2xl mb-3">👥</div>
          <h2 className="font-semibold mb-1 group-hover:text-[#9b6dff] transition-colors">User Management</h2>
          <p className="text-white/40 text-sm">View all members, search by email, and change membership tiers.</p>
        </Link>
        <Link
          href="/admin/codes"
          className="group bg-white/5 border border-white/10 hover:border-[#5d00f5]/50 rounded-2xl p-6 transition-all hover:bg-white/8"
        >
          <div className="text-2xl mb-3">🎟️</div>
          <h2 className="font-semibold mb-1 group-hover:text-[#9b6dff] transition-colors">Discount Codes</h2>
          <p className="text-white/40 text-sm">Create and manage discount codes that grant paid membership on sign-up.</p>
        </Link>
      </div>
    </div>
  )
}
