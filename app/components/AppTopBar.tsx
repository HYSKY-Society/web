'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/feed',              label: 'Feed' },
  { href: '/about',             label: 'About Us' },
  { href: '/courses',           label: 'Courses' },
  { href: '/dashboard/events',  label: 'Events' },
  { href: '/hysky-monthly',     label: 'HYSKY Monthly' },
  { href: '/podcast',           label: 'Podcast' },
]

export default function AppTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-4 sm:px-6 border-b border-white/8"
      style={{ background: 'rgba(4,8,15,.92)', backdropFilter: 'blur(12px)' }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-3 flex flex-col gap-1.5 p-1 text-white/60 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        <span className="block w-5 h-0.5 bg-current rounded" />
        <span className="block w-5 h-0.5 bg-current rounded" />
        <span className="block w-5 h-0.5 bg-current rounded" />
      </button>

      {/* Logo */}
      <Link href="/feed" className="shrink-0 mr-6">
        <Image src="/logo-white.png" alt="HYSKY Society" height={32} width={100} className="object-contain" />
      </Link>

      {/* Nav links — desktop */}
      <nav className="hidden md:flex gap-0.5 flex-1">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || (href !== '/feed' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white hover:bg-white/6'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
