'use client'

import { useState } from 'react'
import { addPressPost } from './actions'

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().substring(0, 80)
}

export default function AddPostForm() {
  const [title, setTitle]             = useState('')
  const [author, setAuthor]           = useState('HYSKY Society')
  const [excerpt, setExcerpt]         = useState('')
  const [content, setContent]         = useState('')
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().substring(0, 10))
  const [readTime, setReadTime]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      await addPressPost({
        slug: slugify(title),
        title: title.trim(),
        author: author.trim() || 'HYSKY Society',
        excerpt: excerpt.trim() || null,
        content: content.trim() || null,
        publishedAt,
        readTimeMinutes: readTime ? parseInt(readTime) : null,
      })
      setTitle(''); setExcerpt(''); setContent(''); setReadTime('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
      <h3 className="font-bold text-white text-lg">Add Press Post</h3>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/40 mb-1">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5]"
            placeholder="Post title" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Author</label>
          <input value={author} onChange={e => setAuthor(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5]"
            placeholder="HYSKY Society" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Published Date *</label>
          <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5d00f5]" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Read Time (minutes)</label>
          <input type="number" value={readTime} onChange={e => setReadTime(e.target.value)} min="1"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5]"
            placeholder="e.g. 3" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/40 mb-1">Excerpt</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5] resize-none"
            placeholder="Short preview shown in the post list..." />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/40 mb-1">Full Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5] resize-none"
            placeholder="Full article (blank lines = paragraph breaks)..." />
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
        style={{ background: '#5d00f5' }}>
        {loading ? 'Adding…' : 'Add Post'}
      </button>
    </form>
  )
}
