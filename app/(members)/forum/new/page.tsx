'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = [
  { key: 'general',   label: 'General',           icon: '💬' },
  { key: 'policy',    label: 'Policy & Advocacy', icon: '🏛️' },
  { key: 'technical', label: 'Technical',         icon: '⚗️' },
  { key: 'events',    label: 'Events',            icon: '✈️' },
]

export default function NewThreadPage() {
  const router = useRouter()
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category }),
      })
      if (res.ok) {
        const thread = await res.json()
        router.push(`/forum/${thread.id}`)
      } else {
        const { error: e } = await res.json()
        setError(e ?? 'Failed to create thread')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="text-white max-w-2xl">
      <Link href="/forum" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
        ← Back to Forum
      </Link>

      <h1 className="text-2xl font-bold mb-6">New Thread</h1>

      <form onSubmit={submit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  category === c.key
                    ? 'bg-[#5d00f5]/30 border-[#5d00f5]/60 text-[#c4a0ff]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What do you want to discuss?"
            maxLength={200}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#5d00f5]/60 transition-colors"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your thoughts, questions, or insights…"
            rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#5d00f5]/60 transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!title.trim() || !content.trim() || submitting}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-[#5d00f5] hover:bg-[#4a00d4] disabled:opacity-40 transition-colors"
        >
          {submitting ? 'Posting…' : 'Post Thread'}
        </button>
      </form>
    </div>
  )
}
