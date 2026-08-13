'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, UserButton } from '@clerk/nextjs'
import type { NewsTier } from '@/lib/news'

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
}: {
  isLoggedIn: boolean
  tier?: NewsTier
  isVipMember: boolean
}) {
  const visibleTier: NewsTier | undefined = isVipMember ? 'complimentary' : tier
  const hasStandaloneNewsPlan = !isVipMember && (tier === 'monthly' || tier === 'annual')

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
          <UserButton />
        </div>
      )}
    </header>
  )
}
