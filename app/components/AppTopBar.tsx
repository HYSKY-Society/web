'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'

function SidebarArrow({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d={expanded ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}

export default function AppTopBar({
  onMenuClick,
  isLoggedIn = true,
  myId,
  canOpenDirectMessages = false,
  sidebarOpen = false,
  sidebarCollapsed,
}: {
  onMenuClick: () => void
  isLoggedIn?: boolean
  myId?: string
  canOpenDirectMessages?: boolean
  sidebarOpen?: boolean
  sidebarCollapsed?: boolean
}) {
  const desktopSidebarExpanded = sidebarCollapsed === undefined ? sidebarOpen : !sidebarCollapsed

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-4 sm:px-6 border-b border-white/8"
      style={{ background: 'var(--bg-topbar)', backdropFilter: 'blur(12px)' }}
    >
      {/* Sidebar expand/collapse control */}
      <button
        onClick={onMenuClick}
        className="mr-3 flex h-10 w-10 items-center justify-center rounded-full text-white/65 transition-colors hover:bg-black/5 hover:text-white dark:hover:bg-white/10"
        aria-label={sidebarOpen || desktopSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={sidebarOpen || desktopSidebarExpanded}
      >
        <span className="lg:hidden"><SidebarArrow expanded={sidebarOpen} /></span>
        <span className="hidden lg:block"><SidebarArrow expanded={desktopSidebarExpanded} /></span>
      </button>

      {/* Full HySky Connect wordmark with a wider responsive logo slot. */}
      <Link
        href={isLoggedIn ? '/feed' : '/about'}
        className="relative mr-3 block h-[48px] w-[170px] shrink-0 sm:mr-5 sm:w-[230px]"
        aria-label="HySky Connect home"
      >
        <Image
          src="/hysky-connect-dark.png"
          alt="HySky Connect"
          fill
          priority
          sizes="(min-width: 640px) 230px, 170px"
          className="theme-logo-dark object-contain object-left"
        />
        <Image
          src="/hysky-connect-light.png"
          alt="HySky Connect"
          fill
          priority
          sizes="(min-width: 640px) 230px, 170px"
          className="theme-logo-light object-contain object-left"
        />
      </Link>

      {/* Right side: theme toggle + optional auth buttons */}
      <div className="flex items-center gap-1 ml-auto">
        {myId && <NotificationBell myId={myId} canOpenDirectMessages={canOpenDirectMessages} />}
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

