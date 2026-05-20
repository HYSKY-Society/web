'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatCtx } from './ChatProvider'
import { getPusher } from '@/lib/pusher-client'

type GMsg = {
  id: string
  groupId: string
  fromUserId: string
  fromName: string | null
  fromAvatar: string | null
  content: string
  createdAt: string
}

function Avatar({ name, url, size = 26 }: { name: string; url: string | null; size?: number }) {
  const initials = (name || 'G').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      style={{ width: size, height: size, background: url ? undefined : '#5d00f520', border: '1px solid #5d00f550', fontSize: size * 0.38 }}
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 font-bold text-white select-none"
    >
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}

export default function GMWindow({ groupId, name }: { groupId: string; name: string }) {
  const { myId, gmWindows, closeGM, toggleMinGM, markReadGM } = useChatCtx()
  const win = gmWindows.find(w => w.id === groupId)
  const [messages, setMessages]   = useState<GMsg[]>([])
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [loaded, setLoaded]       = useState(false)
  const [groupName, setGroupName] = useState(name)
  const [editing, setEditing]     = useState(false)
  const [editVal, setEditVal]     = useState(name)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const minimized = win?.minimized ?? false
  const unread    = win?.unread    ?? 0

  useEffect(() => {
    if (minimized || loaded) return
    fetch(`/api/group-chat/${groupId}/messages`)
      .then(r => r.ok ? r.json() : [])
      .then(msgs => { setMessages(msgs); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [groupId, minimized, loaded])

  useEffect(() => {
    let cleanup = () => {}
    try {
      const ch = getPusher().subscribe(`private-gm-${groupId}`)
      ch.bind('new-message', (msg: GMsg) => {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      })
      cleanup = () => getPusher().unsubscribe(`private-gm-${groupId}`)
    } catch { /* ignore */ }
    return () => cleanup()
  }, [groupId])

  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, minimized])

  useEffect(() => {
    if (!minimized && unread > 0) markReadGM(groupId)
  }, [minimized, unread, groupId, markReadGM])

  const send = async () => {
    const content = input.trim()
    if (!content || sending) return
    setInput('')
    setSending(true)
    try {
      const res = await fetch(`/api/group-chat/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const msg: GMsg = await res.json()
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      }
    } finally {
      setSending(false)
      if (!minimized) inputRef.current?.focus()
    }
  }

  const saveRename = async () => {
    const trimmed = editVal.trim()
    if (!trimmed) return
    setGroupName(trimmed)
    setEditing(false)
    await fetch(`/api/group-chat/${groupId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
  }

  // Minimized tab
  if (minimized) {
    return (
      <button
        onClick={() => toggleMinGM(groupId)}
        className="relative flex items-center gap-2 h-10 px-3 rounded-t-xl text-sm font-semibold text-white transition-colors hover:bg-white/5"
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)', borderBottom: 'none', maxWidth: 192 }}
      >
        <span className="text-base">👥</span>
        <span className="truncate max-w-[100px]">{groupName}</span>
        {unread > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#5d00f5] text-[9px] font-bold flex items-center justify-center"
            style={{ color: '#fff' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className="flex flex-col rounded-t-xl overflow-hidden shrink-0"
      style={{ width: 300, height: 380, background: 'var(--bg-panel)', border: '1px solid var(--border-dim)', borderBottom: 'none' }}
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-white/8 cursor-pointer select-none hover:bg-white/4 transition-colors"
        onClick={() => toggleMinGM(groupId)}
      >
        <span className="text-base">👥</span>
        {editing ? (
          <input
            autoFocus
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditing(false) }}
            onBlur={saveRename}
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-white/10 rounded px-1.5 py-0.5 text-sm font-semibold text-white outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-white truncate">{groupName}</span>
        )}
        <button
          title="Rename"
          onClick={e => { e.stopPropagation(); setEditVal(groupName); setEditing(v => !v) }}
          className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white transition-colors text-xs"
        >
          ✏️
        </button>
        <button
          title="Close"
          onClick={e => { e.stopPropagation(); closeGM(groupId) }}
          className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loaded && messages.length === 0 && (
          <p className="text-center text-[11px] text-white/20 mt-10">No messages yet — say hello!</p>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.fromUserId === myId
          const prevMsg = messages[i - 1]
          const showName = !isMine && msg.fromUserId !== prevMsg?.fromUserId
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              {showName && (
                <span className="text-[10px] text-white/35 mb-0.5 px-1">{msg.fromName ?? 'Member'}</span>
              )}
              <div
                className={`max-w-[85%] text-[12px] px-3 py-1.5 rounded-2xl leading-relaxed ${
                  isMine ? 'bg-[#5d00f5] rounded-br-sm' : 'bg-white/8 text-white/85 rounded-bl-sm'
                }`}
                style={isMine ? { color: '#fff' } : undefined}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-2 pb-2 pt-1 border-t border-white/8">
        <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-2.5 py-1.5 border border-white/10">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`Message ${groupName}…`}
            className="flex-1 bg-transparent text-[12px] text-white placeholder-white/20 outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center disabled:opacity-25 transition-colors"
            style={{ background: input.trim() ? '#5d00f5' : 'transparent' }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#fff' }}>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
