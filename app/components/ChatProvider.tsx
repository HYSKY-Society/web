'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getPusher } from '@/lib/pusher-client'

export type OnlineUser = {
  id: string
  tier: string
  displayName: string | null
  headline: string | null
  avatarUrl: string | null
  lastSeenAt: string | null
}

export type ChatWindow = {
  id: string
  name: string
  avatar: string | null
  minimized: boolean
  unread: number
}

export type GroupWindow = {
  id: string        // groupId
  name: string
  minimized: boolean
  unread: number
}

export type DmToast = {
  id: string
  fromId: string
  fromName: string
  fromAvatar: string | null
  preview: string
  isGroup?: boolean
}

type ChatCtx = {
  myId: string
  online: OnlineUser[]
  windows: ChatWindow[]
  gmWindows: GroupWindow[]
  toasts: DmToast[]
  totalUnread: number
  openDM: (id: string, name: string, avatar: string | null) => void
  close: (id: string) => void
  toggleMin: (id: string) => void
  markRead: (id: string) => void
  openGM: (id: string, name: string) => void
  closeGM: (id: string) => void
  toggleMinGM: (id: string) => void
  markReadGM: (id: string) => void
  dismissToast: (id: string) => void
}

const Ctx = createContext<ChatCtx | null>(null)

export function useChatCtx() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useChatCtx must be inside ChatProvider')
  return c
}

function memberToUser(id: string, info: Record<string, unknown>): OnlineUser {
  return {
    id,
    tier:        (info?.tier as string) ?? 'free',
    displayName: (info?.displayName as string) ?? null,
    headline:    (info?.headline    as string) ?? null,
    avatarUrl:   (info?.avatarUrl   as string) ?? null,
    lastSeenAt:  (info?.lastSeenAt  as string) ?? null,
  }
}

export function ChatProvider({ myId, children }: { myId: string; children: React.ReactNode }) {
  const [online,    setOnline]    = useState<OnlineUser[]>([])
  const [windows,   setWindows]   = useState<ChatWindow[]>([])
  const [gmWindows, setGmWindows] = useState<GroupWindow[]>([])
  const [toasts,    setToasts]    = useState<DmToast[]>([])

  // ── Presence channel ──────────────────────────────────────────────────────
  useEffect(() => {
    let cleanup = () => {}
    try {
      const pusher = getPusher()
      const ch = pusher.subscribe('presence-online')
      ch.bind('pusher:subscription_succeeded', (members: { each: (cb: (m: { id: string; info: Record<string, unknown> }) => void) => void }) => {
        const list: OnlineUser[] = []
        members.each(m => { if (m.id !== myId) list.push(memberToUser(m.id, m.info)) })
        setOnline(list)
      })
      ch.bind('pusher:member_added',   (m: { id: string; info: Record<string, unknown> }) => {
        if (m.id === myId) return
        setOnline(prev => prev.some(u => u.id === m.id) ? prev : [...prev, memberToUser(m.id, m.info)])
      })
      ch.bind('pusher:member_removed', (m: { id: string }) => {
        setOnline(prev => prev.filter(u => u.id !== m.id))
      })
      cleanup = () => pusher.unsubscribe('presence-online')
    } catch { /* Pusher not configured */ }
    return () => cleanup()
  }, [myId])

  // ── Personal notification channel ─────────────────────────────────────────
  useEffect(() => {
    let cleanup = () => {}
    try {
      const pusher = getPusher()
      const ch = pusher.subscribe(`private-notify-${myId}`)

      // DM notification
      ch.bind('new-dm', (data: DmToast) => {
        setWindows(prev => {
          const win = prev.find(w => w.id === data.fromId)
          if (win && !win.minimized) return prev
          if (win && win.minimized) return prev.map(w => w.id === data.fromId ? { ...w, unread: w.unread + 1 } : w)
          setToasts(t => {
            if (t.some(x => x.id === data.id)) return t
            const toast = { ...data, isGroup: false }
            setTimeout(() => setToasts(ts => ts.filter(x => x.id !== data.id)), 6000)
            return [...t, toast]
          })
          return prev
        })
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(data.fromName, { body: data.preview, icon: data.fromAvatar ?? undefined })
        }
      })

      // Group notification
      ch.bind('new-gm', (data: { id: string; groupId: string; groupName: string; fromName: string; preview: string }) => {
        setGmWindows(prev => {
          const win = prev.find(w => w.id === data.groupId)
          if (win && !win.minimized) return prev
          if (win && win.minimized) return prev.map(w => w.id === data.groupId ? { ...w, unread: w.unread + 1 } : w)
          setToasts(t => {
            if (t.some(x => x.id === data.id)) return t
            const toast: DmToast = {
              id:        data.id,
              fromId:    data.groupId,
              fromName:  data.groupName,
              fromAvatar: null,
              preview:   `${data.fromName}: ${data.preview}`,
              isGroup:   true,
            }
            setTimeout(() => setToasts(ts => ts.filter(x => x.id !== data.id)), 6000)
            return [...t, toast]
          })
          return prev
        })
      })

      cleanup = () => pusher.unsubscribe(`private-notify-${myId}`)
    } catch { /* ignore */ }
    return () => cleanup()
  }, [myId])

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // ── DM window helpers ─────────────────────────────────────────────────────
  const openDM = useCallback((id: string, name: string, avatar: string | null) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id)
      if (existing) return prev.map(w => w.id === id ? { ...w, minimized: false, unread: 0 } : w)
      return [...prev, { id, name, avatar, minimized: false, unread: 0 }]
    })
  }, [])

  const close = useCallback((id: string) => setWindows(prev => prev.filter(w => w.id !== id)), [])

  const toggleMin = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: !w.minimized, unread: 0 } : w))
  }, [])

  const markRead = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, unread: 0 } : w))
  }, [])

  // ── GM window helpers ─────────────────────────────────────────────────────
  const openGM = useCallback((id: string, name: string) => {
    setGmWindows(prev => {
      const existing = prev.find(w => w.id === id)
      if (existing) return prev.map(w => w.id === id ? { ...w, minimized: false, unread: 0 } : w)
      return [...prev, { id, name, minimized: false, unread: 0 }]
    })
  }, [])

  const closeGM = useCallback((id: string) => setGmWindows(prev => prev.filter(w => w.id !== id)), [])

  const toggleMinGM = useCallback((id: string) => {
    setGmWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: !w.minimized, unread: 0 } : w))
  }, [])

  const markReadGM = useCallback((id: string) => {
    setGmWindows(prev => prev.map(w => w.id === id ? { ...w, unread: 0 } : w))
  }, [])

  const dismissToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), [])

  const totalUnread = [
    ...windows.map(w => w.unread),
    ...gmWindows.map(w => w.unread),
  ].reduce((s, n) => s + n, 0)

  return (
    <Ctx.Provider value={{
      myId, online, windows, gmWindows, toasts, totalUnread,
      openDM, close, toggleMin, markRead,
      openGM, closeGM, toggleMinGM, markReadGM,
      dismissToast,
    }}>
      {children}
    </Ctx.Provider>
  )
}
