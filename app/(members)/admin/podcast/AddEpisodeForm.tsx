'use client'

import { useState } from 'react'

export default function AddEpisodeForm({ createEpisode, nextEpNum, today }: {
  createEpisode: (formData: FormData) => Promise<void>
  nextEpNum: number
  today: string
}) {
  const [title, setTitle]   = useState('')
  const [url, setUrl]       = useState('')
  const [fetching, setFetch] = useState(false)
  const [fetchErr, setErr]  = useState('')

  async function autoFill() {
    if (!url.trim()) { setErr('Enter a YouTube URL first'); return }
    setFetch(true); setErr('')
    try {
      const res  = await fetch(`/api/oembed?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json() as { title?: string; error?: string }
      if (data.title) { setTitle(data.title); setErr('') }
      else setErr(data.error ?? 'Could not fetch title')
    } catch { setErr('Network error') }
    finally { setFetch(false) }
  }

  return (
    <form action={createEpisode} className="grid gap-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          name="title"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Episode title *"
          className="sm:col-span-2 bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
        />
        <input
          name="episodeNumber"
          type="number"
          min="1"
          defaultValue={nextEpNum || ''}
          placeholder="Ep. #"
          className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <input
            name="youtubeUrl"
            type="url"
            required
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="YouTube URL *"
            className="flex-1 bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25"
          />
          <button
            type="button"
            onClick={autoFill}
            disabled={fetching}
            className="shrink-0 text-xs px-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{ background: 'rgba(19,220,232,.15)', color: '#13dce8', border: '1px solid rgba(19,220,232,.25)' }}
          >
            {fetching ? '…' : '↓ Fill'}
          </button>
        </div>
        <input
          name="publishedAt"
          type="date"
          defaultValue={today}
          required
          className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60"
        />
      </div>
      {fetchErr && <p className="text-red-400 text-xs">{fetchErr}</p>}
      <textarea
        name="description"
        placeholder="Episode description (optional)"
        rows={2}
        className="bg-white/8 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#5d00f5]/60 placeholder-white/25 resize-none"
      />
      <button
        type="submit"
        className="self-start text-sm px-5 py-2 rounded-lg font-semibold text-white transition-colors"
        style={{ background: '#5d00f5' }}
      >
        Add Episode
      </button>
    </form>
  )
}
