'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

const NAV = [
  { href: '/about',        label: 'About Us',      icon: '🏠' },
  { href: '/courses',      label: 'Courses',       icon: '📚' },
  { href: '/events',       label: 'Events',        icon: '📅' },
  { href: '/flying-hy',    label: 'FLYING HY',     icon: '✈️', sub: [
    { href: '/flying-hy#about',    label: 'About' },
    { href: '/flying-hy#speakers', label: 'Speakers' },
    { href: '/flying-hy#agenda',   label: 'Agenda' },
    { href: '/flying-hy#sponsors', label: 'Sponsors' },
    { href: '/flying-hy#faq',      label: 'FAQ' },
  ]},
  { href: '/hysky-monthly', label: 'HYSKY Monthly', icon: '🎬' },
  { href: '/podcast',       label: 'Podcast',       icon: '🎙' },
  { href: 'https://hysky.news', label: 'News', icon: '📰', newTab: true },
]

export default function PublicSidebar({
  open, onClose, isLoggedIn,
}: { open: boolean; onClose: () => void; isLoggedIn: boolean }) {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed top-[60px] left-0 bottom-0 w-[260px] z-40 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ background: '#060510', borderRight: '1px solid rgba(255,255,255,.07)' }}
    >
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-1">
        {NAV.map(({ href, label, icon, sub, newTab }) => {
          const active = pathname === href || (href.length > 1 && pathname.startsWith(href + '/'))
          return (
            <div key={href}>
              <Link
                href={href}
                onClick={onClose}
                {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-[#5d00f5]/20 text-white' : 'text-white/55 hover:text-white hover:bg-white/6'
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="truncate">{label}</span>
              </Link>
              {sub && active && sub.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={onClose}
                  className="flex items-center gap-2.5 pl-10 pr-3 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )
        })}
        {isLoggedIn && (
          <Link
            href="/feed"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-[#9b6dff] hover:text-white hover:bg-white/6 transition-colors"
          >
            <span className="text-base leading-none">⚡</span>
            <span className="truncate">Go to Feed</span>
          </Link>
        )}
      </nav>

      <div className="shrink-0 border-t border-white/8 px-4 py-4">
        {isLoggedIn ? (
          <Link
            href="/feed"
            className="flex items-center justify-center gap-2 w-full text-sm font-bold py-2.5 px-4 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] text-white transition-colors"
          >
            Go to Feed →
          </Link>
        ) : (
          <div className="space-y-2">
            <SignInButton mode="modal">
              <button className="w-full text-sm font-semibold py-2 px-4 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors">
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full text-sm font-bold py-2 px-4 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] text-white transition-colors">
                Join Free
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </aside>
  )
}
