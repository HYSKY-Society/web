'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type StoryChoice = {
  source_name: string
  source_url: string
  title: string
  published_at: string
  primary_source: boolean
}

export default function AutomationControls() {
  const [running, setRunning] = useState(false)
  const [draftingUrl, setDraftingUrl] = useState('')
  const [message, setMessage] = useState('')
  const [topic, setTopic] = useState('')
  const [candidates, setCandidates] = useState<StoryChoice[]>([])
  const router = useRouter()

  async function callAutomation(body: Record<string, string>) {
    const response = await fetch('/api/admin/news-automation/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return data
  }

  async function runNow() {
    setRunning(true)
    setCandidates([])
    setMessage(
      topic.trim()
        ? 'Researching and checking sources. This may take a few minutes…'
        : 'Checking Zoho companies for story choices. Nothing will be drafted yet…'
    )
    try {
      const data = await callAutomation(
        topic.trim() ? { action: 'run', topic } : { action: 'discover' }
      )
      if (Array.isArray(data.candidates)) {
        setCandidates(data.candidates)
        setMessage(data.message || 'Choose a company story to draft.')
      } else {
        setMessage(data.message || (data.status === 'draft_created' ? 'Draft created for review.' : `Run finished: ${data.status}`))
        router.refresh()
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The run failed.')
    } finally {
      setRunning(false)
    }
  }

  async function createDraft(sourceUrl: string) {
    setDraftingUrl(sourceUrl)
    setMessage('Researching your selected story and creating an unpublished draft…')
    try {
      const data = await callAutomation({ action: 'draft', source_url: sourceUrl })
      setMessage(data.message || 'Draft created for review.')
      setCandidates(current => current.filter(candidate => candidate.source_url !== sourceUrl))
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The draft failed.')
    } finally {
      setDraftingUrl('')
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-white/[.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">HySky News automation</h2>
          <p className="mt-1 text-xs text-white/45">Scheduled daily at 8:00 AM Central during daylight time. New articles arrive as drafts.</p>
        </div>
        <button onClick={runNow} disabled={running || Boolean(draftingUrl)} className="rounded-lg bg-[#5D00F5] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          {running ? 'Searching…' : topic.trim() ? 'Research this topic' : 'Find company news'}
        </button>
      </div>
      <label className="mt-4 block text-xs font-medium text-white/55">
        Optional article topic or link
        <textarea
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          rows={3}
          placeholder="Enter an article assignment or paste a specific article URL"
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#7C3AFF] focus:outline-none"
        />
      </label>
      <p className="mt-2 text-xs text-white/35">Leave blank to find company-news choices. Nothing is drafted until you choose a result. A topic or pasted link is already your editorial choice and runs directly.</p>

      {candidates.length > 0 && (
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-bold">Choose a story</h3>
          {candidates.map(candidate => (
            <div key={candidate.source_url} className="rounded-xl border border-white/10 bg-black/15 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{candidate.title}</p>
                  <p className="mt-1 text-xs text-white/50">
                    {candidate.source_name} · {new Date(candidate.published_at).toLocaleDateString()}
                    {candidate.primary_source ? ' · Company source' : ''}
                  </p>
                  <a href={candidate.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all text-xs text-[#9A6BFF] hover:underline">
                    View source
                  </a>
                </div>
                <button
                  onClick={() => createDraft(candidate.source_url)}
                  disabled={Boolean(draftingUrl)}
                  className="rounded-lg bg-[#5D00F5] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {draftingUrl === candidate.source_url ? 'Creating…' : 'Create draft'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {message && <p className="mt-3 text-sm text-white/65" aria-live="polite">{message}</p>}
    </section>
  )
}
