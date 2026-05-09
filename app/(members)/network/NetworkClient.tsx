'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type OnlineUser = {
  id: string
  displayName: string | null
  headline: string | null
  avatarUrl: string | null
  lastSeenAt: string | null
}

type Message = {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  createdAt: string
}

function Avatar({ user, size = 56 }: { user: OnlineUser; size?: number }) {
  const initials = (user.displayName ?? 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 font-bold text-white select-none"
      style={{
        width: size, height: size,
        background: user.avatarUrl ? undefined : `hsl(${hashCode(user.id) % 360}, 55%, 35%)`,
        fontSize: size * 0.32,
      }}
    >
      {user.avatarUrl
        ? <img src={user.avatarUrl} alt={user.displayName ?? ''} className="w-full h-full object-cover" />
        : initials}
    </div>
  )
}

function hashCode(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}

export default function NetworkClient({ myId }: { myId: string }) {
  const [online, setOnline]     = useState<OnlineUser[]>([])
  const [chatWith, setChatWith] = useState<OnlineUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const messagesEndRef           = useRef<HTMLDivElement>(null)
  const inputRef                 = useRef<HTMLInputElement>(null)

  // Ping presence and get online users
  const pingPresence = useCallback(async () => {
    try {
      const res = await fetch('/api/presence', { method: 'POST' })
      if (res.ok) setOnline(await res.json())
    } catch { /* ignore */ }
  }, [])

  // Poll messages
  const fetchMessages = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/messages/${userId}`)
      if (res.ok) setMessages(await res.json())
    } catch { /* ignore */ }
  }, [])

  // Initial presence ping + polling
  useEffect(() => {
    pingPresence()
    const interval = setInterval(pingPresence, 30_000)
    return () => clearInterval(interval)
  }, [pingPresence])

  // Poll messages when chat is open
  useEffect(() => {
    if (!chatWith) return
    fetchMessages(chatWith.id)
    const interval = setInterval(() => fetchMessages(chatWith.id), 4_000)
    return () => clearInterval(interval)
  }, [chatWith, fetchMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openChat = (user: OnlineUser) => {
    setChatWith(user)
    setMessages([])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const closeChat = () => {
    setChatWith(null)
    setMessages([])
    setInput('')
  }

  const sendMessage = async () => {
    if (!chatWith || !input.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${chatWith.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      })
      if (res.ok) {
        setInput('')
        await fetchMessages(chatWith.id)
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="relative">
      {/* Online count */}
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
          <p className="text-white/25 text-sm">
            Be the first! When others are online, their bubbles will appear here.
          </p>
          <p className="text-white/15 text-xs mt-2">Online members appear when active in the past 5 minutes.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {online.map(user => (
            <button
              key={user.id}
              onClick={() => openChat(user)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative">
                <Avatar user={user} size={64} />
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#060510]" />
              </div>
              <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors max-w-[72px] truncate text-center">
                {user.displayName ?? 'Member'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Chat panel */}
      {chatWith && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeChat}
          />

          {/* Drawer */}
          <div
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-sm"
            style={{ background: '#080614', borderLeft: '1px solid rgba(255,255,255,.1)' }}
          >
            {/* Chat header */}
            <div
              className="shrink-0 flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}
            >
              <div className="relative shrink-0">
                <Avatar user={chatWith} size={38} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#080614]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{chatWith.displayName ?? 'Member'}</p>
                {chatWith.headline && (
                  <p className="text-xs text-white/35 truncate">{chatWith.headline}</p>
                )}
              </div>
              <button
                onClick={closeChat}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Avatar user={chatWith} size={52} />
                  <p className="text-white/40 text-sm mt-3">
                    Start a conversation with {chatWith.displayName ?? 'this member'}
                  </p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.fromUserId === myId
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          isMine
                            ? 'bg-[#5d00f5] text-white rounded-br-sm'
                            : 'text-white/85 rounded-bl-sm'
                        }`}
                        style={isMine ? undefined : { background: 'rgba(255,255,255,.08)' }}
                      >
                        {msg.content}
                        <span className={`block text-[10px] mt-0.5 ${isMine ? 'text-white/50' : 'text-white/25'} text-right`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="shrink-0 px-3 py-3"
              style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ background: input.trim() ? '#5d00f5' : 'transparent' }}
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-center text-[10px] text-white/15 mt-1.5">Enter to send</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
