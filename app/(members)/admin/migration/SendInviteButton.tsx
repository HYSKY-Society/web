'use client'

import { useState } from 'react'

type Phase = 'idle' | 'sending' | 'done' | 'error'

export default function SendInviteButton({ email, label }: { email: string; label: string }) {
  const [phase, setPhase] = useState<Phase>('idle')

  const handleClick = async () => {
    if (phase !== 'idle') return
    setPhase('sending')
    try {
      const res = await fetch('/api/admin/invite-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [email] }),
      })
      const data = await res.json()
      setPhase(data.sent > 0 ? 'done' : 'error')
    } catch {
      setPhase('error')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={phase !== 'idle'}
      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
        phase === 'done'
          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 cursor-default'
          : phase === 'error'
          ? 'border-red-500/30 text-red-400 bg-red-500/10 cursor-default'
          : phase === 'sending'
          ? 'border-white/10 text-white/30 bg-white/4 cursor-not-allowed'
          : 'border-white/10 text-white/60 bg-white/8 hover:bg-[#5d00f5]/30 hover:text-white'
      }`}
    >
      {phase === 'idle'    && label}
      {phase === 'sending' && 'Sending…'}
      {phase === 'done'    && '✓ Sent'}
      {phase === 'error'   && 'Failed'}
    </button>
  )
}
