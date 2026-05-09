'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type Tier, type MemberListItem, TIER_LABELS, isPaidTier } from '@/lib/tiers'

function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function Avatar({ name, url, size = 48 }: { name: string | null; url: string | null; size?: number }) {
  if (url) {
    return <img src={url} alt={name ?? ''} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />
  }
  const colors = ['bg-[#5d00f5]', 'bg-[#13dce8]/70', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500']
  const idx = (name ?? '?').charCodeAt(0) % colors.length
  return (
    <div className={`${colors[idx]} rounded-full flex items-center justify-center font-bold text-white shrink-0`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name)}
    </div>
  )
}

function TierChip({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    free:                  'bg-white/8 text-white/40',
    instructor:            'bg-amber-500/15 text-amber-300',
    member_courses:        'bg-[#5d00f5]/20 text-[#9b6dff]',
    member_courses_events: 'bg-[#5d00f5]/25 text-[#b38fff]',
    member_full:           'bg-[#13dce8]/15 text-[#13dce8]',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[tier] ?? 'bg-white/8 text-white/40'}`}>
      {TIER_LABELS[tier as Tier] ?? tier}
    </span>
  )
}

export default function MemberDirectory({
  members,
  viewerTier,
}: {
  members: MemberListItem[]
  viewerTier: Tier
}) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? members.filter(m => {
        const q = query.toLowerCase()
        return (
          m.displayName?.toLowerCase().includes(q) ||
          m.company?.toLowerCase().includes(q) ||
          m.jobTitle?.toLowerCase().includes(q) ||
          m.location?.toLowerCase().includes(q) ||
          m.headline?.toLowerCase().includes(q)
        )
      })
    : members

  const canInteract = isPaidTier(viewerTier)

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
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

      {!canInteract && (
        <div className="mb-6 flex items-center gap-3 bg-[#5d00f5]/8 border border-[#5d00f5]/20 rounded-xl px-4 py-3 text-sm text-white/60">
          <span className="text-[#9b6dff]">🔒</span>
          Full profiles and contact details are available for paid members.{' '}
          <Link href="/sign-up" className="text-[#9b6dff] hover:underline ml-1">Upgrade →</Link>
        </div>
      )}

      <p className="text-white/30 text-xs mb-5">{filtered.length} member{filtered.length !== 1 ? 's' : ''}{query ? ' matching' : ''}</p>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => {
          const name = m.displayName || 'HYSKY Member'
          const card = (
            <div className={`group bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 transition-all ${canInteract && !m.isPending ? 'hover:border-[#5d00f5]/40 hover:bg-white/8 cursor-pointer' : 'opacity-80'}`}>
              <div className="flex items-start gap-3">
                <Avatar name={name} url={m.avatarUrl} size={48} />
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
                {m.isPending ? (
                  <span className="text-white/20 text-xs">Pending sign-in</span>
                ) : canInteract ? (
                  <span className="text-[#9b6dff] text-xs group-hover:underline">View profile →</span>
                ) : (
                  <span className="text-white/20 text-xs">🔒 Paid only</span>
                )}
              </div>
            </div>
          )

          return canInteract && !m.isPending ? (
            <Link key={m.id} href={`/members/${m.id}`}>{card}</Link>
          ) : (
            <div key={m.id}>{card}</div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30 text-sm">No members match your search.</div>
      )}
    </div>
  )
}
