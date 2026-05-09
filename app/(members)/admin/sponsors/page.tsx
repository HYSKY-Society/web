import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { sponsors } from '@/lib/schema'
import { revalidatePath } from 'next/cache'
import { getAdminEmails, ADMIN_NAV } from '@/lib/admin'
import { eq } from 'drizzle-orm'

const TIERS = [
  { id: 'vip_platinum',  label: 'Platinum' },
  { id: 'vip_gold',      label: 'Gold' },
  { id: 'vip_silver',    label: 'Silver' },
  { id: 'vip_bronze',    label: 'Bronze' },
  { id: 'vip_copper',    label: 'Copper' },
  { id: 'vip_startup',   label: 'Startup' },
  { id: 'vip_early_bird',label: 'Early Bird VIP' },
  { id: 'vip_free',      label: 'Community Partner (Free)' },
]

async function createSponsor(formData: FormData) {
  'use server'
  const name = (formData.get('name') as string).trim()
  const tier = formData.get('tier') as string
  const website = (formData.get('website') as string).trim() || null
  const logoUrl = (formData.get('logoUrl') as string).trim() || null
  const description = (formData.get('description') as string).trim() || null
  if (!name || !tier) return
  await db.insert(sponsors).values({ name, tier, website, logoUrl, description })
  revalidatePath('/admin/sponsors')
  revalidatePath('/sponsors')
}

async function toggleActive(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const current = formData.get('isActive') === 'true'
  await db.update(sponsors).set({ isActive: !current }).where(eq(sponsors.id, id))
  revalidatePath('/admin/sponsors')
  revalidatePath('/sponsors')
}

async function deleteSponsor(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await db.delete(sponsors).where(eq(sponsors.id, id))
  revalidatePath('/admin/sponsors')
  revalidatePath('/sponsors')
}

export default async function AdminSponsorsPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(email)) redirect('/dashboard')

  const allSponsors = await db.select().from(sponsors).orderBy(sponsors.createdAt)

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
              l.href === '/admin/sponsors' ? 'bg-[#5d00f5] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Add sponsor form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Add Sponsor</h2>
        <form action={createSponsor} className="grid gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="name"
              required
              placeholder="Company name *"
              className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
            />
            <select
              name="tier"
              defaultValue="vip_free"
              className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60"
            >
              {TIERS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <input
            name="website"
            type="url"
            placeholder="https://example.com"
            className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
          />
          <input
            name="logoUrl"
            type="url"
            placeholder="Logo URL (https://...)"
            className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
          />
          <textarea
            name="description"
            placeholder="Short description (optional)"
            rows={2}
            className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25 resize-none"
          />
          <button
            type="submit"
            className="self-start text-sm px-5 py-2 rounded-lg font-semibold text-white transition-colors"
            style={{ background: '#5d00f5' }}
          >
            Add Sponsor
          </button>
        </form>
      </div>

      {/* Sponsor list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/8">
          <h2 className="font-semibold">All Sponsors</h2>
          <p className="text-white/35 text-xs mt-0.5">{allSponsors.length} total</p>
        </div>
        {allSponsors.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-12">No sponsors yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {allSponsors.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 px-6 py-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-white">{s.name}</p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(93,0,245,.2)', color: '#9b6dff' }}
                    >
                      {TIERS.find((t) => t.id === s.tier)?.label ?? s.tier}
                    </span>
                    {!s.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Hidden</span>
                    )}
                  </div>
                  {s.website && <p className="text-white/30 text-xs mt-0.5 truncate">{s.website}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="isActive" value={String(s.isActive)} />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-white/8 text-white/50 hover:text-white border border-white/10"
                    >
                      {s.isActive ? 'Hide' : 'Show'}
                    </button>
                  </form>
                  <form action={deleteSponsor}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
