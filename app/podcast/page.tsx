import { db } from '@/lib/db'
import { podcastEpisodes } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import SmartNav from '@/app/components/SmartNav'
import VideoCard from '@/app/components/VideoCard'
import { auth } from '@clerk/nextjs/server'

export const revalidate = 3600

export default async function PodcastPage() {
  const { userId } = auth()
  const episodes = await db
    .select()
    .from(podcastEpisodes)
    .where(eq(podcastEpisodes.isPublished, true))
    .orderBy(desc(podcastEpisodes.publishedAt))

  return (
    <div className="min-h-screen text-white" style={{ background: '#04030a' }}>
      <SmartNav />

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(19,220,232,.15), transparent)`,
        }}
      />

      <main className={`relative z-10 max-w-5xl mx-auto px-6 pb-20 ${userId ? 'pt-8' : 'pt-[100px]'}`}>
        {/* Hero */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(19,220,232,.15)', color: '#13dce8' }}
          >
            🎙 Podcast
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight">HYSKY Pod</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Conversations with aviation, hydrogen, and climate tech innovators pushing the industry
            forward.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a
              href="https://www.youtube.com/@hy-sky"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,0,0,.15)', color: '#ff6666', border: '1px solid rgba(255,0,0,.25)' }}
            >
              ▶ YouTube
            </a>
          </div>
        </div>

        {/* Episodes Grid */}
        {episodes.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  <VideoCard youtubeUrl={ep.youtubeUrl} title={ep.title} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      {ep.episodeNumber && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(19,220,232,.15)', color: '#13dce8' }}
                        >
                          Ep. {ep.episodeNumber}
                        </span>
                      )}
                      <span className="text-white/30 text-xs">
                        {new Date(ep.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1 leading-snug">{ep.title}</h3>
                    {ep.description && (
                      <p className="text-white/40 text-sm leading-relaxed line-clamp-3">{ep.description}</p>
                    )}
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/25">
            <p className="text-lg mb-2">Episodes coming soon.</p>
            <a
              href="https://www.youtube.com/@hy-sky"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#13dce8]/60 hover:text-[#13dce8] transition-colors text-sm"
            >
              Follow @hy-sky on YouTube to be notified →
            </a>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16 pt-12" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <p className="text-white/35 text-sm mb-2">Want to be a guest on HYSKY Pod?</p>
          <a
            href="mailto:admin@hysky.org"
            className="text-[#13dce8]/70 hover:text-[#13dce8] transition-colors text-sm font-medium"
          >
            Reach out →
          </a>
        </div>
      </main>
    </div>
  )
}
