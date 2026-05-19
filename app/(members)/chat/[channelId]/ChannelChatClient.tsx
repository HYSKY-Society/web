'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getPusher } from '@/lib/pusher-client'

type ChatMsg = {
  id: string; channelId: string; userId: string; content: string
  createdAt: string; displayName: string; avatarUrl: string | null
}

function hashColor(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return `hsl(${Math.abs(h) % 360}, 55%, 38%)`
}

function Avatar({ name, url, userId, size = 32 }: { name: string; url: string | null; userId: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 font-bold text-white text-[10px] select-none"
      style={{ width: size, height: size, background: url ? undefined : hashColor(userId) }}
    >
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}

export default function ChannelChatClient({
  myId, myName, myAvatar, channel, initialMessages,
}: {
  myId: string; myName: string; myAvatar: string | null
  channel: { id: string; name: string; icon: string }
  initialMessages: ChatMsg[]
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages)
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)
  const channelPusher           = `presence-chat-${channel.id}`

  useEffect(() => {
    const pusher = getPusher()
    const ch     = pusher.subscribe(channelPusher)
    ch.bind('new-message', (msg: ChatMsg) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
    })
    return () => { pusher.unsubscribe(channelPusher) }
  }, [channelPusher])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    try {
      const res = await fetch(`/api/chat/${channel.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const msg: ChatMsg = await res.json()
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      }
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl text-white">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 pb-4 mb-4 border-b border-white/8">
        <Link href="/chat" className="text-white/35 hover:text-white/70 text-sm transition-colors mr-1">←</Link>
        <span className="text-xl">{channel.icon}</span>
        <div>
          <p className="font-semibold text-sm"># {channel.name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-5xl mb-3">{channel.icon}</span>
            <p className="text-white/35 text-sm">Be the first to post in # {channel.name}</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const showHeader = i === 0 || messages[i - 1].userId !== msg.userId
          return (
            <div key={msg.id} className={`flex gap-3 ${showHeader ? 'mt-4' : 'mt-0.5'}`}>
              <div className="w-8 shrink-0">
                {showHeader && <Avatar name={msg.displayName} url={msg.avatarUrl} userId={msg.userId} />}
              </div>
              <div className="flex-1 min-w-0">
                {showHeader && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">
                      {msg.userId === myId ? 'You' : msg.displayName}
                    </span>
                    <span className="text-[10px] text-white/25">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                <p className="text-sm text-white/80 leading-relaxed break-words">{msg.content}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-4 border-t border-white/8">
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 bg-white/6 border border-white/10">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`Message # ${channel.name}…`}
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
