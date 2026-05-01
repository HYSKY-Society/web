import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ScrollAnimations from './components/ScrollAnimations'
import NewsletterPopup from './components/NewsletterPopup'
import HeroHelicopter from './components/HeroHelicopter'

const ZEFFY_MEMBERSHIP = 'https://www.zeffy.com/embed/ticketing/hysky-societys-membership?modal=true'

type Program = { tag: string; title: string; desc: string; href?: string }
const programs: Program[] = [
  { tag: 'Membership', title: 'HYSKY Connect', desc: 'A dedicated platform where the hydrogen aviation ecosystem connects, collaborates, and grows.' },
  { tag: 'Education', title: 'HYSKY Edu', desc: 'Courses and training for hydrogen aircraft certification, operations, infrastructure, safety, and policy.' },
  { tag: 'Event', title: 'FLYING HY', desc: "The world's largest annual hydrogen aviation event, bringing together innovators across air and aerospace.", href: '/flying-hy' },
  { tag: 'Webinars', title: 'HYSKY Monthly', desc: 'Free monthly webinars featuring leaders building the hydrogen aviation future.' },
  { tag: 'Podcast', title: 'HYSKY Pod', desc: 'Conversations with aviation, hydrogen, and climate tech innovators pushing the industry forward.' },
  { tag: 'Advocacy', title: 'Policy + Power', desc: 'Helping the ecosystem understand policy, engage responsibly, and advocate for hydrogen aviation progress.' },
]

const audience = [
  { text: 'Aircraft developers — UAVs, eVTOLs, fixed-wing, rotorcraft, WIG craft, spacecraft', highlight: false },
  { text: 'Hydrogen producers, logistics providers, and refueling infrastructure companies', highlight: false },
  { text: 'Fuel cell, propulsion, fuel management, and onboard storage innovators', highlight: false },
  { text: 'Researchers, universities, regulators, standards bodies, airports, policymakers', highlight: false },
  { text: 'Compliance and regulatory leads working across FAA, EASA, Transport Canada', highlight: false },
  { text: 'Anyone interested in hydrogen aviation… YOU', highlight: true },
]

export default async function HomePage() {
  const { userId } = auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: '#04030a', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <ScrollAnimations />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-[6%] py-5"
        style={{ background: 'rgba(4,3,10,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <Image src="/logo-new.png" alt="HYSKY Society" height={52} width={210} className="object-contain" />
        <div className="hidden sm:flex items-center gap-8">
          <a href="#programs" className="text-white/50 hover:text-white text-sm font-medium transition-colors">Programs</a>
          <a href="#connect" className="text-white/50 hover:text-white text-sm font-medium transition-colors">Community</a>
          <a href="#audience" className="text-white/50 hover:text-white text-sm font-medium transition-colors">Who It&apos;s For</a>
          <a
            {...({'zeffy-form-link': ZEFFY_MEMBERSHIP} as object)}
            className="font-black px-5 py-2.5 rounded-full text-sm transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #5d00f5, #13dce8) border-box',
              border: '2px solid transparent',
            }}
          >
            <span style={{
              background: 'linear-gradient(90deg, #5d00f5, #13dce8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Become a Member
            </span>
          </a>
        </div>
        <Link href="/sign-in" className="sm:hidden text-white/60 hover:text-white text-sm transition-colors">Login</Link>
      </nav>

      {/* ── HERO ── */}
      <header className="relative min-h-screen flex flex-col justify-between pt-[120px]">
        {/* Background */}
        <div className="absolute inset-0 z-0" style={{
          background: `
            radial-gradient(ellipse 60% 60% at 70% 40%, rgba(93,0,245,.28), transparent),
            radial-gradient(ellipse 40% 40% at 20% 70%, rgba(19,220,232,.12), transparent),
            #04030a
          `
        }}>
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 78%)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 78%)',
          }} />
        </div>

        <HeroHelicopter />

        {/* Hero content */}
        <div className="relative z-10 max-w-[900px] px-[6%] pt-20 pb-16">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-7">
            <span className="w-6 h-px bg-[#5d00f5]" />
            <span className="text-[#5d00f5] text-xs font-bold uppercase tracking-[2.5px]">Clean skies for future generations</span>
          </div>

          <h1 className="font-black uppercase leading-[.88] tracking-[-2px] mb-8" style={{ fontSize: 'clamp(3.5rem, 9vw, 9rem)' }}>
            Hydrogen<br />
            Powered<br />
            <span style={{ color: '#5d00f5' }}>Flight</span>
          </h1>

          <p className="text-white/50 text-lg leading-relaxed max-w-[520px] mb-10">
            HYSKY Society is a 501(c)(3) nonprofit accelerating the decarbonization of aviation through hydrogen-powered flight — through community, education, advocacy, and the world&apos;s leading hydrogen aviation programs.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <a
              {...({'zeffy-form-link': ZEFFY_MEMBERSHIP} as object)}
              className="bg-[#13dce8] hover:bg-white text-black font-black px-8 py-4 rounded-full text-base transition-all cursor-pointer"
              style={{ boxShadow: '0 0 35px rgba(19,220,232,.45)' }}
            >
              Join the Movement
            </a>
            <Link
              href="/sign-in"
              className="border border-white/[.08] text-white hover:border-[#13dce8] hover:text-[#13dce8] hover:shadow-[0_0_20px_rgba(19,220,232,.35)] px-7 py-4 rounded-full text-base font-bold transition-all"
            >
              Login Now
            </Link>
          </div>
        </div>
      </header>

      {/* ── PROGRAMS ── */}
      <section id="programs" className="px-[6%] py-28">
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-12" style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
          Core <span style={{ color: '#5d00f5' }}>Programs</span>
        </h2>
        <div className="fade-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)' }}>
          {programs.map((p) => (
            p.href ? (
              <Link key={p.title} href={p.href} className="p-9 bg-[#04030a] transition-colors hover:bg-[#5d00f5]/[.08] group cursor-pointer">
                <div className="text-[#5d00f5] text-xs font-bold uppercase tracking-[2px] mb-3">{p.tag}</div>
                <h3 className="text-xl font-black mb-2 group-hover:text-[#13dce8] transition-colors">{p.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{p.desc}</p>
              </Link>
            ) : (
              <div key={p.title} className="p-9 bg-[#04030a] transition-colors hover:bg-[#5d00f5]/[.08]">
                <div className="text-[#5d00f5] text-xs font-bold uppercase tracking-[2px] mb-3">{p.tag}</div>
                <h3 className="text-xl font-black mb-2">{p.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{p.desc}</p>
              </div>
            )
          ))}
        </div>
      </section>

      <div className="h-px mx-[6%]" style={{ background: 'rgba(255,255,255,.08)' }} />

      {/* ── CONNECT ── */}
      <section id="connect" className="px-[6%] py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[#5d00f5] text-xs font-bold uppercase tracking-[2.5px] mb-6">Community</div>
            <p className="font-black uppercase leading-[1.05] tracking-[-1px]" style={{ fontSize: 'clamp(2rem, 4vw, 3.8rem)' }}>
              If it defies gravity and uses hydrogen,{' '}
              <span style={{ color: '#5d00f5' }}>it belongs here.</span>
            </p>
          </div>
          <div className="lg:border-l lg:pl-16" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              From UAVs and eVTOLs to fixed-wing aircraft, rotorcraft, WIG craft, spacecraft, fuel cells, storage systems, refueling infrastructure, and hydrogen production — HYSKY is where the ecosystem meets.
            </p>
            <a
              {...({'zeffy-form-link': ZEFFY_MEMBERSHIP} as object)}
              className="inline-block bg-[#13dce8] hover:bg-white text-black font-black px-8 py-4 rounded-full text-base transition-all cursor-pointer"
              style={{ boxShadow: '0 0 35px rgba(19,220,232,.45)' }}
            >
              Become a Member
            </a>
          </div>
        </div>
      </section>

      <div className="h-px mx-[6%]" style={{ background: 'rgba(255,255,255,.08)' }} />

      {/* ── AUDIENCE ── */}
      <section id="audience" className="px-[6%] py-28">
        <div className="text-[#5d00f5] text-xs font-bold uppercase tracking-[2.5px] mb-4">Who It&apos;s For</div>
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] mb-4" style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
          Built for Every Corner <span style={{ color: '#5d00f5' }}>of the Ecosystem</span>
        </h2>
        <p className="text-white/50 text-lg leading-relaxed max-w-[560px] mb-12">
          If you are building, funding, regulating, researching, fueling, certifying, operating, or simply trying to understand hydrogen aviation — this is your place.
        </p>
        <div className="fade-up grid sm:grid-cols-2 gap-px rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)' }}>
          {audience.map((a) => (
            <div
              key={a.text}
              className={`flex items-center gap-4 px-7 py-6 text-sm font-medium transition-all cursor-default bg-[#04030a] ${
                a.highlight
                  ? 'audience-you text-[#13dce8] font-bold'
                  : 'text-white/45 hover:text-white hover:bg-[#5d00f5]/[.06]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.highlight ? 'bg-[#13dce8]' : 'bg-[#5d00f5]'}`} />
              {a.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative text-center px-[6%] py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 70% at center, rgba(93,0,245,.22), transparent)' }} />
        <div className="relative z-10">
          <div className="text-[#5d00f5] text-xs font-bold uppercase tracking-[2.5px] mb-6">Get Involved</div>
          <h2 className="font-black uppercase leading-[.92] tracking-[-1px] max-w-4xl mx-auto mb-5" style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}>
            The Future of Flight <span style={{ color: '#5d00f5' }}>Needs a Place to Gather.</span>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-[500px] mx-auto mb-10">
            HYSKY Society is building that place — through community, education, advocacy, awareness, and the world&apos;s leading hydrogen aviation programs.
          </p>
          <a
            {...({'zeffy-form-link': ZEFFY_MEMBERSHIP} as object)}
            className="inline-block bg-[#13dce8] hover:bg-white text-black font-black px-8 py-4 rounded-full text-base transition-all cursor-pointer"
            style={{ boxShadow: '0 0 35px rgba(19,220,232,.45)' }}
          >
            Join the Movement
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="flex flex-wrap justify-between items-center gap-4 px-[6%] py-8" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <Image src="/logo-new.png" alt="HYSKY Society" height={30} width={120} className="object-contain opacity-70" />
        <p className="text-white/35 text-sm">Clean skies for future generations through hydrogen-powered flight.</p>
        <NewsletterPopup />
        <p className="text-white/25 text-xs w-full sm:w-auto">© {new Date().getFullYear()} HYSKY Society. All rights reserved.</p>
      </footer>

      <Script src="https://zeffy-scripts.s3.ca-central-1.amazonaws.com/embed-form-script.min.js" strategy="lazyOnload" />
    </main>
  )
}
