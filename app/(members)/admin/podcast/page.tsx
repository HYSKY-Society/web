import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { podcastEpisodes } from '@/lib/schema'
import { revalidatePath } from 'next/cache'
import { getAdminEmails, ADMIN_NAV } from '@/lib/admin'
import { syncPodcastPlaylist } from '@/lib/youtube-sync'
import { eq, desc, max } from 'drizzle-orm'
import AddEpisodeForm from './AddEpisodeForm'

async function createEpisode(formData: FormData) {
  'use server'
  const title = (formData.get('title') as string).trim()
  const youtubeUrl = (formData.get('youtubeUrl') as string).trim()
  const publishedAt = formData.get('publishedAt') as string
  const episodeNumberRaw = formData.get('episodeNumber') as string
  const episodeNumber = episodeNumberRaw ? parseInt(episodeNumberRaw, 10) : null
  const description = (formData.get('description') as string).trim() || null
  if (!title || !youtubeUrl || !publishedAt) return
  await db.insert(podcastEpisodes).values({
    title, youtubeUrl, publishedAt: new Date(publishedAt),
    episodeNumber: isNaN(episodeNumber as number) ? null : episodeNumber,
    description,
  })
  revalidatePath('/admin/podcast')
  revalidatePath('/podcast')
}

async function deleteEpisode(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await db.delete(podcastEpisodes).where(eq(podcastEpisodes.id, id))
  revalidatePath('/admin/podcast')
  revalidatePath('/podcast')
}

async function syncFromYoutube() {
  'use server'
  await syncPodcastPlaylist()
  revalidatePath('/admin/podcast')
  revalidatePath('/podcast')
}

export default async function AdminPodcastPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(email)) redirect('/dashboard')

  const episodes = await db.select().from(podcastEpisodes).orderBy(desc(podcastEpisodes.publishedAt))
  const [{ maxEp }] = await db.select({ maxEp: max(podcastEpisodes.episodeNumber) }).from(podcastEpisodes)
  const today = new Date().toISOString().slice(0, 10)

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
              l.href === '/admin/podcast' ? 'bg-[#5d00f5] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Sync from YouTube */}
      <div
        className="flex items-center justify-between gap-4 rounded-xl px-5 py-4 mb-6"
        style={{ background: 'rgba(255,0,0,.08)', border: '1px solid rgba(255,0,0,.2)' }}
      >
        <div>
          <p className="text-sm font-medium text-white">YouTube Playlist Sync</p>
          <p className="text-white/40 text-xs mt-0.5">Fetches latest videos from the HYSKY Pod playlist (RSS — no API key needed)</p>
        </div>
        <form action={syncFromYoutube}>
          <button
            type="submit"
            className="shrink-0 text-sm px-4 py-2 rounded-lg font-semibold transition-colors"
            style={{ background: 'rgba(255,0,0,.2)', color: '#ff6666', border: '1px solid rgba(255,0,0,.3)' }}
          >
            ↓ Sync Now
          </button>
        </form>
      </div>

      {/* Add episode form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Add Episode Manually</h2>
        <AddEpisodeForm
          createEpisode={createEpisode}
          nextEpNum={(maxEp ?? 0) + 1}
          today={today}
        />
      </div>

      {/* Episode list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/8">
          <h2 className="font-semibold">All Episodes</h2>
          <p className="text-white/35 text-xs mt-0.5">{episodes.length} total</p>
        </div>
        {episodes.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-12">No episodes yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {episodes.map((ep) => (
              <div key={ep.id} className="flex items-center justify-between gap-4 px-6 py-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {ep.episodeNumber && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(19,220,232,.15)', color: '#13dce8' }}
                      >
                        Ep. {ep.episodeNumber}
                      </span>
                    )}
                    <p className="font-medium text-sm text-white truncate">{ep.title}</p>
                  </div>
                  <p className="text-white/30 text-xs">
                    {new Date(ep.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-red-400/50 text-xs mt-0.5 truncate">{ep.youtubeUrl}</p>
                </div>
                <form action={deleteEpisode}>
                  <input type="hidden" name="id" value={ep.id} />
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20"
                  >
                    Delete
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
