'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

type DropdownItem = { href: string; label: string }
type NavItem = { href: string; label: string; authOnly?: boolean; dropdown?: DropdownItem[] }

const ALL_NAV: NavItem[] = [
  { href: '/feed',         label: 'Feed',          authOnly: true },
  { href: '/about',        label: 'About Us' },
  { href: '/courses',      label: 'Courses' },
  { href: '/events',       label: 'Events' },
  { href: '/flying-hy',    label: 'FLYING HY', dropdown: [
    { href: '/flying-hy#about',    label: 'About' },
    { href: '/flying-hy#speakers', label: 'Speakers' },
    { href: '/flying-hy#agenda',   label: 'Agenda' },
    { href: '/flying-hy#sponsors', label: 'Sponsors' },
    { href: '/flying-hy#faq',      label: 'FAQ' },
  ]},
  { href: '/hysky-monthly', label: 'HYSKY Monthly' },
  { href: '/podcast',       label: 'Podcast' },
  { href: '/news',          label: 'News' },
]

export default function AppTopBar({ onMenuClick, isLoggedIn = true }: { onMenuClick: () => void; isLoggedIn?: boolean }) {
  const pathname = usePathname()
  const NAV = ALL_NAV.filter(n => !n.authOnly || isLoggedIn)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-4 sm:px-6 border-b border-white/8"
      style={{ background: 'rgba(4,8,15,.92)', backdropFilter: 'blur(12px)' }}
    >
      {/* Hamburger */}
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
      <Link href={isLoggedIn ? '/feed' : '/about'} className="shrink-0 mr-4">
        <Image src="/logo-white.png" alt="HYSKY Society" height={28} width={90} className="object-contain" />
      </Link>

      {/* Nav links — desktop */}
      <nav className="hidden md:flex gap-0 flex-1 min-w-0">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href.length > 1 && pathname.startsWith(item.href + '/'))
          if (item.dropdown) {
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.href)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    active ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white hover:bg-white/6'
                  }`}
                >
                  {item.label}
                  <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                {openDropdown === item.href && (
                  <div
                    className="absolute top-full left-0 mt-1 w-44 rounded-xl py-1 shadow-xl z-50"
                    style={{ background: '#0a0818', border: '1px solid rgba(255,255,255,.1)' }}
                    onMouseEnter={() => setOpenDropdown(item.href)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {item.dropdown.map(di => (
                      <a
                        key={di.href}
                        href={di.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/6 transition-colors"
                      >
                        {di.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                active ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white hover:bg-white/6'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Auth buttons — public pages only */}
      {!isLoggedIn && (
        <div className="flex items-center gap-2 ml-auto">
          <SignInButton mode="modal">
            <button className="text-sm font-medium px-3 py-1.5 rounded-lg text-white/55 hover:text-white hover:bg-white/6 transition-colors">
              Log In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="hidden sm:block text-sm font-bold px-4 py-1.5 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] text-white transition-colors">
              Join Free
            </button>
          </SignUpButton>
        </div>
      )}
    </header>
  )
}
