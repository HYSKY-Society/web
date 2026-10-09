'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SidebarIcon, { type SidebarIconName } from './SidebarIcon'

const NAV: Array<{ href: string; label: string; icon: SidebarIconName; newTab?: boolean; sub?: Array<{ href: string; label: string }> }> = [
  { href: '/about',        label: 'About Us',      icon: 'home' },
  { href: '/courses',      label: 'Courses',       icon: 'courses' },
  { href: '/events',       label: 'Events',        icon: 'events' },
  { href: '/hysky-monthly', label: 'HySky Monthly', icon: 'video' },
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
                prefetch={false}
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
        <Link
          href="/feed"
          prefetch={false}
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-[#9b6dff] hover:text-white hover:bg-white/6 transition-colors"
        >
          <SidebarIcon name="feed" />
          <span className="truncate">Start Connecting</span>
        </Link>
      </nav>

      <div className="shrink-0 border-t border-white/8 px-4 py-4">
        {isLoggedIn ? (
          <Link
            href="/feed"
            prefetch={false}
            className="flex items-center justify-center gap-2 w-full text-sm font-bold py-2.5 px-4 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] transition-colors"
              style={{ color: '#fff' }}
          >
            Start Connecting →
          </Link>
        ) : (
          <div className="space-y-2">
            <Link href="/sign-in" prefetch={false} className="block w-full text-center text-sm font-semibold py-2 px-4 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors">
              Log In
            </Link>
            <Link href="/sign-up" prefetch={false} className="block w-full text-center text-sm font-bold py-2 px-4 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] transition-colors" style={{ color: '#fff' }}>
              Join Free
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

