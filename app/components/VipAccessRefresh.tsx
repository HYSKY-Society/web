'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getPusher } from '@/lib/pusher-client'

export default function VipAccessRefresh({
  initialTier,
  myId,
}: {
  initialTier: string
  myId: string
}) {
  const router = useRouter()
  const checking = useRef(false)
  const pendingUpdate = useRef(false)

  const checkAccess = useCallback(async () => {
    if (checking.current || document.visibilityState !== 'visible') return

    if (pendingUpdate.current) {
      pendingUpdate.current = false
      router.refresh()
      return
    }

    checking.current = true
    try {
      const response = await fetch('/api/me/access', { cache: 'no-store' })
      if (!response.ok) return
      const access = await response.json() as { tier?: string }

      if (access.tier && access.tier !== initialTier) router.refresh()
    } catch {
      // A later purchase action or page navigation will read the saved tier.
    } finally {
      checking.current = false
    }
  }, [initialTier, router])

  useEffect(() => {
    const onUpgradeAction = () => void checkAccess()
    window.addEventListener('vip-access:check', onUpgradeAction)

    return () => {
      window.removeEventListener('vip-access:check', onUpgradeAction)
    }
  }, [checkAccess])

  useEffect(() => {
    const applyPendingUpdate = () => {
      if (document.visibilityState === 'visible' && pendingUpdate.current) {
        pendingUpdate.current = false
        router.refresh()
      }
    }
    document.addEventListener('visibilitychange', applyPendingUpdate)
    return () => document.removeEventListener('visibilitychange', applyPendingUpdate)
  }, [router])

  useEffect(() => {
    try {
      const pusher = getPusher()
      const channelName = `private-access-${myId}`
      const channel = pusher.subscribe(channelName)
      const onMembershipChanged = () => {
        if (document.visibilityState === 'visible') router.refresh()
        else pendingUpdate.current = true
      }
      channel.bind('membership-changed', onMembershipChanged)
      return () => {
        channel.unbind('membership-changed', onMembershipChanged)
        pusher.unsubscribe(channelName)
      }
    } catch {
      // A later purchase action or page navigation still reads the saved tier.
    }
  }, [myId, router])

  return null
}
