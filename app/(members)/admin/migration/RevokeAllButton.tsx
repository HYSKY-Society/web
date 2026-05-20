'use client'

import { useState } from 'react'

export default function RevokeAllButton({ count }: { count: number }) {
  const [phase,   setPhase]   = useState<'idle' | 'confirm' | 'revoking' | 'done'>('idle')
  const [revoked, setRevoked] = useState(0)

  if (count === 0) return null

  const handleRevoke = async () => {
    setPhase('revoking')
    try {
      const res = await fetch('/api/admin/revoke-invitations', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setRevoked(data.revoked ?? 0)
      }
    } catch { /* ignore */ }
    setPhase('done')
  }

  if (phase === 'done') {
    return (
      <p className="text-xs text-amber-400">
        ✓ {revoked} invitation{revoked !== 1 ? 's' : ''} revoked — you can now resend all pending.
      </p>
    )
  }

  if (phase === 'confirm') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/50">Revoke all {count} pending invitations?</span>
        <button
          onClick={handleRevoke}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 transition-colors"
          style={{ color: '#fff' }}
        >
          Yes, revoke all
        </button>
        <button
          onClick={() => setPhase('idle')}
          className="px-3 py-1 rounded-lg text-xs text-white/40 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (phase === 'revoking') {
    return <p className="text-xs text-white/40 animate-pulse">Revoking {count} invitations…</p>
  }

  return (
    <button
      onClick={() => setPhase('confirm')}
      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20"
    >
      Revoke all {count} pending invitations
    </button>
  )
}
