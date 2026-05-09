import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { podcastEpisodes } from '@/lib/schema'
import { revalidatePath } from 'next/cache'
import { getAdminEmails, ADMIN_NAV } from '@/lib/admin'
import { eq, desc } from 'drizzle-orm'

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
    title,
    youtubeUrl,
    publishedAt: new Date(publishedAt),
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

export default async function AdminPodcastPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')
  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(email)) redirect('/dashboard')

  const episodes = await db
    .select()
    .from(podcastEpisodes)
    .orderBy(desc(podcastEpisodes.publishedAt))

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

      {/* Add episode form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Add Episode</h2>
        <form action={createEpisode} className="grid gap-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              name="title"
              required
              placeholder="Episode title *"
              className="sm:col-span-2 bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
            />
            <input
              name="episodeNumber"
              type="number"
              min="1"
              placeholder="Ep. #"
              className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="youtubeUrl"
              type="url"
              required
              placeholder="YouTube URL *"
              className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
            />
            <input
              name="publishedAt"
              type="date"
              defaultValue={today}
              required
              className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60"
            />
          </div>
          <textarea
            name="description"
            placeholder="Episode description (optional)"
            rows={2}
            className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25 resize-none"
          />
          <button
            type="submit"
            className="self-start text-sm px-5 py-2 rounded-lg font-semibold text-white transition-colors"
            style={{ background: '#5d00f5' }}
          >
            Add Episode
          </button>
        </form>
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
