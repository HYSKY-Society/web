'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import type { NewsTier } from '@/lib/news'

const TIER_LABELS: Record<string, string> = {
  free:          'Free',
  complimentary: 'Complimentary',
  monthly:       'Monthly',
  annual:        'Annual',
}

const TIER_COLORS: Record<string, string> = {
  free:          '#888',
  complimentary: '#2e7d32',
  monthly:       '#5D00F5',
  annual:        '#5D00F5',
}

export default function NewsTopBar({
  isLoggedIn,
  tier,
}: {
  isLoggedIn: boolean
  tier?: NewsTier
}) {
  const isPaid = tier === 'monthly' || tier === 'annual'

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      height: 60,
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: 12,
    }}>
      {/* Logo + wordmark */}
      <Link href="/news" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 'auto' }}>
        <Image src="/logo-purple.png" alt="HYSKY" height={22} width={70} style={{ objectFit: 'contain' }} />
        <span style={{
          fontSize: '0.8rem', fontWeight: 700, color: '#111',
          borderLeft: '1px solid #ddd', paddingLeft: 10,
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          News
        </span>
      </Link>

      {/* Tier badge (logged-in only) */}
      {isLoggedIn && tier && (
        <span style={{
          fontSize: '0.7rem', fontWeight: 600,
          color: TIER_COLORS[tier],
          border: `1px solid ${TIER_COLORS[tier]}44`,
          borderRadius: 100, padding: '3px 10px',
          background: `${TIER_COLORS[tier]}0d`,
        }}>
          {TIER_LABELS[tier]}
        </span>
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
          <SignUpButton mode="modal">
            <button style={{
              fontSize: '0.875rem', fontWeight: 700, color: '#fff',
              background: '#5D00F5', border: 'none',
              borderRadius: 8, padding: '7px 18px', cursor: 'pointer',
            }}>
              Subscribe
            </button>
          </SignUpButton>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isPaid && (
            <Link href="/news/subscribe" style={{
              fontSize: '0.8rem', fontWeight: 700, color: '#5D00F5',
              textDecoration: 'none', padding: '6px 14px',
              border: '1px solid rgba(93,0,245,0.35)',
              borderRadius: 8,
            }}>
              Upgrade
            </Link>
          )}
          <UserButton />
        </div>
      )}
    </header>
  )
}
