import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { hyskySessions } from '@/lib/schema'
import { revalidatePath } from 'next/cache'
import { getAdminEmails, ADMIN_NAV } from '@/lib/admin'
import { getNextHyskyMonthly, formatSessionDate } from '@/lib/hysky-monthly'
import { syncMonthlyPlaylist } from '@/lib/youtube-sync'
import { eq, desc } from 'drizzle-orm'
import AddSessionForm from './AddSessionForm'

async function createSession(formData: FormData) {
  'use server'
  const title = (formData.get('title') as string).trim()
  const sessionDate = formData.get('sessionDate') as string
  const description = (formData.get('description') as string).trim() || null
  const youtubeUrl = (formData.get('youtubeUrl') as string).trim() || null
  const zoomUrl = (formData.get('zoomUrl') as string).trim() || null
  if (!title || !sessionDate) return
  await db.insert(hyskySessions).values({ title, description, sessionDate: new Date(sessionDate), youtubeUrl, zoomUrl })
  revalidatePath('/admin/hysky-monthly')
  revalidatePath('/hysky-monthly')
}

async function deleteSession(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await db.delete(hyskySessions).where(eq(hyskySessions.id, id))
  revalidatePath('/admin/hysky-monthly')
  revalidatePath('/hysky-monthly')
}

async function syncFromYoutube() {
  'use server'
  await syncMonthlyPlaylist()
  revalidatePath('/admin/hysky-monthly')
  revalidatePath('/hysky-monthly')
}

export default async function AdminHyskyMonthlyPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(email)) redirect('/dashboard')

  const sessions = await db.select().from(hyskySessions).orderBy(desc(hyskySessions.sessionDate))
  const nextAuto = getNextHyskyMonthly()
  const nextAutoFormatted = formatSessionDate(nextAuto)
  const nextDateDefault = nextAuto.toISOString().slice(0, 16)

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
              l.href === '/admin/hysky-monthly' ? 'bg-[#5d00f5] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Auto-calc info */}
      <div
        className="flex items-start gap-3 rounded-xl px-5 py-4 mb-4 text-sm"
        style={{ background: 'rgba(93,0,245,.12)', border: '1px solid rgba(93,0,245,.25)' }}
      >
        <span className="text-[#9b6dff]">ℹ</span>
        <div>
          <span className="text-white/70">Next auto-calculated session: </span>
          <span className="text-[#9b6dff] font-semibold">{nextAutoFormatted}</span>
          <span className="text-white/40"> (third Monday of each month).</span>
        </div>
      </div>

      {/* Sync from YouTube */}
      <div
        className="flex items-center justify-between gap-4 rounded-xl px-5 py-4 mb-6"
        style={{ background: 'rgba(93,0,245,.08)', border: '1px solid rgba(93,0,245,.2)' }}
      >
        <div>
          <p className="text-sm font-medium text-white">YouTube Playlist Sync</p>
          <p className="text-white/40 text-xs mt-0.5">Fetches latest videos from the HYSKY Monthly playlist (RSS — no API key needed)</p>
        </div>
        <form action={syncFromYoutube}>
          <button
            type="submit"
            className="shrink-0 text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
            style={{ background: 'rgba(93,0,245,.2)', color: '#9b6dff', border: '1px solid rgba(93,0,245,.3)' }}
          >
            ↓ Sync Now
          </button>
        </form>
      </div>

      {/* Add session form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Add Session Manually</h2>
        <AddSessionForm createSession={createSession} nextDateDefault={nextDateDefault} />
      </div>

      {/* Session list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/8">
          <h2 className="font-semibold">All Sessions</h2>
          <p className="text-white/35 text-xs mt-0.5">{sessions.length} total</p>
        </div>
        {sessions.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-12">No sessions yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {sessions.map((s) => {
              const isPast = new Date(s.sessionDate) <= new Date()
              return (
                <div key={s.id} className="flex items-start justify-between gap-4 px-6 py-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-medium text-sm text-white">{s.title}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={
                          isPast
                            ? { background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.35)' }
                            : { background: 'rgba(93,0,245,.2)', color: '#9b6dff' }
                        }
                      >
                        {isPast ? 'Past' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-white/30 text-xs">
                      {new Date(s.sessionDate).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {s.zoomUrl && <p className="text-[#9b6dff]/60 text-xs mt-0.5 truncate">Zoom: {s.zoomUrl}</p>}
                    {s.youtubeUrl && <p className="text-red-400/60 text-xs mt-0.5 truncate">YouTube: {s.youtubeUrl}</p>}
                  </div>
                  <form action={deleteSession}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
