'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [content, setContent]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/forum/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (res.ok) {
        setContent('')
        router.refresh()
      } else {
        const { error: e } = await res.json()
        setError(e ?? 'Failed to post reply')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a reply…"
        rows={4}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#5d00f5]/60 transition-colors resize-none"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!content.trim() || submitting}
        className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-[#5d00f5] hover:bg-[#4a00d4] disabled:opacity-40 transition-colors"
      >
        {submitting ? 'Posting…' : 'Post Reply'}
      </button>
    </form>
  )
}
