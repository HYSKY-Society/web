'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const FREE_ACCESS_CHECK_INTERVAL_MS = 10000

export default function VipAccessRefresh({
  initialCanUseVipCommunity,
}: {
  initialCanUseVipCommunity: boolean
}) {
  const router = useRouter()
  const refreshing = useRef(false)

  const checkAccess = useCallback(async () => {
    if (initialCanUseVipCommunity || refreshing.current) return

    try {
      const response = await fetch('/api/me/access', { cache: 'no-store' })
      if (!response.ok) return
      const access = await response.json() as { canUseVipCommunity?: boolean }

      if (access.canUseVipCommunity) {
        refreshing.current = true
        router.refresh()
      }
    } catch {
      // The next interval/focus event will retry.
    }
  }, [initialCanUseVipCommunity, router])

  useEffect(() => {
    if (initialCanUseVipCommunity) return

    void checkAccess()
    const interval = window.setInterval(checkAccess, FREE_ACCESS_CHECK_INTERVAL_MS)
    const onFocus = () => void checkAccess()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void checkAccess()
    }

    window.addEventListener('focus', onFocus)
    window.addEventListener('vip-access:check', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('vip-access:check', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [checkAccess, initialCanUseVipCommunity])

  return null
}
