'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AutomationControls() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  async function runNow() {
    setRunning(true)
    setMessage('Researching and checking sources. This may take a few minutes…')
    try {
      const response = await fetch('/api/admin/news-automation/run', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The run failed.')
      setMessage(data.message || (data.status === 'draft_created' ? 'Draft created for review.' : `Run finished: ${data.status}`))
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The run failed.')
    } finally { setRunning(false) }
  }
  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-white/[.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">HySky News automation</h2>
          <p className="mt-1 text-xs text-white/45">Scheduled daily at 8:00 AM Central during daylight time. New articles arrive as drafts.</p>
        </div>
        <button onClick={runNow} disabled={running} className="rounded-lg bg-[#5D00F5] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          {running ? 'Running…' : 'Run news discovery now'}
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-white/65" aria-live="polite">{message}</p>}
    </section>
  )
}
