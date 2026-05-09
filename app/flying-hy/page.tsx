import Link from 'next/link'
import { db } from '@/lib/db'
import { flyingHySpeakers, flyingHyAgenda } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'
import { EventRegisterButton } from '@/components/EventRegisterButton'
import { ZEFFY } from '@/lib/zeffy'
import PublicShell from '@/app/components/PublicShell'
import FlyingHyInPageNav from './FlyingHyInPageNav'

export const revalidate = 3600

const YEAR = 2026

const registerOptions = [
  { label: 'Attendee', icon: '🎟️', embedUrl: ZEFFY.flyingHyAttendee },
  { label: 'Sponsor',  icon: '🏆', embedUrl: ZEFFY.flyingHySponsor },
  { label: 'Membership', icon: '👥', embedUrl: ZEFFY.membership },
]

const faqs = [
  { q: 'Is FLYING HY 2026 free?', a: 'FLYING HY 2026 requires a ticket. Multiple tiers are available including attendee and sponsor packages. Students and researchers may qualify for community tickets — reach out to admin@hysky.org.' },
  { q: 'Is the event virtual or in-person?', a: 'FLYING HY 2026 is fully virtual, held on Zoom on November 4, 2026 from 9:00 AM to 5:00 PM CT.' },
  { q: 'Will sessions be recorded?', a: 'Sessions will be recorded and made available to registered attendees following the event.' },
  { q: 'Can my organization sponsor FLYING HY?', a: 'Yes! Multiple sponsorship packages are available. Register as a sponsor through the ticket portal or contact admin@hysky.org for custom packages.' },
  { q: 'Who should attend?', a: 'FLYING HY is designed for engineers, researchers, regulators, policymakers, investors, and innovators across the hydrogen aviation ecosystem — from UAVs to passenger aircraft, fuel cells to infrastructure.' },
  { q: 'How do I get updates?', a: 'Subscribe to the HYSKY newsletter and follow @hysky_society on social media for speaker announcements, agenda releases, and event updates.' },
]

const previousEditions = [
  { year: 2025, href: 'https://www.hysky.org/flyinghy2025' },
  { year: 2024, href: 'https://www.hysky.org/flyinghy2024' },
  { year: 2023, href: 'https://www.hysky.org/flyinghy2023' },
]

export default async function FlyingHyPage() {
  let speakers: typeof flyingHySpeakers.$inferSelect[] = []
  let agenda: typeof flyingHyAgenda.$inferSelect[] = []
  try {
    ;[speakers, agenda] = await Promise.all([
      db.select().from(flyingHySpeakers)
        .where(eq(flyingHySpeakers.isPublished, true))
        .orderBy(asc(flyingHySpeakers.eventYear), asc(flyingHySpeakers.displayOrder))
        .then(rows => rows.filter(s => s.eventYear === YEAR)),
      db.select().from(flyingHyAgenda)
        .where(eq(flyingHyAgenda.eventYear, YEAR))
        .orderBy(asc(flyingHyAgenda.displayOrder)),
    ])
  } catch { /* tables not yet migrated */ }

  return (
    <PublicShell>
      {/* ── HERO ── */}
      <section
        className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 60% 40%, rgba(93,0,245,.35), transparent),
            radial-gradient(ellipse 50% 50% at 20% 70%, rgba(0,212,212,.15), transparent),
            #04030a
          `,
        }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 85%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 85%)',
        }} />
        <div className="relative z-10 max-w-5xl px-6 lg:px-8 py-20 mx-auto w-full">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[2.5px] px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(93,0,245,.2)', color: '#9b6dff' }}>
            ✈️ The 4th Global H₂ Aviation Conference
          </div>
          <h1 className="font-black uppercase leading-[.88] tracking-[-3px] mb-6"
            style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', color: '#fff' }}>
            FLYING<br /><span style={{ color: '#5d00f5' }}>HY</span>{' '}
            <span style={{ color: '#13dce8' }}>2026</span>
          </h1>
          <div className="flex flex-wrap gap-4 text-white/55 text-sm mb-8">
            <span className="flex items-center gap-1.5"><span>📅</span> November 4, 2026</span>
            <span className="flex items-center gap-1.5"><span>🕘</span> 9:00 AM – 5:00 PM CT</span>
            <span className="flex items-center gap-1.5"><span>💻</span> Virtual (Zoom)</span>
          </div>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mb-10">
            A one-day virtual summit charting the path to commercial hydrogen aviation — bringing together the engineers, regulators, and pioneers building the future of flight.
          </p>
          <div className="flex flex-wrap gap-4">
            <EventRegisterButton
              label="Reserve Your Seat →"
              options={registerOptions}
              title="FLYING HY 2026 — Registration"
              className="btn-teal-glow inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-all hover:scale-[1.02]"
            />
            <a href="#agenda" className="inline-flex items-center gap-2 text-white/60 hover:text-white font-semibold px-7 py-3.5 rounded-xl text-base border border-white/15 hover:border-white/30 transition-colors">
              View Agenda
            </a>
          </div>
        </div>
      </section>

      {/* ── STICKY IN-PAGE NAV ── */}
      <FlyingHyInPageNav />

      {/* ── ABOUT ── */}
      <section id="about" className="scroll-mt-[110px] max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-[2.5px] mb-4">About</div>
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Built for the People Designing<br /><span style={{ color: '#5d00f5' }}>the Future of Flight</span>
        </h2>
        <div className="grid lg:grid-cols-2 gap-12">
          <p className="text-white/55 text-lg leading-relaxed">
            FLYING HY is the world&apos;s largest annual hydrogen aviation conference. Each year, it brings together the most influential voices across hydrogen aviation — engineers, regulators, investors, infrastructure builders, and policy advocates — for a focused day of ideas, debates, and breakthroughs.
          </p>
          <p className="text-white/55 text-lg leading-relaxed">
            From UAVs and eVTOLs to fixed-wing aircraft, fuel cells, storage systems, and ground infrastructure — if it combines hydrogen and aviation, it belongs at FLYING HY.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {[
            { stat: '4th', label: 'Annual Edition', icon: '🏆' },
            { stat: '1 Day', label: 'Intensive Program', icon: '📅' },
            { stat: 'Global', label: 'Virtual Access', icon: '🌍' },
          ].map(({ stat, label, icon }) => (
            <div key={stat} className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-3xl font-black text-white mb-1">{stat}</div>
              <div className="text-white/40 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px mx-6 lg:mx-8" style={{ background: 'rgba(255,255,255,.07)' }} />

      {/* ── SPEAKERS ── */}
      <section id="speakers" className="scroll-mt-[110px] max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-[2.5px] mb-4">Speakers</div>
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Who&apos;s <span style={{ color: '#5d00f5' }}>Speaking</span>
        </h2>
        {speakers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map(s => (
              <div key={s.id} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                {s.avatarUrl ? (
                  <img src={s.avatarUrl} alt={s.name} className="w-16 h-16 rounded-full object-cover mb-4" />
                ) : (
                  <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center text-2xl font-black" style={{ background: 'rgba(93,0,245,.25)', color: '#9b6dff' }}>
                    {s.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-bold text-white text-lg mb-0.5">{s.name}</h3>
                {s.title && <p className="text-white/50 text-sm">{s.title}</p>}
                {s.organization && <p className="text-[#9b6dff] text-xs font-semibold mt-0.5">{s.organization}</p>}
                {s.sessionTitle && (
                  <p className="text-white/35 text-xs mt-3 leading-relaxed italic">&ldquo;{s.sessionTitle}&rdquo;</p>
                )}
                {s.bio && <p className="text-white/40 text-xs mt-3 leading-relaxed line-clamp-3">{s.bio}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
            <div className="text-4xl mb-4">🎤</div>
            <p className="text-white/40 text-lg font-semibold mb-1">Speakers to be announced</p>
            <p className="text-white/25 text-sm">Follow HYSKY Society on social media for speaker announcements.</p>
          </div>
        )}
      </section>

      <div className="h-px mx-6 lg:mx-8" style={{ background: 'rgba(255,255,255,.07)' }} />

      {/* ── AGENDA ── */}
      <section id="agenda" className="scroll-mt-[110px] max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-[#13dce8] text-xs font-bold uppercase tracking-[2.5px] mb-4">Agenda</div>
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Full Day <span style={{ color: '#13dce8' }}>Schedule</span>
        </h2>
        {agenda.length > 0 ? (
          <div className="space-y-3">
            {agenda.map((item, i) => (
              <div key={item.id} className="flex gap-4 rounded-xl p-5" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                <div className="shrink-0 w-24 text-right">
                  <span className="text-[#13dce8] text-xs font-bold">{item.timeSlot ?? `Session ${i + 1}`}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white text-sm">{item.title}</p>
                    {item.sessionType !== 'session' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                        style={{ background: item.sessionType === 'keynote' ? 'rgba(93,0,245,.25)' : 'rgba(255,255,255,.08)', color: item.sessionType === 'keynote' ? '#9b6dff' : 'rgba(255,255,255,.4)' }}>
                        {item.sessionType}
                      </span>
                    )}
                  </div>
                  {item.speakerName && <p className="text-white/40 text-xs">{item.speakerName}</p>}
                  {item.description && <p className="text-white/35 text-xs mt-1 leading-relaxed">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
            <div className="text-4xl mb-4">📋</div>
            <p className="text-white/40 text-lg font-semibold mb-1">Agenda coming soon</p>
            <p className="text-white/25 text-sm">The full day agenda will be published ahead of the event.</p>
          </div>
        )}
      </section>

      <div className="h-px mx-6 lg:mx-8" style={{ background: 'rgba(255,255,255,.07)' }} />

      {/* ── SPONSORS ── */}
      <section id="sponsors" className="scroll-mt-[110px] max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-[2.5px] mb-4">Sponsors</div>
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Partner with <span style={{ color: '#5d00f5' }}>FLYING HY</span>
        </h2>
        <p className="text-white/55 text-lg leading-relaxed max-w-2xl mb-10">
          Gain visibility among hundreds of hydrogen aviation professionals and demonstrate your commitment to the future of clean flight.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {[
            { tier: 'Attendee Sponsor', desc: 'Brand visibility in event materials and virtual backdrop.', color: '#9b6dff' },
            { tier: 'Presenting Sponsor', desc: 'Opening remarks slot, prominent branding, and dedicated feature in post-event communications.', color: '#13dce8' },
          ].map(({ tier, desc, color }) => (
            <div key={tier} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${color}30` }}>
              <p className="font-bold text-white mb-2">{tier}</p>
              <p className="text-white/45 text-sm leading-relaxed mb-4">{desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <EventRegisterButton
            label="Become a Sponsor →"
            options={[{ label: 'Sponsor', icon: '🏆', embedUrl: ZEFFY.flyingHySponsor }]}
            title="FLYING HY 2026 — Sponsorship"
            className="inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.02] bg-[#5d00f5] shadow-[0_0_30px_rgba(93,0,245,.4)]"
          />
          <a href="mailto:admin@hysky.org?subject=FLYING HY 2026 Sponsorship"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-semibold px-7 py-3.5 rounded-xl border border-white/15 hover:border-white/30 transition-colors">
            Contact Us
          </a>
        </div>
      </section>

      <div className="h-px mx-6 lg:mx-8" style={{ background: 'rgba(255,255,255,.07)' }} />

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-[110px] max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-[2.5px] mb-4">FAQ</div>
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Frequently Asked <span style={{ color: '#5d00f5' }}>Questions</span>
        </h2>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
              <p className="font-bold text-white mb-2">{q}</p>
              <p className="text-white/50 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(93,0,245,.3), rgba(0,212,212,.1))', border: '1px solid rgba(93,0,245,.4)' }}>
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: '#5d00f5' }} />
          <div className="relative">
            <h2 className="font-black uppercase text-3xl sm:text-4xl mb-3">Reserve Your Seat</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">Join the engineers, regulators, and pioneers shaping the future of hydrogen aviation.</p>
            <EventRegisterButton
              label="Get Your Ticket →"
              options={registerOptions}
              title="FLYING HY 2026 — Registration"
              className="btn-teal-glow inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl text-base transition-all hover:scale-[1.03]"
            />
          </div>
        </div>
      </section>

      {/* ── PREVIOUS EDITIONS ── */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 pb-20">
        <div className="h-px mb-12" style={{ background: 'rgba(255,255,255,.07)' }} />
        <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-[2.5px] mb-6">Previous Editions</div>
        <div className="flex flex-wrap gap-4">
          {previousEditions.map(({ year, href }) => (
            <a key={year} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)' }}>
              ✈️ FLYING HY {year}
            </a>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}
