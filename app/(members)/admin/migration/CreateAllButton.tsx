'use client'

import { useState } from 'react'

type UserInput = { email: string; firstName?: string; lastName?: string }

const CHUNK = 20

export default function CreateAllButton({ users }: { users: UserInput[] }) {
  const [phase,      setPhase]      = useState<'idle' | 'running' | 'done'>('idle')
  const [progress,   setProgress]   = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const total = users.length

  if (total === 0) return null

  const handleClick = async () => {
    if (phase !== 'idle') return
    setPhase('running')
    setProgress(0)
    setErrorCount(0)

    let errs = 0
    for (let i = 0; i < users.length; i += CHUNK) {
      const chunk = users.slice(i, i + CHUNK)
      try {
        const res  = await fetch('/api/admin/create-users', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ users: chunk }),
        })
        const data = await res.json()
        errs += data.errors ?? 0
      } catch {
        errs += chunk.length
      }
      setProgress(Math.min(i + CHUNK, users.length))
      setErrorCount(errs)
      if (i + CHUNK < users.length) await new Promise(r => setTimeout(r, 200))
    }

    setPhase('done')
  }

  const succeeded = progress - errorCount

  return (
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={handleClick}
        disabled={phase !== 'idle'}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#5d00f5] hover:bg-[#7b33ff] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        style={{ color: '#fff' }}
      >
        {phase === 'idle'    && `Create All Accounts (${total})`}
        {phase === 'running' && `Creating… ${progress} / ${total}`}
        {phase === 'done'    && `✓ Done — ${succeeded} created${errorCount > 0 ? `, ${errorCount} errors` : ''}`}
      </button>

      {phase === 'idle' && (
        <p className="text-white/30 text-xs">
          Creates passwordless Clerk accounts. Members sign in via magic link or use &quot;Forgot Password&quot; to set one.
        </p>
      )}
      {phase === 'running' && (
        <div className="flex-1 max-w-xs bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-[#5d00f5] transition-all duration-300 rounded-full"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
