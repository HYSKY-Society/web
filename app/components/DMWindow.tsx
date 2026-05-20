'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatCtx } from './ChatProvider'
import { getPusher } from '@/lib/pusher-client'

type Msg = { id: string; fromUserId: string; toUserId: string; content: string; createdAt: string }

function Avatar({ name, url, size = 28 }: { name: string; url: string | null; size?: number }) {
  const initials = (name || 'M').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      style={{ width: size, height: size, background: url ? undefined : '#5d00f520', border: '1px solid #5d00f550', fontSize: size * 0.38 }}
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 font-bold text-white select-none"
    >
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}

export default function DMWindow({ userId, name, avatar }: { userId: string; name: string; avatar: string | null }) {
  const { myId, windows, close, toggleMin, markRead } = useChatCtx()
  const win = windows.find(w => w.id === userId)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [loaded, setLoaded]     = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  const minimized = win?.minimized ?? false
  const unread    = win?.unread    ?? 0

  // Load messages when first opened
  useEffect(() => {
    if (minimized || loaded) return
    fetch(`/api/messages/${userId}`)
      .then(r => r.ok ? r.json() : [])
      .then(msgs => { setMessages(msgs); setLoaded(true) })
      .catch(() => { setLoaded(true) })
  }, [userId, minimized, loaded])

  // Pusher DM channel
  useEffect(() => {
    let cleanup = () => {}
    try {
      const channel = `private-dm-${[myId, userId].sort().join('-')}`
      const pusher = getPusher()
      const ch = pusher.subscribe(channel)
      ch.bind('new-message', (msg: Msg) => {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      })
      cleanup = () => pusher.unsubscribe(channel)
    } catch { /* ignore */ }
    return () => cleanup()
  }, [myId, userId])

  // Scroll to bottom
  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, minimized])

  // Mark read when expanded
  useEffect(() => {
    if (!minimized && unread > 0) markRead(userId)
  }, [minimized, unread, userId, markRead])

  const send = async () => {
    const content = input.trim()
    if (!content || sending) return
    setInput('')
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const msg: Msg = await res.json()
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      }
    } finally {
      setSending(false)
      if (!minimized) inputRef.current?.focus()
    }
  }

  // Minimized tab
  if (minimized) {
    return (
      <button
        onClick={() => toggleMin(userId)}
        className="relative flex items-center gap-2 h-10 px-3 rounded-t-xl text-sm font-semibold text-white transition-colors hover:bg-white/5"
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)', borderBottom: 'none', maxWidth: 192 }}
      >
        <Avatar name={name} url={avatar} size={22} />
        <span className="truncate max-w-[100px]">{name}</span>
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

  // Full window
  return (
    <div
      className="flex flex-col rounded-t-xl overflow-hidden w-[276px] shrink-0"
      style={{ height: 380, background: 'var(--bg-panel)', border: '1px solid var(--border-dim)', borderBottom: 'none' }}
    >
      {/* Header — click to minimize */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-white/8 cursor-pointer select-none hover:bg-white/4 transition-colors"
        onClick={() => toggleMin(userId)}
      >
        <Avatar name={name} url={avatar} size={28} />
        <span className="flex-1 text-sm font-semibold text-white truncate">{name}</span>
        <button
          title="Close"
          onClick={e => { e.stopPropagation(); close(userId) }}
          className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {loaded && messages.length === 0 && (
          <p className="text-center text-[11px] text-white/20 mt-10">Send a message to start the conversation</p>
        )}
        {messages.map(msg => {
          const isMine = msg.fromUserId === myId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[84%] text-[12px] px-3 py-1.5 rounded-2xl leading-relaxed ${
                  isMine
                    ? 'bg-[#5d00f5] rounded-br-sm'
                    : 'bg-white/8 text-white/85 rounded-bl-sm'
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
            placeholder={`Message ${name}…`}
            className="flex-1 bg-transparent text-[12px] text-white placeholder-white/20 outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center disabled:opacity-25 transition-colors"
            style={{ background: input.trim() ? '#5d00f5' : 'transparent' }}
          >
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: '#fff' }}
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
