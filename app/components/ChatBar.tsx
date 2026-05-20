'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatCtx } from './ChatProvider'
import DMWindow from './DMWindow'
import GMWindow from './GMWindow'
import type { OnlineUser } from './ChatProvider'

type GroupMember = { userId: string; displayName: string | null; avatarUrl: string | null }
type MyGroup = { id: string; name: string; createdBy: string; members: GroupMember[] }

// ── Tiny helpers ──────────────────────────────────────────────────────────────

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

// ── Online user row (DM tab) ───────────────────────────────────────────────────

function OnlineRow({
  user, onOpen, myGroups, groupMenuOpen, onToggleGroupMenu, onAddToGroup,
}: {
  user: OnlineUser
  onOpen: (u: OnlineUser) => void
  myGroups: MyGroup[]
  groupMenuOpen: boolean
  onToggleGroupMenu: () => void
  onAddToGroup: (groupId: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/6 transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false) }}
    >
      <button
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={() => onOpen(user)}
      >
        <div className="relative shrink-0">
          <Avatar name={user.displayName ?? 'M'} url={user.avatarUrl} size={34} />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0d0a1f]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user.displayName ?? 'Member'}</p>
          {user.headline && <p className="text-[11px] text-white/35 truncate">{user.headline}</p>}
        </div>
      </button>

      {/* Add to group button */}
      {(hovered || groupMenuOpen) && (
        <div className="relative shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onToggleGroupMenu() }}
            title="Add to group"
            className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-[#5d00f5]/40 transition-colors text-base leading-none"
          >
            +
          </button>
          {groupMenuOpen && (
            <div
              className="absolute right-0 bottom-full mb-1 rounded-xl py-1.5 shadow-2xl z-[500]"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)', minWidth: 160 }}
            >
              {myGroups.length > 0 && (
                <>
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/25">Add to group</p>
                  {myGroups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => onAddToGroup(g.id)}
                      className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/6 transition-colors truncate"
                    >
                      {g.name}
                    </button>
                  ))}
                  <div className="my-1 border-t border-white/8" />
                </>
              )}
              <button
                onClick={() => onAddToGroup('new')}
                className="w-full text-left px-3 py-1.5 text-xs text-[#9b6dff] hover:bg-white/6 transition-colors"
              >
                + New Group
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Group row (GM tab) ────────────────────────────────────────────────────────

function MemberPips({ members }: { members: GroupMember[] }) {
  const show = members.slice(0, 4)
  return (
    <div className="flex items-center gap-0.5 mt-0.5 flex-wrap">
      {show.map(m => {
        const initial = (m.displayName ?? 'M')[0].toUpperCase()
        return (
          <div
            key={m.userId}
            title={m.displayName ?? 'Member'}
            className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: m.avatarUrl ? undefined : '#5d00f520', border: '1px solid #5d00f540', fontSize: 7 }}
          >
            {m.avatarUrl
              ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
              : <span className="font-bold text-white">{initial}</span>
            }
          </div>
        )
      })}
      {members.length > 4 && (
        <span className="text-[10px] text-white/30">+{members.length - 4}</span>
      )}
      <span className="text-[10px] text-white/30 ml-0.5">
        {members.length} member{members.length !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

function GroupRow({
  group, myId, onOpen, onRename, onDelete,
}: {
  group: MyGroup
  myId: string
  onOpen: () => void
  onRename: (name: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(group.name)

  const save = () => {
    const trimmed = val.trim()
    if (trimmed && trimmed !== group.name) onRename(trimmed)
    setEditing(false)
  }

  return (
    <div className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-white/6 group/row transition-colors">
      <span className="text-base shrink-0 mt-0.5">👥</span>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
            onBlur={save}
            className="w-full bg-white/10 rounded px-2 py-0.5 text-sm text-white outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
          />
        ) : (
          <button onClick={onOpen} className="w-full text-left text-sm font-medium text-white truncate block">
            {group.name}
          </button>
        )}
        {group.members.length > 0 && <MemberPips members={group.members} />}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 mt-0.5">
        <button
          onClick={() => { setVal(group.name); setEditing(v => !v) }}
          className="w-6 h-6 flex items-center justify-center text-white/35 hover:text-white transition-colors text-xs"
          title="Rename"
        >
          ✏️
        </button>
        {group.createdBy === myId && (
          <button
            onClick={onDelete}
            className="w-6 h-6 flex items-center justify-center text-white/35 hover:text-red-400 transition-colors text-xs"
            title="Delete group"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  )
}

// ── ChatBar ───────────────────────────────────────────────────────────────────

export default function ChatBar() {
  const { myId, online, windows, gmWindows, toasts, totalUnread, openDM, openGM, dismissToast } = useChatCtx()
  const [panelOpen,    setPanelOpen]    = useState(false)
  const [tab,          setTab]          = useState<'dm' | 'gm'>('dm')
  const [myGroups,     setMyGroups]     = useState<MyGroup[]>([])
  const [groupMenuFor, setGroupMenuFor] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close group menu on outside click
  useEffect(() => {
    if (!groupMenuFor) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setGroupMenuFor(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [groupMenuFor])

  const fetchGroups = async () => {
    const res = await fetch('/api/group-chat')
    if (res.ok) setMyGroups(await res.json())
  }

  useEffect(() => {
    if (panelOpen) fetchGroups()
  }, [panelOpen])

  const createGroup = async (name: string): Promise<MyGroup | null> => {
    const res = await fetch('/api/group-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) return null
    const group: MyGroup = await res.json()
    setMyGroups(prev => [group, ...prev])
    return group
  }

  const addToGroup = async (groupId: string, userId: string) => {
    setGroupMenuFor(null)
    if (groupId === 'new') {
      const group = await createGroup('New Group')
      if (!group) return
      await fetch(`/api/group-chat/${group.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: userId }),
      })
      openGM(group.id, group.name)
      setTab('gm')
    } else {
      await fetch(`/api/group-chat/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: userId }),
      })
    }
  }

  const renameGroup = async (groupId: string, name: string) => {
    await fetch(`/api/group-chat/${groupId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setMyGroups(prev => prev.map(g => g.id === groupId ? { ...g, name } : g))
  }

  const deleteGroup = async (groupId: string) => {
    await fetch(`/api/group-chat/${groupId}`, { method: 'DELETE' })
    setMyGroups(prev => prev.filter(g => g.id !== groupId))
  }

  const handleOpenDM = (user: OnlineUser) => {
    openDM(user.id, user.displayName ?? 'Member', user.avatarUrl ?? null)
    setPanelOpen(false)
  }

  const handleOpenGM = (group: MyGroup) => {
    openGM(group.id, group.name)
    setPanelOpen(false)
  }

  const handleNewGroup = async () => {
    const group = await createGroup('New Group')
    if (group) {
      setMyGroups(prev => prev.map(g => g.id === group.id ? g : g))
    }
  }

  const hasOthersOnline = online.length >= 1

  return (
    <>
      {/* ── Notification toasts ──────────────────────────────────────────── */}
      <div className="fixed top-16 right-4 z-[110] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl cursor-pointer max-w-xs"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)' }}
            onClick={() => {
              if (toast.isGroup) openGM(toast.fromId, toast.fromName)
              else openDM(toast.fromId, toast.fromName, toast.fromAvatar)
              dismissToast(toast.id)
            }}
          >
            {toast.isGroup
              ? <span className="text-2xl shrink-0">👥</span>
              : <Avatar name={toast.fromName} url={toast.fromAvatar} size={36} />
            }
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">{toast.fromName}</p>
              <p className="text-[11px] text-white/45 truncate">{toast.preview}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); dismissToast(toast.id) }}
              className="text-white/25 hover:text-white/60 text-xs ml-1"
            >✕</button>
          </div>
        ))}
      </div>

      {/* ── Bottom right bar ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 right-4 z-50 flex items-end gap-2 pb-4">

        {/* DM windows */}
        {windows.map(w => (
          <DMWindow key={w.id} userId={w.id} name={w.name} avatar={w.avatar} />
        ))}

        {/* GM windows */}
        {gmWindows.map(w => (
          <GMWindow key={w.id} groupId={w.id} name={w.name} />
        ))}

        {/* Popup + button */}
        <div className="relative shrink-0">

          {/* Popup — floats above button */}
          {panelOpen && (
            <div
              ref={panelRef}
              className="absolute bottom-full right-0 mb-3 rounded-2xl shadow-2xl flex flex-col"
              style={{ width: 280, height: 380, background: 'var(--bg-panel)', border: '1px solid var(--border-dim)' }}
            >
              {/* Tabs */}
              <div className="shrink-0 flex items-center gap-1 p-2 border-b border-white/8">
                <button
                  onClick={() => setTab('dm')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'dm' ? 'bg-[#5d00f5] text-white' : 'text-white/40 hover:text-white hover:bg-white/6'}`}
                >
                  DM
                </button>
                <button
                  onClick={() => setTab('gm')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'gm' ? 'bg-[#5d00f5] text-white' : 'text-white/40 hover:text-white hover:bg-white/6'}`}
                >
                  Groups
                </button>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="ml-1 w-6 h-6 flex items-center justify-center text-white/25 hover:text-white/70 transition-colors text-xs"
                >✕</button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {tab === 'dm' ? (
                  online.length === 0 ? (
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
                      {online.map(u => (
                        <OnlineRow
                          key={u.id}
                          user={u}
                          onOpen={handleOpenDM}
                          myGroups={myGroups}
                          groupMenuOpen={groupMenuFor === u.id}
                          onToggleGroupMenu={() => setGroupMenuFor(v => v === u.id ? null : u.id)}
                          onAddToGroup={gId => addToGroup(gId, u.id)}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="px-2 py-2">
                    <button
                      onClick={handleNewGroup}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#9b6dff] hover:bg-white/6 transition-colors mb-1"
                    >
                      <span className="text-base font-bold">+</span> New Group
                    </button>
                    {myGroups.length === 0 ? (
                      <p className="text-center text-[11px] text-white/25 mt-6 px-4">
                        No groups yet — create one or add someone from DM tab
                      </p>
                    ) : (
                      myGroups.map(g => (
                        <GroupRow
                          key={g.id}
                          group={g}
                          myId={myId}
                          onOpen={() => handleOpenGM(g)}
                          onRename={name => renameGroup(g.id, name)}
                          onDelete={() => deleteGroup(g.id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat button */}
          <button
            onClick={() => setPanelOpen(p => !p)}
            title="Messaging"
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl relative shadow-2xl transition-transform hover:scale-105 active:scale-95"
            style={{ background: '#5d00f5', boxShadow: '0 8px 32px #5d00f540' }}
          >
            💬
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${hasOthersOnline ? 'bg-green-500' : 'bg-white/25'}`} />
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
      </div>
    </>
  )
}
