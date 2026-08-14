'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPusher } from '@/lib/pusher-client'
import { useChatCtx } from './ChatProvider'

type NotificationItem = {
  id: string
  actorId: string | null
  type: 'post' | 'like' | 'reply' | 'mention' | 'dm'
  entityId: string | null
  href: string | null
  readAt: string | null
  createdAt: string
  actor: { userId: string; displayName: string | null; avatarUrl: string | null } | null
}

function notificationText(item: NotificationItem) {
  const name = item.actor?.displayName ?? 'A HySky member'
  if (item.type === 'post') return `${name} posted in the community`
  if (item.type === 'like') return `${name} liked your post`
  if (item.type === 'reply') return `${name} commented on your post`
  if (item.type === 'mention') return `${name} tagged you in a post`
  return `${name} sent you a direct message`
}

function timeAgo(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days}d ago` : new Date(value).toLocaleDateString()
}

export default function NotificationBell({ myId }: { myId: string }) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastUnreadRef = useRef<number | null>(null)
  const router = useRouter()
  const { openDM } = useChatCtx()

  const playNotificationChime = useCallback(() => {
    const context = audioContextRef.current
    if (!context || context.state !== 'running') return

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(660, now)
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.12)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.25)
  }, [])

  const refresh = useCallback(async () => {
    const response = await fetch('/api/notifications', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json() as { items: NotificationItem[]; unreadCount: number }
    const previousUnread = lastUnreadRef.current
    if (previousUnread !== null && data.unreadCount > previousUnread) {
      playNotificationChime()
    }
    lastUnreadRef.current = data.unreadCount
    setItems(data.items)
    setUnreadCount(data.unreadCount)
  }, [playNotificationChime])

  useEffect(() => {
    const unlockAudio = () => {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext()
      if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume()
      }
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  useEffect(() => {
    refresh()
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener('notifications:refresh', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('notifications:refresh', refresh)
    }
  }, [refresh])

  useEffect(() => {
    let cleanup = () => {}
    try {
      const pusher = getPusher()
      const personal = pusher.subscribe(`private-notify-${myId}`)
      const community = pusher.subscribe('community-notifications')
      personal.bind('new-notification', refresh)
      personal.bind('new-dm', refresh)
      community.bind('new-post', (data: { actorId: string }) => {
        if (data.actorId !== myId) refresh()
      })
      cleanup = () => {
        pusher.unsubscribe(`private-notify-${myId}`)
        pusher.unsubscribe('community-notifications')
      }
    } catch { /* Pusher is optional; polling remains active. */ }
    return cleanup
  }, [myId, refresh])

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const markRead = async (id: string) => {
    const wasUnread = !items.find((item) => item.id === id)?.readAt
    setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item))
    setUnreadCount((count) => Math.max(0, count - (wasUnread ? 1 : 0)))
    if (wasUnread && lastUnreadRef.current !== null) {
      lastUnreadRef.current = Math.max(0, lastUnreadRef.current - 1)
    }
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const openNotification = async (item: NotificationItem) => {
    await markRead(item.id)
    setOpen(false)
    if (item.type === 'dm' && item.actorId) {
      openDM(item.actorId, item.actor?.displayName ?? 'Member', item.actor?.avatarUrl ?? null)
      return
    }
    if (item.href) router.push(item.href)
  }

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })))
    setUnreadCount(0)
    lastUnreadRef.current = 0
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-white/55 hover:text-white hover:bg-white/6 transition-colors"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center" style={{ color: '#fff' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(360px,calc(100vw-24px))] rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div>
              <p className="text-sm font-bold text-white">Notifications</p>
              <p className="text-[11px] text-white/35">{unreadCount ? `${unreadCount} unread` : 'You are all caught up'}</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-[#9b6dff] hover:text-white transition-colors">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="text-2xl mb-2">ðŸ””</div>
                <p className="text-sm text-white/50">No notifications yet</p>
              </div>
            ) : items.map((item) => {
              const name = item.actor?.displayName ?? 'HySky member'
              return (
                <button
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-white/6 hover:bg-white/6 transition-colors ${item.readAt ? '' : 'bg-[#5d00f5]/10'}`}
                >
                  <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden bg-[#5d00f5]/25 flex items-center justify-center">
                    {item.actor?.avatarUrl
                      ? <img src={item.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-sm font-bold text-[#9b6dff]">{name[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/75 leading-snug">{notificationText(item)}</p>
                    <p className="text-[11px] text-white/30 mt-1">{timeAgo(item.createdAt)}</p>
                  </div>
                  {!item.readAt && <span className="w-2 h-2 rounded-full bg-[#5d00f5] mt-2 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
