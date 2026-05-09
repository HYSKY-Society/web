'use client'

import { useState } from 'react'

export default function FetchTitleButton({ onTitle }: { onTitle: (title: string, date: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handle() {
    const urlInput = document.querySelector<HTMLInputElement>('input[name="youtubeUrl"]')
    const url = urlInput?.value?.trim()
    if (!url) { setError('Enter a YouTube URL first'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`)
      const data = await res.json() as { title?: string; error?: string }
      if (data.title) {
        onTitle(data.title, '')
      } else {
        setError(data.error ?? 'Could not fetch title')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handle}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        style={{ background: 'rgba(19,220,232,.15)', color: '#13dce8', border: '1px solid rgba(19,220,232,.25)' }}
      >
        {loading ? 'Fetching…' : '↓ Auto-fill title'}
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}
