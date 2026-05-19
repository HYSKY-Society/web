'use client'

import { useEffect } from 'react'
import { useChatCtx } from '@/app/components/ChatProvider'

function hashCode(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}

function Avatar({ name, url, userId, size = 64 }: { name: string; url: string | null; userId: string; size?: number }) {
  const initials = (name || 'M').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 font-bold text-white select-none"
      style={{ width: size, height: size, background: url ? undefined : `hsl(${hashCode(userId) % 360},55%,35%)`, fontSize: size * 0.32 }}
    >
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}

export default function NetworkClient() {
  const { online, openDM } = useChatCtx()

  // Ping presence every 30s to keep lastSeenAt fresh in DB
  useEffect(() => {
    fetch('/api/presence', { method: 'POST' }).catch(() => {})
    const interval = setInterval(() => {
      fetch('/api/presence', { method: 'POST' }).catch(() => {})
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-white/50">
          {online.length === 0
            ? 'No other members online right now'
            : `${online.length} member${online.length === 1 ? '' : 's'} online now`}
        </span>
      </div>

      {online.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌐</div>
          <p className="text-white/25 text-sm">Be the first! When others are online, their bubbles appear here.</p>
          <p className="text-white/15 text-xs mt-2">Members appear when active in the past 5 minutes.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {online.map(user => (
            <button
              key={user.id}
              onClick={() => openDM(user.id, user.displayName ?? 'Member', user.avatarUrl ?? null)}
              className="flex flex-col items-center gap-2.5 group"
            >
              <div className="relative">
                <Avatar name={user.displayName ?? 'M'} url={user.avatarUrl} userId={user.id} size={64} />
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#060510]" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors max-w-[80px] truncate">
                  {user.displayName ?? 'Member'}
                </p>
                {user.headline && (
                  <p className="text-[10px] text-white/30 max-w-[90px] truncate">{user.headline}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
