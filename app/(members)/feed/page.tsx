import { db } from '@/lib/db'
import { hyskySessions, podcastEpisodes } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { events as allEvents } from '@/lib/events'
import { extractYouTubeId } from '@/lib/youtube'
import Link from 'next/link'

export const revalidate = 1800

// ── Helpers ───────────────────────────────────────────────────────────────────

function YtThumb({ youtubeUrl, title }: { youtubeUrl: string; title: string }) {
  const id = extractYouTubeId(youtubeUrl)
  if (!id) return <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20 text-xs">No thumbnail</div>
  return (
    <img
      src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
      alt={title}
      className="w-full h-full object-cover"
    />
  )
}

function FeedCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:border-white/20"
      style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}
    >
      {children}
    </div>
  )
}

function SectionHeader({ icon, title, href, linkLabel }: { icon: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-white flex items-center gap-2">
        <span>{icon}</span>{title}
      </h2>
      <Link href={href} className="text-xs text-white/35 hover:text-white/70 transition-colors">
        {linkLabel} →
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FeedPage() {
  const now = new Date()

  const [episodes, sessions] = await Promise.all([
    db.select().from(podcastEpisodes)
      .where(eq(podcastEpisodes.isPublished, true))
      .orderBy(desc(podcastEpisodes.publishedAt))
      .limit(8),
    db.select().from(hyskySessions)
      .where(eq(hyskySessions.isPublished, true))
      .orderBy(desc(hyskySessions.sessionDate))
      .limit(8),
  ])

  const upcomingEvents = allEvents.filter(e => new Date(e.date) >= now)
  const pastEvents     = allEvents.filter(e => new Date(e.date) < now)

  return (
    <div className="max-w-2xl space-y-10">

      {/* ── Upcoming Events ─────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <section>
          <SectionHeader icon="🗓" title="Upcoming Events" href="/events" linkLabel="All events" />
          <div className="space-y-3">
            {upcomingEvents.map(ev => (
              <FeedCard key={ev.slug}>
                <div className="p-5 flex items-start gap-4">
                  <div
                    className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center"
                    style={{ background: 'rgba(93,0,245,.2)', border: '1px solid rgba(93,0,245,.3)' }}
                  >
                    <span className="text-[#9b6dff] text-xs font-bold leading-none">
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-white font-black text-xl leading-none mt-0.5">
                      {new Date(ev.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm leading-snug">{ev.title}</p>
                    {ev.subtitle && <p className="text-white/45 text-xs mt-0.5">{ev.subtitle}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-white/30 text-xs">{ev.format}</span>
                      <Link
                        href={`/dashboard/events/${ev.slug}`}
                        className="text-xs font-semibold text-[#9b6dff] hover:underline"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </div>
              </FeedCard>
            ))}
          </div>
        </section>
      )}

      {/* ── HYSKY Monthly ───────────────────────────────────────── */}
      {sessions.length > 0 && (
        <section>
          <SectionHeader icon="📅" title="HYSKY Monthly" href="/hysky-monthly" linkLabel="View all" />
          <div className="space-y-3">
            {sessions.slice(0, 4).map(s => (
              <FeedCard key={s.id}>
                <div className="flex gap-0 sm:gap-0">
                  {s.youtubeUrl && (
                    <div className="shrink-0 w-[140px] sm:w-[160px] aspect-video">
                      <YtThumb youtubeUrl={s.youtubeUrl} title={s.title} />
                    </div>
                  )}
                  <div className="flex-1 p-4 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9b6dff] mb-1">
                      {new Date(s.sessionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="font-semibold text-white text-sm leading-snug line-clamp-2">{s.title}</p>
                    {s.description && (
                      <p className="text-white/40 text-xs mt-1.5 line-clamp-2 leading-relaxed">{s.description}</p>
                    )}
                    {s.youtubeUrl && (
                      <a
                        href={s.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-[#9b6dff]/70 hover:text-[#9b6dff] transition-colors"
                      >
                        Watch →
                      </a>
                    )}
                  </div>
                </div>
              </FeedCard>
            ))}
          </div>
        </section>
      )}

      {/* ── HYSKY Pod ───────────────────────────────────────────── */}
      {episodes.length > 0 && (
        <section>
          <SectionHeader icon="🎙" title="HYSKY Pod" href="/podcast" linkLabel="View all" />
          <div className="space-y-3">
            {episodes.slice(0, 4).map(ep => (
              <FeedCard key={ep.id}>
                <div className="flex">
                  <div className="shrink-0 w-[140px] sm:w-[160px] aspect-video">
                    <YtThumb youtubeUrl={ep.youtubeUrl} title={ep.title} />
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {ep.episodeNumber && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(19,220,232,.15)', color: '#13dce8' }}
                        >
                          Ep. {ep.episodeNumber}
                        </span>
                      )}
                      <span className="text-white/30 text-[10px]">
                        {new Date(ep.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="font-semibold text-white text-sm leading-snug line-clamp-2">{ep.title}</p>
                    {ep.description && (
                      <p className="text-white/40 text-xs mt-1.5 line-clamp-2 leading-relaxed">{ep.description}</p>
                    )}
                    <a
                      href={ep.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-[#13dce8]/70 hover:text-[#13dce8] transition-colors"
                    >
                      Watch →
                    </a>
                  </div>
                </div>
              </FeedCard>
            ))}
          </div>
        </section>
      )}

      {episodes.length === 0 && sessions.length === 0 && upcomingEvents.length === 0 && (
        <div className="text-center py-20 text-white/25">
          <p className="text-lg mb-2">Your feed is empty.</p>
          <p className="text-sm">Content will appear here as it's added.</p>
        </div>
      )}
    </div>
  )
}
