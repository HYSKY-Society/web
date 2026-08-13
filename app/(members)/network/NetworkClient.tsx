'use client'

import { useEffect, useState } from 'react'
import { useChatCtx, type OnlineUser } from '@/app/components/ChatProvider'

type Conversation = {
  userId: string
  displayName: string
  headline: string | null
  avatarUrl: string | null
  lastMessage: string
  lastMessageAt: string
  lastMessageFromMe: boolean
  unreadCount: number
}

function hashCode(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index) | 0
  }
  return Math.abs(hash)
}

function Avatar({
  name,
  url,
  userId,
  size = 48,
}: {
  name: string
  url: string | null
  userId: string
  size?: number
}) {
  const initials = (name || 'M')
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-cover bg-center font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: url ? undefined : `hsl(${hashCode(userId) % 360},55%,35%)`,
        backgroundImage: url ? `url("${url}")` : undefined,
        fontSize: size * 0.32,
      }}
    >
      {url ? null : initials}
    </span>
  )
}

function relativeTime(value: string | null) {
  if (!value) return 'No recent activity'
  const date = new Date(value)
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function messageTime(value: string) {
  const date = new Date(value)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function NetworkClient() {
  const { online, openDM } = useChatCtx()
  const [allUsers, setAllUsers] = useState<OnlineUser[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(true)

  useEffect(() => {
    const updatePresence = () => {
      fetch('/api/presence', { method: 'POST' }).catch(() => {})
    }
    updatePresence()
    const interval = window.setInterval(updatePresence, 30_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let active = true
    const loadMembers = () => {
      fetch('/api/presence?all=true')
        .then((response) => response.ok ? response.json() : [])
        .then((data) => {
          if (active && Array.isArray(data)) setAllUsers(data)
        })
        .catch(() => {})
        .finally(() => {
          if (active) setMembersLoading(false)
        })
    }

    loadMembers()
    const interval = window.setInterval(loadMembers, 60_000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let active = true
    const loadConversations = () => {
      fetch('/api/messages')
        .then((response) => response.ok ? response.json() : [])
        .then((data) => {
          if (active && Array.isArray(data)) setConversations(data)
        })
        .catch(() => {})
        .finally(() => {
          if (active) setMessagesLoading(false)
        })
    }

    loadConversations()
    const interval = window.setInterval(loadConversations, 15_000)
    window.addEventListener('focus', loadConversations)
    window.addEventListener('notifications:refresh', loadConversations)

    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('focus', loadConversations)
      window.removeEventListener('notifications:refresh', loadConversations)
    }
  }, [])

  const onlineById = new Map(online.map((member) => [member.id, member]))
  const recentlyActive = [...allUsers].sort((first, second) => {
    const firstOnline = onlineById.has(first.id)
    const secondOnline = onlineById.has(second.id)
    if (firstOnline !== secondOnline) return firstOnline ? -1 : 1
    return new Date(second.lastSeenAt ?? 0).getTime() - new Date(first.lastSeenAt ?? 0).getTime()
  })

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section aria-labelledby="conversation-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="conversation-heading" className="text-lg font-bold text-white">Recent conversations</h2>
            <p className="mt-1 text-xs text-white/40">Newest messages appear first.</p>
          </div>
          {conversations.length > 0 ? (
            <span className="text-xs text-white/35">
              {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>

        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
        >
          {messagesLoading ? (
            <p className="px-5 py-12 text-center text-sm text-white/35">Loading messages…</p>
          ) : conversations.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mb-3 text-3xl" aria-hidden="true">💬</div>
              <p className="font-semibold text-white">No messages yet</p>
              <p className="mt-1 text-sm text-white/40">Choose a recently active member to start a conversation.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/8">
              {conversations.map((conversation) => (
                <button
                  key={conversation.userId}
                  type="button"
                  onClick={() => openDM(conversation.userId, conversation.displayName, conversation.avatarUrl)}
                  aria-label={`Open conversation with ${conversation.displayName}`}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-white/5 sm:px-5"
                >
                  <Avatar
                    name={conversation.displayName}
                    url={conversation.avatarUrl}
                    userId={conversation.userId}
                    size={52}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-white">{conversation.displayName}</span>
                      {onlineById.has(conversation.userId) ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-green-400" title="Online now" />
                      ) : null}
                    </span>
                    <span className={`mt-1 block truncate text-sm ${conversation.unreadCount > 0 ? 'font-semibold text-white' : 'text-white/45'}`}>
                      {conversation.lastMessageFromMe ? 'You: ' : ''}{conversation.lastMessage}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-[11px] text-white/35">{messageTime(conversation.lastMessageAt)}</span>
                    {conversation.unreadCount > 0 ? (
                      <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#5d00f5] px-1.5 text-[10px] font-bold text-white">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside aria-labelledby="active-members-heading">
        <div className="mb-4">
          <h2 id="active-members-heading" className="text-lg font-bold text-white">Recently active members</h2>
          <p className="mt-1 text-xs text-white/40">Online members are shown first.</p>
        </div>

        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
        >
          {membersLoading ? (
            <p className="px-5 py-10 text-center text-sm text-white/35">Loading members…</p>
          ) : recentlyActive.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-white/35">No other members yet.</p>
          ) : (
            <div className="max-h-[620px] divide-y divide-white/8 overflow-y-auto">
              {recentlyActive.map((member) => {
                const liveMember = onlineById.get(member.id)
                const name = member.displayName ?? 'Member'
                const isOnline = Boolean(liveMember)
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => openDM(member.id, name, member.avatarUrl)}
                    aria-label={`Message ${name}`}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="relative">
                      <Avatar name={name} url={member.avatarUrl} userId={member.id} size={42} />
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${isOnline ? 'bg-green-400' : 'bg-zinc-500'}`}
                        style={{ borderColor: 'var(--bg-card)' }}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{name}</span>
                      <span className="block truncate text-xs text-white/40">
                        {member.headline ?? (isOnline ? 'Online now' : 'HySky member')}
                      </span>
                    </span>
                    <span className={`shrink-0 text-[10px] ${isOnline ? 'font-semibold text-green-400' : 'text-white/30'}`}>
                      {isOnline ? 'Online' : relativeTime(member.lastSeenAt)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
