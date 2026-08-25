'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import SidebarIcon, { type SidebarIconName } from './SidebarIcon'

const NAV: Array<{ href: string; label: string; icon: SidebarIconName; newTab?: boolean; sub?: Array<{ href: string; label: string }> }> = [
  { href: '/about',        label: 'About Us',      icon: 'home' },
  { href: '/courses',      label: 'Courses',       icon: 'courses' },
  { href: '/events',       label: 'Events',        icon: 'events' },
  { href: '/flying-hy',    label: 'FLYING HY',     icon: 'plane', sub: [
    { href: '/flying-hy#speakers', label: 'Speakers' },
    { href: '/flying-hy#agenda',   label: 'Agenda' },
    { href: '/flying-hy#sponsors', label: 'Sponsors' },
    { href: '/flying-hy#faq',      label: 'FAQ' },
  ]},
  { href: '/hysky-monthly', label: 'HySky Monthly', icon: 'video' },
  { href: '/podcast',       label: 'Podcast',       icon: 'podcast' },
  { href: 'https://news.hysky.org', label: 'News', icon: 'news', newTab: false },
]

export default function PublicSidebar({
  open, onClose, isLoggedIn,
}: { open: boolean; onClose: () => void; isLoggedIn: boolean }) {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed top-[60px] left-0 bottom-0 w-[260px] z-40 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-muted)' }}
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
                <SidebarIcon name={icon} />
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
            <SidebarIcon name="feed" />
            <span className="truncate">Go to Feed</span>
          </Link>
        )}
      </nav>

      <div className="shrink-0 border-t border-white/8 px-4 py-4">
        {isLoggedIn ? (
          <Link
            href="/feed"
            className="flex items-center justify-center gap-2 w-full text-sm font-bold py-2.5 px-4 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] transition-colors"
              style={{ color: '#fff' }}
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
              <button className="w-full text-sm font-bold py-2 px-4 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] transition-colors" style={{ color: '#fff' }}>
                Join Free
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </aside>
  )
}

