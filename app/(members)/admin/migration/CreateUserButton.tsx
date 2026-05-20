'use client'

import { useState } from 'react'

type Phase = 'idle' | 'creating' | 'done' | 'error'

export default function CreateUserButton({
  email,
  firstName,
  lastName,
}: {
  email:      string
  firstName?: string
  lastName?:  string
}) {
  const [phase,  setPhase]  = useState<Phase>('idle')
  const [errMsg, setErrMsg] = useState<string>('')

  const handleClick = async () => {
    if (phase !== 'idle') return
    setPhase('creating')
    try {
      const res  = await fetch('/api/admin/create-users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ users: [{ email, firstName, lastName }] }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrMsg(data.error ?? `HTTP ${res.status}`)
        setPhase('error')
        return
      }

      const result = data.results?.[0]
      if (result?.ok) {
        setPhase('done')
      } else {
        setErrMsg(result?.error ?? 'Clerk rejected the request')
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
          : phase === 'creating'
          ? 'border-white/10 text-white/30 bg-white/4 cursor-not-allowed'
          : 'border-white/10 text-white/60 bg-white/8 hover:bg-[#5d00f5]/30 hover:text-white'
      }`}
    >
      {phase === 'idle'     && 'Create Account'}
      {phase === 'creating' && 'Creating…'}
      {phase === 'done'     && '✓ Created'}
    </button>
  )
}
