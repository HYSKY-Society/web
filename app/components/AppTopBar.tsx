'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import ThemeToggle from './ThemeToggle'

type NavItem = { href: string; label: string; authOnly?: boolean; newTab?: boolean }

const ALL_NAV: NavItem[] = [
  { href: '/feed',          label: 'Feed',          authOnly: true },
  { href: '/members',       label: 'Members',       authOnly: true },
  { href: '/courses',       label: 'Courses' },
  { href: '/events',        label: 'Events' },
  { href: 'https://news.hysky.org', label: 'News' },
]

export default function AppTopBar({ onMenuClick, isLoggedIn = true }: { onMenuClick: () => void; isLoggedIn?: boolean }) {
  const pathname = usePathname()
  const NAV = ALL_NAV.filter(n => !n.authOnly || isLoggedIn)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-4 sm:px-6 border-b border-white/8"
      style={{ background: 'var(--bg-topbar)', backdropFilter: 'blur(12px)' }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="mr-3 flex flex-col gap-1.5 p-1 text-white/60 hover:text-white transition-colors"
        aria-label="Toggle sidebar"
      >
        <span className="block w-5 h-0.5 bg-current rounded" />
        <span className="block w-5 h-0.5 bg-current rounded" />
        <span className="block w-5 h-0.5 bg-current rounded" />
      </button>

      {/* Logo */}
      <Link href={isLoggedIn ? '/feed' : '/about'} className="shrink-0 mr-4">
        <Image
          src="/logo-white.png"
          alt="HYSKY Society"
          height={28}
          width={90}
          className="object-contain logo-topbar"
        />
      </Link>

      {/* Nav links — desktop */}
      <nav className="hidden md:flex gap-0 flex-1 min-w-0">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href.length > 1 && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.newTab ? '_blank' : undefined}
              rel={item.newTab ? 'noopener noreferrer' : undefined}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                active ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white hover:bg-white/6'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Right side: theme toggle + optional auth buttons */}
      <div className="flex items-center gap-1 ml-auto">
        <ThemeToggle />
        {!isLoggedIn && (
          <>
            <SignInButton mode="modal">
              <button className="text-sm font-medium px-3 py-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/6 transition-colors">
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="hidden sm:block text-sm font-bold px-4 py-1.5 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] transition-colors" style={{ color: '#fff' }}>
                Join Free
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </header>
  )
}
