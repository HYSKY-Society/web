'use client'

import { useEffect, useMemo, useState } from 'react'
import type { OnlineUser } from '@/app/components/ChatProvider'
import { ZeffyModal } from '@/components/ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

export default function FreeMemberSearch() {
  const [members, setMembers] = useState<OnlineUser[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  useEffect(() => {
    fetch('/api/presence?all=true')
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return members.filter((member) => !normalized
      || member.displayName?.toLowerCase().includes(normalized)
      || member.headline?.toLowerCase().includes(normalized))
  }, [members, query])

  return (
    <section aria-labelledby="free-member-search-heading">
      <h2 id="free-member-search-heading" className="mb-4 text-lg font-bold">Members</h2>
      <label className="relative mb-4 block">
        <span className="sr-only">Search members by name</span>
        <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search members…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#5d00f5]/55"
        />
      </label>

      <div className="max-h-[620px] overflow-y-auto rounded-2xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}>
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-white/35">Loading members…</p>
        ) : filteredMembers.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-white/35">Try another name.</p>
        ) : (
          <div className="grid gap-2">
            {filteredMembers.map((member) => {
              const name = member.displayName ?? 'Member'
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  aria-label={`Message ${name} — VIP upgrade required`}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/8 px-3 py-3 text-left transition-colors hover:border-[#5d00f5]/35 hover:bg-white/5"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#5d00f5]/20 bg-cover bg-center text-xs font-bold text-[#9b6dff]"
                    style={member.avatarUrl ? { backgroundImage: `url("${member.avatarUrl}")` } : undefined}
                  >
                    {member.avatarUrl ? null : initials(name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-semibold leading-snug">{name}</span>
                    <span className="block break-words text-xs leading-relaxed text-white/40">{member.headline ?? 'HySky member'}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <ZeffyModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Upgrade to message members"
        options={[{ label: 'VIP Membership', icon: '👥', embedUrl: ZEFFY.membership }]}
      />
    </section>
  )
}
