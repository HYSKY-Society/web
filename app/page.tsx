import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-[#04080F] text-white">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 sm:px-10 py-5 border-b border-white/10">
        <div className="flex items-center">
          <Image src="/logo-white.png" alt="HYSKY Society" height={36} width={130} className="object-contain" />
        </div>
        <Link
          href="/sign-in"
          className="bg-[#5d00f5] hover:bg-[#4a00c4] text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          Member Login
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#00D4D4]/10 border border-[#00D4D4]/25 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00D4D4] animate-pulse" />
          <span className="text-[#00D4D4] text-sm font-medium">Hydrogen Aviation Nonprofit</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
          Advancing the Future<br className="hidden sm:block" /> of{' '}
          <span className="text-[#5d00f5]">Hydrogen Aviation</span>
        </h1>

        <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          HYSKY Society connects industry leaders, researchers, and advocates
          working to make hydrogen-powered flight a commercial reality.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-in"
            className="bg-[#5d00f5] hover:bg-[#4a00c4] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] shadow-xl shadow-[#5d00f5]/20"
          >
            Access Member Portal
          </Link>
          <a
            href="https://hysky.org"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/8 hover:bg-white/12 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-white/15"
          >
            Learn More →
          </a>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-12 grid sm:grid-cols-3 gap-5">
        {[
          {
            icon: '✈️',
            title: 'Industry Network',
            desc: 'Connect with leaders across airlines, OEMs, and energy companies pushing hydrogen aviation forward.',
          },
          {
            icon: '📋',
            title: 'Exclusive Research',
            desc: 'Access proprietary market reports, technical analyses, and working group outputs unavailable elsewhere.',
          },
          {
            icon: '🌍',
            title: 'Policy Impact',
            desc: 'Shape hydrogen aviation policy at national and international levels through working groups and advocacy.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white/4 border border-white/10 rounded-2xl p-6 hover:bg-white/7 transition-colors"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-semibold text-base mb-2">{f.title}</h3>
            <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-8 text-center text-white/25 text-sm">
        © {new Date().getFullYear()} HYSKY Society · A 501(c)(3) nonprofit organization
      </footer>
    </main>
  )
}
