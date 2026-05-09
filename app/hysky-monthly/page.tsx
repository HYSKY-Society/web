import { db } from '@/lib/db'
import { hyskySessions } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { getNextHyskyMonthly, formatSessionDate } from '@/lib/hysky-monthly'
import PublicShell from '@/app/components/PublicShell'
import VideoCard from '@/app/components/VideoCard'

export const revalidate = 3600

export default async function HyskyMonthlyPage() {
  const sessions = await db
    .select()
    .from(hyskySessions)
    .where(eq(hyskySessions.isPublished, true))
    .orderBy(desc(hyskySessions.sessionDate))

  const now = new Date()
  const upcoming = sessions.filter((s) => s.sessionDate > now)
  const past = sessions.filter((s) => s.sessionDate <= now)

  const nextDate = getNextHyskyMonthly()
  const nextFormatted = formatSessionDate(nextDate)

  const nextSession = upcoming[0] ?? null

  return (
    <PublicShell>
      <div className="relative">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(93,0,245,.22), transparent)`,
          }}
        />

        <main className="relative z-10 max-w-5xl mx-auto px-6 pb-20 pt-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(93,0,245,.2)', color: '#9b6dff' }}
            >
              Free Monthly Webinar
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight">
              HYSKY Monthly
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
              Free monthly webinars featuring the leaders building the hydrogen aviation future.
              Open to everyone — no membership required.
            </p>
          </div>

          {/* Next Session Card */}
          <div
            className="rounded-3xl p-8 sm:p-10 mb-16 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(93,0,245,.18), rgba(4,8,15,.95))',
              border: '1px solid rgba(93,0,245,.4)',
            }}
          >
            <p className="text-white/40 text-sm uppercase tracking-widest mb-2">Next Session</p>
            <h2 className="text-3xl font-bold mb-1">
              {nextSession?.title ?? 'Coming Soon'}
            </h2>
            <p className="text-[#9b6dff] font-semibold mb-3">{nextFormatted}</p>
            {nextSession?.description && (
              <p className="text-white/45 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                {nextSession.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {nextSession?.zoomUrl ? (
                <a
                  href={nextSession.zoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
                  style={{ background: '#5d00f5', boxShadow: '0 0 30px rgba(93,0,245,.4)' }}
                >
                  Register on Zoom →
                </a>
              ) : (
                <a
                  href="https://www.youtube.com/@hy-sky"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
                  style={{ background: '#FF0000' }}
                >
                  Watch Live on YouTube →
                </a>
              )}
            </div>
          </div>

          {/* Past Sessions */}
          {past.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Past Sessions</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {past.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
                  >
                    {session.youtubeUrl ? (
                      <VideoCard youtubeUrl={session.youtubeUrl} title={session.title} />
                    ) : (
                      <div
                        className="flex items-center justify-center text-white/20 text-sm"
                        style={{ height: '180px', background: 'rgba(255,255,255,.03)' }}
                      >
                        Recording coming soon
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-[#9b6dff] text-xs mb-1">
                        {new Date(session.sessionDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'UTC',
                        })}
                      </p>
                      <h3 className="font-semibold text-white mb-1">{session.title}</h3>
                      {session.description && (
                        <p className="text-white/40 text-sm leading-relaxed">{session.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {past.length === 0 && (
            <div className="text-center py-16 text-white/25">
              <p>Past recordings will appear here after each session.</p>
              <a
                href="https://www.youtube.com/@hy-sky"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-[#9b6dff] hover:text-[#5d00f5] transition-colors text-sm"
              >
                Watch on YouTube @hy-sky →
              </a>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-16 pt-12" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <p className="text-white/35 text-sm mb-4">Want to present at HYSKY Monthly?</p>
            <a
              href="mailto:admin@hysky.org"
              className="text-[#5d00f5] hover:text-[#9b6dff] transition-colors text-sm font-medium"
            >
              Get in touch →
            </a>
          </div>
        </main>
      </div>
    </PublicShell>
  )
}
