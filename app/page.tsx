import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const programs = [
  {
    tag: 'Membership',
    title: 'HYSKY Connect',
    desc: 'A dedicated membership platform where the hydrogen aviation ecosystem connects, collaborates, and grows.',
  },
  {
    tag: 'Education',
    title: 'HYSKY Edu',
    desc: 'A growing catalog of courses and training for hydrogen aircraft certification, operations, infrastructure, safety, and policy.',
  },
  {
    tag: 'Event',
    title: 'FLYING HY',
    desc: "The world's largest annual hydrogen aviation event, bringing together innovators across air and aerospace.",
  },
  {
    tag: 'Webinars',
    title: 'HYSKY Monthly',
    desc: 'Free monthly educational webinars featuring leaders building the hydrogen aviation future.',
  },
  {
    tag: 'Podcast',
    title: 'HYSKY Pod',
    desc: 'Conversations with aviation, hydrogen, and climate tech innovators pushing the industry forward.',
  },
  {
    tag: 'Advocacy',
    title: 'Policy + Power',
    desc: 'Helping the ecosystem understand policy, engage responsibly, and advocate for hydrogen aviation progress.',
  },
]

const audience = [
  'Aircraft developers — UAVs, eVTOLs, fixed-wing, rotorcraft, wing-in-ground craft, and more',
  'Hydrogen producers, logistics & delivery providers',
  'Hydrogen refueling infrastructure companies',
  'Onboard hydrogen storage innovators',
  'Hydrogen aviation propulsion, fuel management, and systems producers',
  'Fuel cell developers',
  'Researchers, universities, standards bodies, regulators, and policymakers',
  'Anybody interested in hydrogen-powered flight and clean skies for future generations',
]

export default async function HomePage() {
  const { userId } = auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-[#030306] text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <header
        className="relative min-h-screen flex flex-col justify-between px-6 sm:px-[7%] py-8"
        style={{
          background: `
            radial-gradient(circle at 75% 30%, rgba(93,0,245,.75), transparent 35%),
            radial-gradient(circle at 25% 80%, rgba(0,212,212,.35), transparent 30%),
            linear-gradient(135deg, #020204 0%, #090018 100%)
          `,
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
            `,
            backgroundSize: '70px 70px',
          }}
        />

        {/* Nav */}
        <nav className="relative z-10 flex justify-between items-center">
          <Image src="/logo-white.png" alt="HYSKY Society" height={36} width={130} className="object-contain" />
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="hidden sm:block text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Member Login
            </Link>
            <a
              href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00D4D4] hover:opacity-90 text-black px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-[1.03]"
            >
              Become a Member
            </a>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 py-16 sm:py-24 max-w-5xl">
          <div className="text-[#00D4D4] font-bold uppercase tracking-widest text-sm mb-5">
            Clean skies for future generations
          </div>
          <h1 className="font-black uppercase leading-none mb-7" style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}>
            Hydrogen<br />
            <span style={{ color: '#5d00f5', textShadow: '0 0 40px rgba(93,0,245,.7)' }}>Powered</span><br />
            <span style={{ color: '#00D4D4', textShadow: '0 0 35px rgba(0,212,212,.55)' }}>Flight</span>
          </h1>
          <p className="text-white/55 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
            HYSKY Society is a 501(c)(3) nonprofit dedicated to the decarbonization of aviation and aerospace through hydrogen-powered flight.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00D4D4] hover:opacity-90 text-black px-8 py-4 rounded-full font-black uppercase tracking-wide text-sm transition-all hover:scale-[1.03] shadow-[0_0_35px_rgba(0,212,212,.45)]"
            >
              Join the Movement
            </a>
            <Link
              href="/sign-in"
              className="border-2 border-[#5d00f5] bg-[#5d00f5]/20 hover:bg-[#5d00f5]/35 text-white px-8 py-4 rounded-full font-black uppercase tracking-wide text-sm transition-all"
            >
              Member Login
            </Link>
          </div>
        </div>

        {/* Mission strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: 'Connection', desc: 'Uniting the hydrogen aviation ecosystem.' },
            { title: 'Advocacy', desc: 'Advancing policy, standards, and adoption.' },
            { title: 'Awareness', desc: 'Making hydrogen flight visible and understood.' },
            { title: 'Education', desc: 'Training the workforce for zero-emission aviation.' },
          ].map((p) => (
            <div key={p.title} className="rounded-3xl p-5 backdrop-blur-md" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)' }}>
              <strong className="block text-[#00D4D4] mb-1.5">{p.title}</strong>
              <span className="text-white/55 text-sm leading-snug">{p.desc}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── PROGRAMS ── */}
      <section className="px-6 sm:px-[7%] py-24">
        <h2 className="font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
          The Hydrogen Aviation{' '}
          <span style={{ color: '#00D4D4' }}>Hub</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mb-12 leading-relaxed">
          HYSKY brings together the people, companies, regulators, researchers, and builders turning hydrogen-powered flight from vision into reality.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p) => (
            <div
              key={p.title}
              className="relative overflow-hidden rounded-3xl p-7 min-h-[240px] flex flex-col"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,.08), rgba(93,0,245,.12))',
                border: '1px solid rgba(255,255,255,.14)',
              }}
            >
              <div className="absolute w-44 h-44 rounded-full -right-12 -bottom-12 blur-3xl opacity-25" style={{ backgroundColor: '#5d00f5' }} />
              <span className="inline-block bg-[#00D4D4] text-black text-xs font-black uppercase px-3 py-1.5 rounded-full mb-4 w-fit">
                {p.tag}
              </span>
              <h3 className="text-2xl font-bold mb-3 relative z-10">{p.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed relative z-10">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── IF IT DEFIES GRAVITY ── */}
      <section className="px-6 sm:px-[7%] py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-black uppercase leading-none mb-7" style={{ fontSize: 'clamp(2.5rem, 5vw, 5.5rem)' }}>
              If It Defies Gravity And Uses Hydrogen,{' '}
              <span style={{ color: '#00D4D4' }}>It Belongs Here.</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              From UAVs and eVTOLs to fixed-wing aircraft, rotorcraft, wing-in-ground craft, spacecraft, fuel cells, storage systems, refueling infrastructure, and hydrogen production — HYSKY is where the ecosystem meets.
            </p>
            <a
              href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#00D4D4] hover:opacity-90 text-black px-8 py-4 rounded-full font-black uppercase tracking-wide text-sm transition-all hover:scale-[1.03] shadow-[0_0_35px_rgba(0,212,212,.45)]"
            >
              Become a Member
            </a>
          </div>
          <div
            className="rounded-[2.5rem] p-10"
            style={{
              background: 'linear-gradient(135deg, rgba(93,0,245,.35), rgba(0,212,212,.14))',
              border: '1px solid rgba(255,255,255,.15)',
            }}
          >
            <h3 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">A community for the builders of hydrogen flight.</h3>
            <p className="text-white/55 text-lg leading-relaxed">
              Hydrogen aviation is not one company, one aircraft, or one breakthrough. It is an ecosystem. HYSKY exists to connect the people and organizations solving the hardest problems in clean flight.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="px-6 sm:px-[7%] py-24">
        <h2 className="font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
          Who HYSKY Is{' '}
          <span style={{ color: '#00D4D4' }}>For</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl mb-10 leading-relaxed">
          If you are building, funding, regulating, researching, fueling, certifying, operating, or simply curious about hydrogen aviation — this is your place.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {audience.map((a) => (
            <div
              key={a}
              className="px-5 py-4 rounded-2xl font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}
            >
              {a}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="px-6 sm:px-[7%] py-32 text-center"
        style={{
          background: `radial-gradient(circle at center, rgba(93,0,245,.55), transparent 50%), #030306`,
        }}
      >
        <h2 className="font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(2.8rem, 8vw, 8rem)' }}>
          The Future of Flight<br />
          <span style={{ color: '#00D4D4' }}>Needs a Place to Gather.</span>
        </h2>
        <p className="text-white/50 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          HYSKY Society is building that place — through community, education, advocacy, awareness, and the world&apos;s leading hydrogen aviation programs.
        </p>
        <a
          href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#00D4D4] hover:opacity-90 text-black px-10 py-5 rounded-full font-black uppercase tracking-wide text-base transition-all hover:scale-[1.03] shadow-[0_0_40px_rgba(0,212,212,.5)]"
        >
          Join the Movement
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 sm:px-[7%] py-10 border-t border-white/8 flex flex-wrap justify-between gap-4 text-white/30 text-sm">
        <span>© {new Date().getFullYear()} HYSKY Society · A 501(c)(3) nonprofit organization</span>
        <span>Clean skies for future generations through hydrogen-powered flight.</span>
      </footer>

    </main>
  )
}
