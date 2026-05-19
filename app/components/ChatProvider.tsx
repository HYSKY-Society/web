'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getPusher } from '@/lib/pusher-client'

export type OnlineUser = {
  id: string
  displayName: string | null
  headline: string | null
  avatarUrl: string | null
}

export type ChatWindow = {
  id: string
  name: string
  avatar: string | null
  minimized: boolean
  unread: number
}

export type DmToast = {
  id: string       // messageId — used for dedup
  fromId: string
  fromName: string
  fromAvatar: string | null
  preview: string
}

type ChatCtx = {
  myId: string
  online: OnlineUser[]
  windows: ChatWindow[]
  toasts: DmToast[]
  totalUnread: number
  openDM: (id: string, name: string, avatar: string | null) => void
  close: (id: string) => void
  toggleMin: (id: string) => void
  markRead: (id: string) => void
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
    displayName: (info?.displayName as string) ?? null,
    headline:    (info?.headline    as string) ?? null,
    avatarUrl:   (info?.avatarUrl   as string) ?? null,
  }
}

export function ChatProvider({ myId, children }: { myId: string; children: React.ReactNode }) {
  const [online,  setOnline]  = useState<OnlineUser[]>([])
  const [windows, setWindows] = useState<ChatWindow[]>([])
  const [toasts,  setToasts]  = useState<DmToast[]>([])

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
      ch.bind('pusher:member_added', (m: { id: string; info: Record<string, unknown> }) => {
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
      ch.bind('new-dm', (data: DmToast) => {
        setWindows(prev => {
          const win = prev.find(w => w.id === data.fromId)
          if (win && !win.minimized) return prev // window is open — no toast
          if (win && win.minimized) {
            // increment badge, no toast
            return prev.map(w => w.id === data.fromId ? { ...w, unread: w.unread + 1 } : w)
          }
          // window not open — show toast
          setToasts(t => {
            if (t.some(x => x.id === data.id)) return t
            return [...t, data]
          })
          setTimeout(() => setToasts(t => t.filter(x => x.id !== data.id)), 6000)
          return prev
        })
        // Browser notification (best-effort)
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(data.fromName, { body: data.preview, icon: data.fromAvatar ?? undefined })
        }
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

  const dismissToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), [])

  const totalUnread = windows.reduce((s, w) => s + w.unread, 0)

  return (
    <Ctx.Provider value={{ myId, online, windows, toasts, totalUnread, openDM, close, toggleMin, markRead, dismissToast }}>
      {children}
    </Ctx.Provider>
  )
}
