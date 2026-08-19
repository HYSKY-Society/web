'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CompanyChoice = {
  id: string
  name: string
  website: string
}

type CompanyHeadline = {
  title: string
  source_url: string
  published_at: string
}

type AutomationRequest = {
  action: string
  topic?: string
  company_id?: string
  excluded_company_ids?: string[]
}

export default function AutomationControls() {
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [topic, setTopic] = useState('')
  const [company, setCompany] = useState<CompanyChoice | null>(null)
  const [headlines, setHeadlines] = useState<CompanyHeadline[]>([])
  const [skippedCompanyIds, setSkippedCompanyIds] = useState<string[]>([])
  const router = useRouter()

  async function callAutomation(body: AutomationRequest) {
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
    if (topic.trim()) {
      setRunning(true)
      setCompany(null)
      setHeadlines([])
      setMessage('Researching and checking sources. This may take a few minutes…')
      try {
        const data = await callAutomation({ action: 'run', topic })
        setMessage(data.message || (data.status === 'draft_created' ? 'Draft created for review.' : `Run finished: ${data.status}`))
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'The run failed.')
      } finally {
        setRunning(false)
      }
      return
    }
    await pickCompany([])
  }

  async function pickCompany(excludedIds: string[]) {
    setRunning(true)
    setCompany(null)
    setHeadlines([])
    setMessage('Picking a random eligible company from Zoho…')
    try {
      const data = await callAutomation({
        action: 'company_pick',
        excluded_company_ids: excludedIds,
      })
      setCompany(data.company ?? null)
      setSkippedCompanyIds(excludedIds)
      setMessage(data.message || 'Would you like to check this company for news?')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not pick a company.')
    } finally {
      setRunning(false)
    }
  }

  async function skipCompany() {
    if (!company) return
    await pickCompany([...skippedCompanyIds, company.id])
  }

  async function findHeadlines() {
    if (!company) return
    setRunning(true)
    setHeadlines([])
    setMessage(`Searching ${company.name}’s website for dated news…`)
    try {
      const data = await callAutomation({ action: 'company_headlines', company_id: company.id })
      setHeadlines(Array.isArray(data.headlines) ? data.headlines : [])
      setMessage(data.message || 'Website search finished.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The website search failed.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-white/[.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">HySky News automation</h2>
          <p className="mt-1 text-xs text-white/45">Choose the company first. Nothing in this step creates or publishes an article.</p>
        </div>
        <button onClick={runNow} disabled={running} className="rounded-lg bg-[#5D00F5] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          {running ? 'Working…' : topic.trim() ? 'Research this topic' : 'Pick a random company'}
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
      <p className="mt-2 text-xs text-white/35">Leave this blank for the step-by-step company workflow. A topic or pasted link still runs as a separate editor-directed assignment.</p>

      {company && (
        <div className="mt-5 rounded-xl border border-[#7C3AFF]/35 bg-[#5D00F5]/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9A6BFF]">Random Zoho company</p>
          <h3 className="mt-1 text-lg font-bold">{company.name}</h3>
          <a href={company.website} target="_blank" rel="noreferrer" className="mt-1 inline-block break-all text-xs text-[#9A6BFF] hover:underline">
            {company.website}
          </a>
          <p className="mt-4 text-sm">Search this company’s own website for its latest news?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={findHeadlines} disabled={running} className="rounded-lg bg-[#5D00F5] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
              Yes
            </button>
            <button onClick={skipCompany} disabled={running} className="rounded-lg border border-white/15 bg-white/5 px-5 py-2 text-sm font-bold hover:bg-white/10 disabled:opacity-50">
              Skip
            </button>
          </div>
        </div>
      )}

      {headlines.length > 0 && (
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-bold">Latest headlines from {company?.name}</h3>
          {headlines.map((headline) => (
            <a
              key={headline.source_url}
              href={headline.source_url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-white/10 bg-black/15 p-4 transition-colors hover:border-[#7C3AFF]/50"
            >
              <p className="font-semibold">{headline.title}</p>
              <p className="mt-1 text-xs text-white/50">{new Date(headline.published_at).toLocaleDateString()}</p>
            </a>
          ))}
        </div>
      )}

      {message && <p className="mt-3 text-sm text-white/65" aria-live="polite">{message}</p>}
    </section>
  )
}

