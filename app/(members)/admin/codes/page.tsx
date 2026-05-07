import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { discountCodes } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

async function createCode(formData: FormData) {
  'use server'
  const code = (formData.get('code') as string)?.trim().toUpperCase()
  const usesStr = formData.get('uses') as string
  const expiresStr = formData.get('expires') as string

  if (!code) return

  await db.insert(discountCodes).values({
    code,
    usesRemaining: usesStr ? parseInt(usesStr, 10) : null,
    expiresAt: expiresStr ? new Date(expiresStr) : null,
  }).onConflictDoNothing()

  revalidatePath('/admin/codes')
}

async function deleteCode(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  if (id) {
    await db.delete(discountCodes).where(eq(discountCodes.id, id))
    revalidatePath('/admin/codes')
  }
}

const navLinks = [
  { href: '/admin', label: 'Overview', active: false },
  { href: '/admin/users', label: 'Users', active: false },
  { href: '/admin/codes', label: 'Discount Codes', active: true },
]

export default async function AdminCodesPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const userEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''

  if (!getAdminEmails().includes(userEmail)) redirect('/dashboard')

  const codes = await db.select().from(discountCodes).orderBy(discountCodes.createdAt)

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

      {/* Create code form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Create Discount Code</h2>
        <form action={createCode} className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3 sm:grid sm:grid-cols-3 gap-3 contents">
            <div>
              <label className="text-white/40 text-xs block mb-1">Code *</label>
              <input
                name="code"
                required
                placeholder="HYSKY2026"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm font-mono placeholder-white/20 focus:outline-none focus:border-[#5d00f5]/60"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Uses (blank = unlimited)</label>
              <input
                name="uses"
                type="number"
                min="1"
                placeholder="∞"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#5d00f5]/60"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Expires (blank = never)</label>
              <input
                name="expires"
                type="date"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#5d00f5]/60"
              />
            </div>
          </div>
          <button
            type="submit"
            className="sm:col-span-3 w-full sm:w-auto sm:ml-auto px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02]"
            style={{ background: '#5d00f5' }}
          >
            Create Code
          </button>
        </form>
      </div>

      {/* Codes list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/8">
          <h2 className="font-semibold">Active Codes</h2>
          <p className="text-white/35 text-xs mt-0.5">{codes.length} total</p>
        </div>

        {codes.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-12">No codes yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {codes.map((c) => {
              const expired = c.expiresAt ? c.expiresAt < new Date() : false
              const exhausted = c.usesRemaining !== null && c.usesRemaining <= 0

              return (
                <div key={c.id} className="flex items-center justify-between gap-4 px-6 py-3.5 flex-wrap">
                  <div>
                    <p className="font-mono text-sm text-white font-bold">{c.code}</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {c.usesRemaining === null ? 'Unlimited uses' : `${c.usesRemaining} uses left`}
                      {c.expiresAt && ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {(expired || exhausted) && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                        {expired ? 'Expired' : 'Exhausted'}
                      </span>
                    )}
                    <form action={deleteCode}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1.5 rounded-lg font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20"
                      >
                        Delete
                      </button>
                    </form>
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
