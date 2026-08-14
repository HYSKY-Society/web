'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, UserButton } from '@clerk/nextjs'
import type { NewsTier } from '@/lib/news'
import type { ProfileContact, UserProfile } from '@/lib/schema'
import ProfileForm from '@/app/(members)/profile/ProfileForm'

function ProfileIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6" />
    </svg>
  )
}

const TIER_LABELS: Record<string, string> = {
  free:          'Free',
  complimentary: 'VIP',
  monthly:       'Monthly',
  annual:        'Annual',
}

const TIER_COLORS: Record<string, string> = {
  free:          '#888',
  complimentary: '#5D00F5',
  monthly:       '#5D00F5',
  annual:        '#5D00F5',
}

export default function NewsTopBar({
  isLoggedIn,
  tier,
  isVipMember,
  profile,
  contacts,
  clerkName,
  clerkEmail,
  canManageVisibility,
}: {
  isLoggedIn: boolean
  tier?: NewsTier
  isVipMember: boolean
  profile: UserProfile | null
  contacts: ProfileContact | null
  clerkName: string
  clerkEmail: string
  canManageVisibility: boolean
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const visibleTier: NewsTier | undefined = isVipMember ? 'complimentary' : tier
  const hasStandaloneNewsPlan = !isVipMember && (tier === 'monthly' || tier === 'annual')

  useEffect(() => {
    if (!profileOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileOpen])

  return (
    <>
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      height: 60,
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: 12,
    }}>
      {/* Logo → hysky.org in new tab; "News" → news listing same tab */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginRight: 'auto' }}>
        <a href="https://hysky.org" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src="/logo-purple.png" alt="HySky Society" height={22} width={70} style={{ objectFit: 'contain' }} />
        </a>
        <Link href="/news" style={{
          fontSize: '0.8rem', fontWeight: 700, color: '#111',
          borderLeft: '1px solid #ddd', paddingLeft: 10, marginLeft: 8,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          News
        </Link>
      </div>

      {/* Plan pill beside the profile photo */}
      {isLoggedIn && visibleTier && (
        hasStandaloneNewsPlan ? (
          <Link href="/news/subscribe" style={{
            fontSize: '0.7rem', fontWeight: 700,
            color: '#5D00F5',
            border: '1px solid rgba(93,0,245,0.35)',
            borderRadius: 100, padding: '4px 11px',
            background: 'rgba(93,0,245,0.05)',
            textDecoration: 'none',
          }}>
            Become a VIP member and save
          </Link>
        ) : (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: TIER_COLORS[visibleTier],
            border: `1px solid ${TIER_COLORS[visibleTier]}44`,
            borderRadius: 100, padding: '3px 10px',
            background: `${TIER_COLORS[visibleTier]}0d`,
          }}>
            {TIER_LABELS[visibleTier]}
          </span>
        )
      )}

      {!isLoggedIn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SignInButton mode="modal">
            <button style={{
              fontSize: '0.875rem', fontWeight: 500, color: '#444',
              padding: '6px 14px', border: '1px solid #e0e0e0',
              borderRadius: 8, background: 'none', cursor: 'pointer',
            }}>
              Log In
            </button>
          </SignInButton>
          <Link href="/news/subscribe" style={{
            fontSize: '0.875rem', fontWeight: 700, color: '#fff',
            background: '#5D00F5', border: 'none',
            borderRadius: 8, padding: '7px 18px',
            textDecoration: 'none',
          }}>
            Subscribe
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isVipMember && tier === 'free' ? (
            <Link href="/news/subscribe" style={{
              fontSize: '0.8rem', fontWeight: 700, color: '#5D00F5',
              textDecoration: 'none', padding: '6px 14px',
              border: '1px solid rgba(93,0,245,0.35)',
              borderRadius: 8,
            }}>
              Upgrade
            </Link>
          ) : null}
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Profile"
                labelIcon={<ProfileIcon />}
                onClick={() => setProfileOpen(true)}
              />
              <UserButton.Action label="manageAccount" />
              <UserButton.Action label="signOut" />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      )}
    </header>

    {profileOpen && isLoggedIn ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-profile-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setProfileOpen(false)
        }}
        className="news-profile-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-3 py-6 sm:px-6 sm:py-10"
      >
        <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5 text-white shadow-2xl sm:p-8">
          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            aria-label="Close profile editor"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
          <div className="mb-7 pr-12">
            <h2 id="news-profile-title" className="text-2xl font-bold">My Profile</h2>
            <p className="mt-1 text-sm text-white/40">Update how you appear across HySky.</p>
          </div>
          <ProfileForm
            profile={profile}
            contacts={contacts}
            clerkName={clerkName}
            clerkEmail={clerkEmail}
            canEditLinks={isVipMember}
            canManageVisibility={canManageVisibility}
            directoryHref="https://connect.hysky.org/members"
          />
        </div>
      </div>
    ) : null}
    </>
  )
}
