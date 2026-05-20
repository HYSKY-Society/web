'use client'

import { useState } from 'react'
import { useChatCtx } from './ChatProvider'
import DMWindow from './DMWindow'
import type { OnlineUser } from './ChatProvider'

function Avatar({ name, url, size = 36 }: { name: string; url: string | null; size?: number }) {
  const initials = (name || 'M').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      style={{ width: size, height: size, background: url ? undefined : '#5d00f520', border: '1px solid #5d00f550', fontSize: size * 0.35 }}
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 font-bold text-white select-none"
    >
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}

function OnlineRow({ user, onOpen }: { user: OnlineUser; onOpen: (u: OnlineUser) => void }) {
  return (
    <button
      onClick={() => onOpen(user)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/6 transition-colors text-left"
    >
      <div className="relative shrink-0">
        <Avatar name={user.displayName ?? 'M'} url={user.avatarUrl} size={36} />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0d0a1f]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{user.displayName ?? 'Member'}</p>
        {user.headline && <p className="text-[11px] text-white/35 truncate">{user.headline}</p>}
      </div>
    </button>
  )
}

export default function ChatBar() {
  const { online, windows, toasts, totalUnread, openDM, dismissToast } = useChatCtx()
  const [panelOpen, setPanelOpen] = useState(false)

  const hasOthersOnline = online.length >= 1

  const handleOpen = (user: OnlineUser) => {
    openDM(user.id, user.displayName ?? 'Member', user.avatarUrl ?? null)
    setPanelOpen(false)
  }

  return (
    <>
      {/* ── Notification toasts (top-right) ─────────────────────────────── */}
      <div className="fixed top-16 right-4 z-[110] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl cursor-pointer max-w-xs"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)' }}
            onClick={() => { openDM(toast.fromId, toast.fromName, toast.fromAvatar); dismissToast(toast.id) }}
          >
            <Avatar name={toast.fromName} url={toast.fromAvatar} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">{toast.fromName}</p>
              <p className="text-[11px] text-white/45 truncate">{toast.preview}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); dismissToast(toast.id) }}
              className="text-white/25 hover:text-white/60 text-xs ml-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ── Bottom chat bar ──────────────────────────────────────────────── */}
      <div className="fixed bottom-0 right-4 z-50 flex items-end gap-2">

        {/* Open windows (left of button) */}
        {windows.map(w => (
          <DMWindow key={w.id} userId={w.id} name={w.name} avatar={w.avatar} />
        ))}

        {/* Online panel */}
        {panelOpen && (
          <div
            className="w-72 rounded-t-xl flex flex-col overflow-hidden"
            style={{ height: 400, background: 'var(--bg-panel)', border: '1px solid var(--border-dim)', borderBottom: 'none' }}
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="text-sm font-bold text-white">Messaging</span>
              <button onClick={() => setPanelOpen(false)} className="text-white/25 hover:text-white/70 text-xs">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {online.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <span className="text-4xl mb-3">💤</span>
                  <p className="text-xs text-white/30">No other members online right now</p>
                  <p className="text-[10px] text-white/15 mt-1">Members appear when active in the last 5 min</p>
                </div>
              ) : (
                <div className="px-2 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 px-2 mb-1">
                    Online now · {online.length}
                  </p>
                  {online.map(u => <OnlineRow key={u.id} user={u} onOpen={handleOpen} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat button */}
        <button
          onClick={() => setPanelOpen(p => !p)}
          title="Messaging"
          className="w-12 h-12 mb-4 rounded-full flex items-center justify-center text-white text-xl relative shadow-2xl transition-transform hover:scale-105 active:scale-95"
          style={{ background: '#5d00f5', boxShadow: '0 8px 32px #5d00f540' }}
        >
          💬
          {/* Online status indicator */}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            hasOthersOnline ? 'bg-green-500' : 'bg-white/25'
          }`} />
          {/* Unread badge */}
          {totalUnread > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center"
              style={{ color: '#fff' }}
            >
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      </div>
    </>
  )
}
