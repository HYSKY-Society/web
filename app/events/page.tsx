import Image from 'next/image'
import Link from 'next/link'
import { EventRegisterButton } from '@/components/EventRegisterButton'
import { ZEFFY } from '@/lib/zeffy'
import PublicShell from '@/app/components/PublicShell'
import SidebarIcon from '@/app/components/SidebarIcon'

const webinarDates = [
  'May 18, 2026',
  'June 15, 2026',
  'July 20, 2026',
  'August 17, 2026',
  'September 21, 2026',
  'October 26, 2026',
  'November 30, 2026',
]

const WEBINAR_LINK = 'https://us06web.zoom.us/meeting/register/tZUtd-GpqzojGdXo6wK6DVPDD55IQyYJvL1e#/registration'

const flyingHyOptions = [
  { label: 'Attendee', icon: '🎟️', embedUrl: ZEFFY.flyingHyAttendee },
  { label: 'Sponsor', icon: '🏆', embedUrl: ZEFFY.flyingHySponsor },
  { label: 'Membership', icon: '👥', embedUrl: ZEFFY.membership },
]

export default function EventsPage() {
  return (
    <PublicShell>
      <div className="text-white max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1.5">Events</h1>
          <p className="text-white/40">Upcoming HySky Society events and webinars.</p>
        </div>

        {/* Flying HY 2026 — Featured */}
        <div
          className="flying-hy-featured-card group relative mb-8 cursor-pointer overflow-hidden rounded-3xl p-8 transition-transform hover:scale-[1.005] sm:p-10"
          style={{
            background: `
              radial-gradient(ellipse 70% 70% at 82% 24%, rgba(93,0,245,.32), transparent),
              radial-gradient(ellipse 55% 60% at 18% 82%, rgba(19,220,232,.14), transparent),
              var(--bg-page-deep)
            `,
            border: '1px solid rgba(93,0,245,.4)',
          }}
        >
          <div className="flying-hy-featured-glow absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#5d00f5' }} />
          <Link
            href="/flying-hy"
            aria-label="View FLYING HY 2026 conference details"
            className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d00f5] focus-visible:ring-offset-2"
          />
          <div className="pointer-events-none relative z-20">
            <div className="event-category-badge flying-hy-featured-badge inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5 bg-[#5d00f5]/25 text-[#9b6dff]">
              <SidebarIcon name="plane" className="h-4 w-4" /> Featured Event
            </div>
            <h2
              className="flying-hy-display mb-2 uppercase leading-[.86] tracking-[-2px]"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.8rem)' }}
            >
              <span className="flying-hy-title-flying">FLYING</span><br />
              <span style={{ color: '#5d00f5' }}>HY</span>{' '}
              <span className="flying-hy-title-year">2026</span>
            </h2>
            <p className="mb-4 text-xs font-bold uppercase tracking-[2.5px] text-[var(--text-primary)] sm:text-sm">
              The 4th Annual Global Symposium
            </p>
            <div className="flex flex-wrap gap-4 text-[var(--text-primary)] text-sm mb-6">
              <span className="inline-flex items-center gap-2"><SidebarIcon name="events" className="h-4 w-4" /> November 4, 2026</span>
              <span className="inline-flex items-center gap-2"><SidebarIcon name="clock" className="h-4 w-4" /> 8:00 AM – 6:05 PM CT</span>
              <span className="inline-flex items-center gap-2"><SidebarIcon name="monitor" className="h-4 w-4" /> Zoom (Virtual)</span>
            </div>
            <p className="text-[var(--text-primary)] text-base leading-relaxed mb-6 max-w-2xl">
              A one-day virtual summit charting the path to <strong>hydrogen &amp; battery-electric</strong> aviation.
            </p>
            <div className="flex flex-wrap gap-3">
              <EventRegisterButton
                label="Register Now →"
                options={flyingHyOptions}
                title="FLYING HY 2026 — Get Your Ticket"
                className="btn-teal-glow flying-hy-featured-register pointer-events-auto relative z-20 inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-xl text-sm"
              />
              <Link
                href="/flying-hy"
                className="pointer-events-auto relative z-20 inline-flex items-center gap-2 text-white/60 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm border border-white/15 hover:border-white/30 transition-colors"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>

        {/* Speed Networking */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 bg-[#5d00f5]/20 text-[#9b6dff]">
                <SidebarIcon name="handshake" className="h-4 w-4" /> Weekly
              </div>
              <h2 className="text-xl font-bold mb-1">Speed Networking</h2>
              <p className="text-white/45 text-sm leading-relaxed max-w-xl mb-3">
                Connect with fellow HySky members every week in a fast-paced networking session.
              </p>
              <div className="flex flex-wrap gap-4 text-white/45 text-sm">
                <span className="inline-flex items-center gap-2"><SidebarIcon name="events" className="h-4 w-4" /> Every Wednesday</span>
                <span className="inline-flex items-center gap-2"><SidebarIcon name="clock" className="h-4 w-4" /> 9:00 – 9:45 AM CT</span>
                <span className="inline-flex items-center gap-2"><SidebarIcon name="monitor" className="h-4 w-4" /> Zoom</span>
              </div>
            </div>
            <EventRegisterButton
              label="Upgrade"
              options={[{ label: 'VIP Membership', icon: '👥', embedUrl: ZEFFY.membership }]}
              title="Upgrade to HySky VIP"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl bg-[#5d00f5] text-white hover:bg-[#7130f7] transition-colors cursor-pointer"
              style={{ color: '#fff' }}
            />
          </div>
        </div>

        {/* AIAA + HySky Sustainable Aviation Course */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <a
            href="https://aiaa.org/courses/advanced-sustainable-aviation-fuels-and-aircraft-design/"
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-6 overflow-hidden rounded-xl bg-white"
          >
            <Image
              src="/events/aiaa-saf-aircraft-design-course.jpg"
              alt="AIAA and HySky Advanced Sustainable Aviation Fuels and Aircraft Design online short course"
              width={1920}
              height={1080}
              className="w-full h-auto"
            />
          </a>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 bg-[#00D4D4]/15 text-[#00D4D4]">
                <SidebarIcon name="graduation" className="h-4 w-4" /> AIAA + HySky Online Course
              </div>
              <h2 className="text-xl font-bold mb-1">Advanced Sustainable Aviation Fuels and Aircraft Design</h2>
              <p className="text-white/45 text-sm leading-relaxed max-w-xl mb-3">
                A five-week joint AIAA and HySky Society course covering sustainable aviation fuels, hydrogen, hybrid-electric aircraft design, certification, safety, and airport infrastructure.
              </p>
              <div className="flex flex-wrap gap-4 text-white/45 text-sm">
                <span className="inline-flex items-center gap-2"><SidebarIcon name="events" className="h-4 w-4" /> September 22 – October 22, 2026</span>
                <span className="inline-flex items-center gap-2"><SidebarIcon name="clock" className="h-4 w-4" /> Tuesdays &amp; Thursdays, 1:00 – 3:00 PM ET</span>
                <span className="inline-flex items-center gap-2"><SidebarIcon name="monitor" className="h-4 w-4" /> Online</span>
              </div>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-2">
              <a
                href="https://aiaa.org/courses/advanced-sustainable-aviation-fuels-and-aircraft-design/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border transition-colors hover:bg-white/8"
                style={{ borderColor: '#00D4D4', color: '#00D4D4' }}
              >
                View Course &amp; Register →
              </a>
            </div>
          </div>
        </div>

        {/* HySky Monthly Webinar Series */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 bg-[#00D4D4]/15 text-[#00D4D4]">
                <SidebarIcon name="broadcast" className="h-4 w-4" /> Monthly Webinar
              </div>
              <h2 className="text-xl font-bold mb-1">HySky Monthly</h2>
              <p className="text-white/45 text-sm leading-relaxed max-w-xl">
                Free monthly educational webinars featuring leaders building the hydrogen aviation future. Open to all members.
              </p>
            </div>
            <a
              href={WEBINAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border transition-colors hover:bg-white/8"
              style={{ borderColor: '#00D4D4', color: '#00D4D4' }}
            >
              Register for Series →
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {webinarDates.map((date) => (
              <a
                key={date}
                href={WEBINAR_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between px-5 py-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-[#00D4D4]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#00D4D4] shrink-0" />
                  <span className="font-medium text-sm">{date}</span>
                </div>
                <span className="text-white/30 group-hover:text-[#00D4D4] text-xs transition-colors">Register →</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </PublicShell>
  )
}
