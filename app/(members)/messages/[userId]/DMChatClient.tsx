'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getPusher } from '@/lib/pusher-client'

type Msg = { id: string; fromUserId: string; toUserId: string; content: string; createdAt: string }

function dmChannel(a: string, b: string) {
  return `private-dm-${[a, b].sort().join('-')}`
}

function Avatar({ name, url, size = 36 }: { name: string; url: string | null; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 font-bold text-white select-none text-xs"
      style={{ width: size, height: size, background: url ? undefined : '#5d00f530', border: '1px solid #5d00f540' }}
    >
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}

export default function DMChatClient({
  myId, otherId, otherName, otherAvatar, initialMessages,
}: {
  myId: string; otherId: string; otherName: string; otherAvatar: string | null
  initialMessages: Msg[]
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages)
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const pusher  = getPusher()
    const channel = pusher.subscribe(dmChannel(myId, otherId))
    channel.bind('new-message', (msg: Msg) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
    })
    return () => { pusher.unsubscribe(dmChannel(myId, otherId)) }
  }, [myId, otherId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${otherId}`, {
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
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl text-white">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 pb-4 mb-4 border-b border-white/8">
        <Link href="/messages" className="text-white/35 hover:text-white/70 text-sm transition-colors mr-1">←</Link>
        <Avatar name={otherName} url={otherAvatar} size={38} />
        <div>
          <p className="font-semibold text-sm">{otherName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Avatar name={otherName} url={otherAvatar} size={52} />
            <p className="text-white/35 text-sm mt-3">Start a conversation with {otherName}</p>
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.fromUserId === myId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMine ? 'bg-[#5d00f5] text-white rounded-br-sm' : 'bg-white/8 text-white/85 rounded-bl-sm'
                }`}
              >
                {msg.content}
                <span className={`block text-[10px] mt-0.5 text-right ${isMine ? 'text-white/45' : 'text-white/25'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-4 border-t border-white/8">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-white/6 border border-white/10">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`Message ${otherName}…`}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: input.trim() ? '#5d00f5' : 'rgba(255,255,255,.06)' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-white/15 mt-1.5">Enter to send</p>
      </div>
    </div>
  )
}
