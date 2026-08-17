'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'

export default function AppTopBar({ onMenuClick, isLoggedIn = true, myId, canOpenDirectMessages = false }: { onMenuClick: () => void; isLoggedIn?: boolean; myId?: string; canOpenDirectMessages?: boolean }) {
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
