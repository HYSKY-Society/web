'use client'

import { useState } from 'react'

type Phase = 'idle' | 'sending' | 'done' | 'error'

export default function SendInviteButton({ email, label }: { email: string; label: string }) {
  const [phase,   setPhase]   = useState<Phase>('idle')
  const [errMsg,  setErrMsg]  = useState<string>('')

  const handleClick = async () => {
    if (phase !== 'idle') return
    setPhase('sending')
    try {
      const res  = await fetch('/api/admin/invite-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [email] }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrMsg(data.error ?? `HTTP ${res.status}`)
        setPhase('error')
        return
      }

      // results[0] carries per-email outcome
      const result = data.results?.[0]
      if (result?.ok) {
        setPhase('done')
      } else {
        setErrMsg(result?.error ?? 'Clerk rejected the invitation')
        setPhase('error')
      }
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Network error')
      setPhase('error')
    }
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="px-3 py-1 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 bg-red-500/10">
          Failed
        </span>
        <span className="text-[10px] text-red-400/70 max-w-[220px] text-right leading-snug">{errMsg}</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={phase !== 'idle'}
      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
        phase === 'done'
          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 cursor-default'
          : phase === 'sending'
          ? 'border-white/10 text-white/30 bg-white/4 cursor-not-allowed'
          : 'border-white/10 text-white/60 bg-white/8 hover:bg-[#5d00f5]/30 hover:text-white'
      }`}
    >
      {phase === 'idle'    && label}
      {phase === 'sending' && 'Sending…'}
      {phase === 'done'    && '✓ Sent'}
    </button>
  )
}
