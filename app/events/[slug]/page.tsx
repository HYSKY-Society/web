import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvent } from '@/lib/events'
import { EventRegisterButton } from '@/components/EventRegisterButton'
import { ZEFFY } from '@/lib/zeffy'
import PublicShell from '@/app/components/PublicShell'

const flyingHyOptions = [
  { label: 'Attendee', icon: '🎟️', embedUrl: ZEFFY.flyingHyAttendee },
  { label: 'Sponsor', icon: '🏆', embedUrl: ZEFFY.flyingHySponsor },
  { label: 'Membership', icon: '👥', embedUrl: ZEFFY.membership },
]

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = getEvent(params.slug)
  if (!event) notFound()

  const options = event.sponsorshipEmbedSlug
    ? flyingHyOptions
    : [{ label: 'Register', icon: '🎟️', embedUrl: `https://www.zeffy.com/en-US/embed/ticketing/${event.attendeeEmbedSlug}` }]

  return (
    <PublicShell>
      <div className="text-white max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/events" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          ← Back to Events
        </Link>

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(93,0,245,.35), rgba(0,212,212,.12))',
            border: '1px solid rgba(93,0,245,.4)',
          }}
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#5d00f5' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5 bg-[#5d00f5]/25 text-[#9b6dff]">
              ✈️ Featured Event
            </div>
            {event.subtitle && <div className="text-white/50 text-sm mb-1">{event.subtitle}</div>}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{event.title}</h1>
            <p className="text-white/55 text-lg leading-relaxed max-w-2xl mb-8">{event.tagline}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              <div className="bg-black/20 rounded-xl p-4 border border-white/8">
                <div className="text-xl mb-1">📅</div>
                <div className="text-white/40 text-xs mb-0.5">Date</div>
                <div className="text-white font-semibold text-sm">{event.date}</div>
              </div>
              <div className="bg-black/20 rounded-xl p-4 border border-white/8">
                <div className="text-xl mb-1">🕘</div>
                <div className="text-white/40 text-xs mb-0.5">Time</div>
                <div className="text-white font-semibold text-sm">{event.time}</div>
              </div>
              <div className="bg-black/20 rounded-xl p-4 border border-white/8">
                <div className="text-xl mb-1">💻</div>
                <div className="text-white/40 text-xs mb-0.5">Format</div>
                <div className="text-white font-semibold text-sm">{event.format}</div>
              </div>
            </div>

            <p className="text-white/55 text-base leading-relaxed mb-8 max-w-2xl">{event.description}</p>

            <EventRegisterButton
              label="Get Your Ticket →"
              options={options}
              title={`${event.title} — Registration`}
              className="btn-teal-glow inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl text-base transition-all hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Ticket options info */}
        {event.sponsorshipEmbedSlug && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
            <h2 className="font-bold text-xl mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5d00f5]" />
              Ticket Options
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">🎟️</div>
                <h3 className="font-semibold text-white mb-1">Attendee</h3>
                <p className="text-white/50 text-sm">Join as an attendee and be part of the world&apos;s largest hydrogen aviation conference.</p>
              </div>
              <div className="border border-[#5d00f5]/30 bg-[#5d00f5]/8 rounded-xl p-5">
                <div className="text-2xl mb-2">🏆</div>
                <h3 className="font-semibold text-white mb-1">Sponsor</h3>
                <p className="text-white/50 text-sm">Gain visibility among 240+ industry professionals and demonstrate your commitment to hydrogen aviation.</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="rounded-3xl p-8 sm:p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(93,0,245,.2), rgba(93,0,245,.05))', border: '1px solid rgba(93,0,245,.3)' }}>
          <h2 className="font-bold text-2xl mb-2">Ready to join?</h2>
          <p className="text-white/50 mb-6">Secure your spot at {event.title}.</p>
          <EventRegisterButton
            label="Get Your Ticket →"
            options={options}
            title={`${event.title} — Registration`}
            className="inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-base bg-[#5d00f5]"
          />
        </div>
      </div>
    </PublicShell>
  )
}
