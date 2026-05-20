'use client'

import { useState } from 'react'

const CHUNK = 40   // emails per API call

export default function InviteAllButton({ emails }: { emails: string[] }) {
  const [phase, setPhase]       = useState<'idle' | 'sending' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const total = emails.length

  if (total === 0) return null

  const handleClick = async () => {
    if (phase !== 'idle') return
    setPhase('sending')
    setProgress(0)

    for (let i = 0; i < emails.length; i += CHUNK) {
      const chunk = emails.slice(i, i + CHUNK)
      try {
        await fetch('/api/admin/invite-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: chunk }),
        })
      } catch { /* network error — keep going */ }
      setProgress(Math.min(i + CHUNK, emails.length))
      // small delay between chunks to stay under Clerk rate limits
      if (i + CHUNK < emails.length) await new Promise(r => setTimeout(r, 300))
    }

    setPhase('done')
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={handleClick}
        disabled={phase !== 'idle'}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#5d00f5] hover:bg-[#7b33ff] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        style={{ color: '#fff' }}
      >
        {phase === 'idle'    && `Invite All Pending (${total})`}
        {phase === 'sending' && `Sending… ${progress} / ${total}`}
        {phase === 'done'    && `✓ Done — ${total} invitations sent`}
      </button>
      {phase === 'idle' && (
        <p className="text-white/30 text-xs">
          Sends a Clerk sign-up email to every member that hasn&apos;t been invited yet.
        </p>
      )}
      {phase === 'sending' && (
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
