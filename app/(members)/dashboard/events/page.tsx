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
const FLYING_HY_LINK = 'https://www.zeffy.com/en-US/ticketing/flying-hy--2026'

export default function EventsPage() {
  return (
    <div className="text-white max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Events</h1>
        <p className="text-white/40">Upcoming HYSKY Society events and webinars.</p>
      </div>

      {/* Flying HY 2026 — Featured */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(93,0,245,.35), rgba(0,212,212,.12))',
          border: '1px solid rgba(93,0,245,.4)',
        }}
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#5d00f5' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5 bg-[#5d00f5]/25 text-[#9b6dff]">
            ✈️ Featured Event
          </div>
          <div className="text-white/50 text-sm mb-1">The 4th Global</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">FLYING HY 2026 Conference</h2>
          <div className="flex flex-wrap gap-4 text-white/55 text-sm mb-6">
            <span>📅 November 4, 2026</span>
            <span>💻 Zoom</span>
            <span>🕘 9:00 AM – 5:00 PM CT</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-2xl">
            The world&apos;s largest annual hydrogen aviation event — bringing together innovators, researchers, regulators, and industry leaders from across air and aerospace.
          </p>
          <a
            href={FLYING_HY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-teal-glow inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-xl text-sm"
          >
            Register Now →
          </a>
        </div>
      </div>

      {/* HYSKY Monthly Webinar Series */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 bg-[#00D4D4]/15 text-[#00D4D4]">
              📡 Monthly Webinar
            </div>
            <h2 className="text-xl font-bold mb-1">HYSKY Monthly</h2>
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
  )
}
