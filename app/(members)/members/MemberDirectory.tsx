'use client'

import { useState } from 'react'
import Link from 'next/link'
import { hasVipCommunityAccess, type Tier, type MemberListItem, TIER_LABELS } from '@/lib/tiers'
import MemberAvatar from '@/app/components/MemberAvatar'

function TierChip({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    free:                  'bg-white/8 text-white/40',
    instructor:            'bg-amber-500/15 text-amber-300',
    member_courses:        'bg-[#5d00f5]/20 text-[#9b6dff]',
    member_courses_events: 'bg-[#5d00f5]/25 text-[#b38fff]',
    member_full:           'vip-tier-badge bg-[#13dce8]/15 text-[#13dce8]',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[tier] ?? 'bg-white/8 text-white/40'}`}>
      {TIER_LABELS[tier as Tier] ?? tier}
    </span>
  )
}

export default function MemberDirectory({
  members,
  canAccessProfiles,
  showActivationStatus,
}: {
  members: MemberListItem[]
  canAccessProfiles: boolean
  showActivationStatus: boolean
}) {
  const [query, setQuery] = useState('')
  const [memberFilter, setMemberFilter] = useState<'all' | 'free' | 'vip'>('all')

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = members.filter((member) => {
    const matchesMembership = memberFilter === 'all'
      || (memberFilter === 'free' && !hasVipCommunityAccess(member.tier))
      || (memberFilter === 'vip' && hasVipCommunityAccess(member.tier))
    if (!matchesMembership) return false
    if (!normalizedQuery) return true
    return (
      member.displayName?.toLowerCase().includes(normalizedQuery) ||
      member.company?.toLowerCase().includes(normalizedQuery) ||
      member.jobTitle?.toLowerCase().includes(normalizedQuery) ||
      member.location?.toLowerCase().includes(normalizedQuery) ||
      member.headline?.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <div>
      {/* Search and membership filters */}
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, company, role, location…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5d00f5]/50 transition-colors"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-lg leading-none">×</button>
        )}
      </div>
        <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/5 p-1" role="group" aria-label="Filter members by membership">
          {(['all', 'free', 'vip'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMemberFilter(option)}
              aria-pressed={memberFilter === option}
              className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-colors ${memberFilter === option ? 'bg-[#5d00f5] text-white' : 'text-white/45 hover:bg-white/5 hover:text-white'}`}
            >
              {option === 'vip' ? 'VIP' : option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {!canAccessProfiles && (
        <div className="mb-6 flex items-center gap-3 bg-[#5d00f5]/8 border border-[#5d00f5]/20 rounded-xl px-4 py-3 text-sm text-white/60">
          <span className="text-[#9b6dff]">🔒</span>
          Full profiles and direct messages are available with VIP Connect.{' '}
          <a href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership" target="_blank" rel="noopener noreferrer" className="text-[#9b6dff] hover:underline ml-1">Explore VIP →</a>
        </div>
      )}

      <p className="text-white/30 text-xs mb-5">{filtered.length} member{filtered.length !== 1 ? 's' : ''}{query || memberFilter !== 'all' ? ' matching' : ''}</p>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => {
          const name = m.displayName || 'HySky Member'
          const card = (
            <div className="group bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 transition-all hover:border-[#5d00f5]/40 hover:bg-white/8 cursor-pointer">
              <div className="flex items-start gap-3">
                <MemberAvatar name={name} url={m.avatarUrl} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-white truncate">{name}</div>
                  {m.headline && <div className="text-white/50 text-xs mt-0.5 line-clamp-2">{m.headline}</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs text-white/40">
                {m.company && (
                  <span className="flex items-center gap-1">
                    <span>🏢</span>{m.company}
                  </span>
                )}
                {m.jobTitle && !m.company && (
                  <span className="flex items-center gap-1">
                    <span>💼</span>{m.jobTitle}
                  </span>
                )}
                {m.location && (
                  <span className="flex items-center gap-1 ml-auto">
                    <span>📍</span>{m.location}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto pt-1 border-t border-white/6">
                <TierChip tier={m.tier} />
                {showActivationStatus && m.isPending ? (
                  <span className="text-amber-500/80 text-xs">Not signed in yet</span>
                ) : (
                  <span className="text-[#9b6dff] text-xs group-hover:underline">View profile →</span>
                )}
              </div>
            </div>
          )

          return <Link key={m.id} href={`/members/${m.id}`}>{card}</Link>
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30 text-sm">No members match your search.</div>
      )}
    </div>
  )
}
