'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AutomationControls() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [topic, setTopic] = useState('')
  const router = useRouter()
  async function runNow() {
    setRunning(true)
    setMessage('Researching and checking sources. This may take a few minutes…')
    try {
      const response = await fetch('/api/admin/news-automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const data = await response.json()
      if (!response.ok) {
        const details = data.details
        const detailMessage = typeof details === 'string'
          ? details
          : [details?.error, details?.message]
              .filter((value) => typeof value === 'string' && value)
              .join(': ')
        throw new Error([data.error || 'The run failed.', detailMessage].filter(Boolean).join(' '))
      }
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
      <label className="mt-4 block text-xs font-medium text-white/55">
        Optional article topic or link
        <textarea
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          rows={3}
          placeholder="Example: All companies with noteworthy 2026 press releases actively developing or researching hydrogen-powered aircraft — or paste a specific article URL"
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#7C3AFF] focus:outline-none"
        />
      </label>
      <p className="mt-2 text-xs text-white/35">Leave blank for the normal daily news scan. Enter a topic for a broader editor-directed research draft, or paste a link to draft from one specific article.</p>
      {message && <p className="mt-3 text-sm text-white/65" aria-live="polite">{message}</p>}
    </section>
  )
}
