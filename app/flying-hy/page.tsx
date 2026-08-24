import { EventRegisterButton } from '@/components/EventRegisterButton'
import { ZEFFY } from '@/lib/zeffy'
import PublicShell from '@/app/components/PublicShell'
import FlyingHyAgenda from '@/app/components/FlyingHyAgenda'
import { getFlyingHyAgenda } from '@/lib/flying-hy-agenda'
import FlyingHyInPageNav from './FlyingHyInPageNav'

export const revalidate = 3600

const registerOptions = [
  { label: 'Attendee', icon: '🎟️', embedUrl: ZEFFY.flyingHyAttendee },
  { label: 'Sponsor',  icon: '🏆', embedUrl: ZEFFY.flyingHySponsor },
  { label: 'Membership', icon: '👥', embedUrl: ZEFFY.membership },
]

const faqs = [
  { q: 'Is FLYING HY 2026 free?', a: 'FLYING HY 2026 requires a ticket. Multiple tiers are available including attendee and sponsor packages. Students and researchers may qualify for community tickets — reach out to admin@hysky.org.' },
  { q: 'Is the event virtual or in-person?', a: 'FLYING HY 2026 is fully virtual, held on Zoom on November 4, 2026 from 8:00 AM to 6:05 PM CT.' },
  { q: 'Will sessions be recorded?', a: 'Sessions will be recorded and made available to registered attendees following the event.' },
  { q: 'Can my organization sponsor FLYING HY?', a: 'Yes! Multiple sponsorship packages are available. Register as a sponsor through the ticket portal or contact admin@hysky.org for custom packages.' },
  { q: 'Who should attend?', a: 'FLYING HY is designed for engineers, researchers, regulators, policymakers, investors, and innovators across the hydrogen aviation ecosystem — from UAVs to passenger aircraft, fuel cells to infrastructure.' },
  { q: 'How do I get updates?', a: 'Subscribe to the HySky newsletter and follow @hysky_society on social media for speaker announcements, agenda releases, and event updates.' },
]

const eventArchive = [
  { year: 2026, href: '/events/flying-hy-2026', external: false },
  { year: 2025, href: 'https://www.hysky.org/flyinghy2025', external: true },
  { year: 2024, href: 'https://www.hysky.org/flyinghy2024', external: true },
  { year: 2023, href: 'https://www.hysky.org/flyinghy2023', external: true },
]

const speakerHeadshots: Record<string, string | string[]> = {
  'Danielle McLean': '1uDNh6QU9gidXhZBP9DHj44KVI8e19IR2',
  'Catherine (Cat) Wren & Jamie Santiago Muñoz': [
    '1LjHuK-F28ZYNPGH2ZcaodwTYsTCiG8yR',
    '1zzJGENmru0lPzi1JiBYErtwNlPy6qA9t',
  ],
  'Christine Ourmières-Widener': '1D56qPu_R6ZBSGEMcq1ZBRsSeCg0r7uce',
  'Dr. Phil Elliott': '142riIo3OJFcGA226RSbpOPEV-plkgQZP',
  'Helen Leadbetter': '1llmCYsaPC4XnffmOmEuUUxA9momAQ12n',
  'Irwin Kerboriou': '1BsLN4wx4JzaG0dqdkBm0A4XTvQDj8toj',
  'Dr. Josef Kallo': '1s-ucIi1d2QocqDesDf23gNkNWK1TJZLn',
  'Karl Samuelsson': '10yvo5u1HwLRrzFsPU5XZ8plP75KS756J',
  'Dr. Eva Maleviti': '1tUwQYn9kWYRBV4JDcbWyhWnWRafafbJ5',
  'Jared Semik': '16iAjjBDhU1x5c5nEmV6tBqL0zay1qrip',
  'Michael Bluy': '1pVfYMH_R41Bcsk7TnNk8dkw3c-STfVDz',
  'Joshua Heyne': '1DvSNgqWKWX_1NXhkf0Lk09WBF50cC243',
  'Mark van Wyk': '1ICYFaG8wUlVQCV9SKONF1jwLQtiKWlih',
  'Martin Chan': '1i4pljgjeiM_mvUBxw3x9WOsqfCyVu9cC',
  'Mikael Cardinal': '1QTWD7i57uRMQWy7Bc-0vDOLZZaOr1Vnv',
  'Chris McWhinney': '1nimB7u-ihmF2_3XE2FXC61NcZwHJguhP',
  'Bentzion Levinson': '19xmFPC9BMBtiP0zKRzjVW5-Y9pV0_sM9',
  'Dr. Anita Sengupta': '1wfKEs0Du4e5rIWOcIUvftU-3AzCRe2pB',
  'Matt Moran': '1JlO1KSVLK1DeAnOdBYQugPlFzqt2DGdZ',
  'Tsion Abreha': '1Z4qmsEToyIoyMfqHj3QXFSTUcYG9UFmd',
  'Dr. Jason Damazo': '1pb9TcnfstVaamhYHhOV9-3QlP5C6Oa_Y',
  'Paul Gloyer': '1H7iSW7n2_7azR8cx251OU1wElfyn88ar',
  'Barry Prince': '18S-E6GIUpQmAGMpB4Z1stVPARLo71kPl',
  'Dr. Ben Emerson': '1kXQ_JsszwAv61SNNNSX-1pWuwF7iernC',
  'Catalin Fotache': '1i2aEk1EOhjYjF6Z1F5_R4V1hVApChxJk',
  'Dr. Nick Ingarra': '1SnUkSfUEvKO070kKUAq48qX0Cyc07CRJ',
  'Serge Markoff': '1GVriCcRazhAPemmBCtHG3n0qrOKKSTtx',
  'John Piasecki': '1HnPhjNKO-RCACdDjN-KprHKOSvOWqzTX',
  'Dr. Jacob Leachman': '1edUT0HpOYr-qN1kxI6OUpcLBlgldlb9e',
  'Dr. Philip Stuckey': '1-jK2vVHeqmkd-9RGmHvP2qcit8rfYbEI',
  'Sara Mitran': '1iSeNIds6NiIFQ83lSFt6lim-EIxI4bQw',
}

const speakerCompanyLogos: Record<string, string> = {
  'Danielle McLean': '1a_DXOvaYgklgU9rCLStdW9Zi1qg6bbaV',
  'Catherine (Cat) Wren & Jamie Santiago Muñoz': '1Lx5EzFDGZ29ZjaexUrpEkFmWMYx79Unp',
  'Christine Ourmières-Widener': '12uDf7dahJrcmzwuF4yFmRBGOlO3DMoOf',
  'Dr. Phil Elliott': '1muduWldKMrfjt65GnJUl901Nl7cJUOps',
  'Helen Leadbetter': '1eoa9TyvggyoYqQDSUCo20nFzIKSRasYt',
  'Irwin Kerboriou': '17T6OIc4xgqNFGfmiq4cJw3cQjj2qHxXQ',
  'Dr. Josef Kallo': '1AnwEJMBa3Ip_V0teDLZd0WbnGtnjRrqF',
  'Karl Samuelsson': '1DGR5AiZkb3yQAM6-4Q3FnqcGfLLdUCwj',
  'Dr. Eva Maleviti': '1NgS7lngr0cNs_umCUFq2z1n_JTSNpbFM',
  'Jared Semik': '1cpMRS_XLdYFZRvceruX5dv15jg3NXoS2',
  'Michael Bluy': '1inv1dNhKacwolN5j39fDfZhXHPx6doPH',
  'Joshua Heyne': '17Gcs7CMY7gOpg1TgzB6KGpW8VteEPl7U',
  'Mark van Wyk': '1Ob9stA6mGmYRz6K2NU4wT9H6EWsHz2vt',
  'Martin Chan': '1qscpgfVYZvpM6iPF0n1DzJf6JztZLa3x',
  'Mikael Cardinal': '1AZRDgyO2ZhCx0RAZaQQjAJwQnJrR02Ht',
  'Chris McWhinney': '1kJk1A9t5A2Kz5msEmGlIu3oTZnrTSr_P',
  'Bentzion Levinson': '1mafs5sX59661HsGue522vbpBSjD6JHWq',
  'Dr. Anita Sengupta': '1JTWhX0tsc7skOg68RMinv-MRNfISlV9w',
  'Matt Moran': '1xU2Xwz6HZGO1MTfOYrfvth8dYo9-DoCk',
  'Tsion Abreha': '1a_DXOvaYgklgU9rCLStdW9Zi1qg6bbaV',
  'Dr. Jason Damazo': '19Rhg3oLHbZXGc45hjaBQlnXhUMCW29ir',
  'Paul Gloyer': '13vfZsvfONqn5dGaJ97Ky1ruc9eP-QEpl',
  'Barry Prince': '1_IFRXbSOpODaIh5xWOge4XEBgRbs4snd',
  'Dr. Ben Emerson': '1CeJP4jC5vREl8yhm0srGLqZH8OIRgVMK',
  'Catalin Fotache': '1pwpOjFB5S92fmcqASU13d0NOf9a16wOL',
  'Dr. Nick Ingarra': '11FbP9W-3-eb4VlPMVTh8eTLom9ySY73p',
  'Serge Markoff': '1vYZBNGutaEx6kSEWeG-G07h_J7k_tr4A',
  'John Piasecki': '1R5AwiYAolAkTbnQf7XazzrHD_ncEiZJg',
  'Dr. Jacob Leachman': '1xd-lNETduaB6h93_nBzBpdxv2qM5JQ-q',
  'Dr. Philip Stuckey': '1ZrrQaRya22jYonbuiSUfPz5DhxaMXxDv',
  'Sara Mitran': '1cYG_waIKiZ15I_tFvQqS1HLkiuzFVqeK',
}

function speakerHeadshotUrls(name: string): string[] {
  const fileIds = speakerHeadshots[name]
  if (!fileIds) return []

  return (Array.isArray(fileIds) ? fileIds : [fileIds]).map(
    (fileId) => `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
  )
}

function speakerCompanyLogoUrl(name: string): string | null {
  const fileId = speakerCompanyLogos[name]
  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w600` : null
}

export default async function FlyingHyPage() {
  const agenda = await getFlyingHyAgenda()

  return (
    <PublicShell>
      {/* ── HERO — always dark, atmospheric ── */}
      <section
        className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden section-dark"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 60% 40%, rgba(93,0,245,.35), transparent),
            radial-gradient(ellipse 50% 50% at 20% 70%, rgba(0,212,212,.15), transparent),
            var(--bg-page-deep)
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
          <h1 className="flying-hy-display uppercase leading-[.88] tracking-[-3px] mb-6"
            style={{ fontSize: 'clamp(4rem, 10vw, 9rem)' }}>
            <span className="flying-hy-title-flying">FLYING</span><br /><span style={{ color: '#5d00f5' }}>HY</span>{' '}
            <span style={{ color: '#13dce8' }}>2026</span>
          </h1>
          <div className="flex flex-wrap gap-4 text-white/55 text-sm mb-8">
            <span className="flex items-center gap-1.5"><span>📅</span> November 4, 2026</span>
            <span className="flex items-center gap-1.5"><span>🕘</span> 8:00 AM – 6:05 PM CT</span>
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

      {/* ── SPEAKERS ── */}
      <section id="speakers" className="scroll-mt-[110px] max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-10 text-[#5d00f5]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Speakers
        </h2>
        <div className="grid items-start sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agenda.map((speaker) => {
            const headshotUrls = speakerHeadshotUrls(speaker.name)
            const companyLogoUrl = speakerCompanyLogoUrl(speaker.name)

            return (
              <article
                key={`${speaker.time}-${speaker.name}`}
                tabIndex={0}
                aria-label={`${speaker.name}, ${speaker.company}. Hover or focus to view company.`}
                className="group relative min-h-[340px] rounded-2xl outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-[#13dce8] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <div aria-hidden="true" className="invisible px-6 py-8">
                  {headshotUrls.length > 0 ? <div className="h-28 mb-6" /> : null}
                  <h3 className="font-bold text-lg mb-0.5">{speaker.name}</h3>
                  <p className="text-sm">{speaker.title}</p>
                  <p className="text-xs font-semibold mt-1">{speaker.company}</p>
                </div>
                <div className="absolute inset-0 h-full min-h-[340px] transition-transform duration-700 ease-out [transform-style:preserve-3d] [-webkit-transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)] motion-reduce:duration-0">
                  <div
                    className="absolute inset-0 rounded-2xl px-6 py-8 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
                    style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
                  >
                    {headshotUrls.length > 0 ? (
                      <div className="flex -space-x-4 mb-6">
                        {headshotUrls.map((headshotUrl, index) => (
                          <img
                            key={headshotUrl}
                            src={headshotUrl}
                            alt={`${speaker.name} headshot${headshotUrls.length > 1 ? ` ${index + 1}` : ''}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-28 h-28 rounded-full object-cover ring-2 ring-[#5d00f5]/50"
                          />
                        ))}
                      </div>
                    ) : null}
                    <h3 className="font-bold text-white text-lg mb-0.5">{speaker.name}</h3>
                    <p className="text-white/55 text-sm">{speaker.title}</p>
                    <p className="text-[#9b6dff] text-xs font-semibold mt-1">{speaker.company}</p>
                  </div>

                  <div
                    className="flying-hy-speaker-back absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-8 text-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]"
                    style={{
                      border: '1px solid rgba(19,220,232,.35)',
                      boxShadow: 'inset 0 0 60px rgba(93,0,245,.12)',
                    }}
                  >
                    <div className="absolute inset-3 rounded-xl border border-white/10" aria-hidden="true" />
                    <p className="flying-hy-representing relative mt-3 mb-2 text-[10px] font-bold uppercase tracking-[2px]">Representing</p>
                    <div className="relative mb-5 flex h-36 w-full max-w-[230px] items-center justify-center rounded-2xl border border-white/20 bg-black p-5 shadow-[0_18px_55px_rgba(0,0,0,.28)]">
                      {companyLogoUrl ? (
                        <img
                          src={companyLogoUrl}
                          alt={`${speaker.company} logo`}
                          loading="eager"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-black text-black/75">{speaker.company}</span>
                      )}
                    </div>
                    <p className="relative mt-2 text-lg font-bold text-white">{speaker.company}</p>
                    <p className="relative mt-3 pb-3 text-xs text-white/45">Speaker bio coming soon</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <div className="h-px mx-6 lg:mx-8" style={{ background: 'var(--border-muted)' }} />

      {/* ── LIVE AGENDA ── */}
      <div className="px-6 lg:px-8 py-20">
        <FlyingHyAgenda agenda={agenda} />
      </div>

      <div className="h-px mx-6 lg:mx-8" style={{ background: 'var(--border-muted)' }} />

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
            <div key={tier} className="rounded-2xl p-6"
              style={{ background: 'var(--surface-subtle)', border: `1px solid ${color}30` }}>
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
            className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.02] bg-[#5d00f5] shadow-[0_0_30px_rgba(93,0,245,.4)]"
            style={{ color: '#fff' } as React.CSSProperties}
          />
          <a href="mailto:admin@hysky.org?subject=FLYING HY 2026 Sponsorship"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-semibold px-7 py-3.5 rounded-xl border border-white/15 hover:border-white/30 transition-colors">
            Contact Us
          </a>
        </div>
      </section>

      <div className="h-px mx-6 lg:mx-8" style={{ background: 'var(--border-muted)' }} />

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-[110px] max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-[2.5px] mb-4">FAQ</div>
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-10" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Frequently Asked <span style={{ color: '#5d00f5' }}>Questions</span>
        </h2>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="rounded-xl p-6"
              style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}>
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
            <h2 className="font-black uppercase text-3xl sm:text-4xl mb-3 text-white">Reserve Your Seat</h2>
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

      {/* ── EVENT ARCHIVE ── */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 pb-20">
        <div className="h-px mb-12" style={{ background: 'var(--border-muted)' }} />
        <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-[2.5px] mb-6">Event Archive</div>
        <div className="flex flex-wrap gap-4">
          {eventArchive.map(({ year, href, external }) => (
            <a key={year} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm text-white/60 hover:text-white transition-all hover:scale-[1.02]"
              style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-soft)' }}>
              ✈️ FLYING HY {year}
            </a>
          ))}
        </div>
      </section>
    </PublicShell>
  )
}

