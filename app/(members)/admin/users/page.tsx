import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { setUserTier } from '@/lib/members'
import { revalidatePath } from 'next/cache'
import type { Tier } from '@/lib/members'

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

async function updateTier(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const tier = formData.get('tier') as Tier
  if (id && (tier === 'free' || tier === 'paid')) {
    await setUserTier(id, tier)
    revalidatePath('/admin/users')
  }
}

const navLinks = [
  { href: '/admin', label: 'Overview', active: false },
  { href: '/admin/users', label: 'Users', active: true },
  { href: '/admin/codes', label: 'Discount Codes', active: false },
]

export default async function AdminUsersPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const userEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''

  if (!getAdminEmails().includes(userEmail)) redirect('/dashboard')

  const allUsers = await db.select().from(users).orderBy(users.createdAt)

  return (
    <div className="text-white max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Admin</h1>
        <p className="text-white/40 text-sm">Manage members, tiers, and discount codes.</p>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              l.active ? 'bg-[#5d00f5] text-white' : 'text-white/50 hover:text-white'
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
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 px-6 py-3.5 flex-wrap">
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
                    <option value="paid">Paid</option>
                  </select>
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-[#5d00f5]/20 text-[#9b6dff] hover:bg-[#5d00f5]/40 border border-[#5d00f5]/30"
                  >
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
