'use client'

import { useState } from 'react'
import { addPressPost } from './actions'

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().substring(0, 80)
}

export default function AddPostForm() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('HYSKY News')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().substring(0, 10))
  const [readTime, setReadTime] = useState('')
  const [publishNow, setPublishNow] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await addPressPost({
        slug: slugify(title),
        title: title.trim(),
        author: author.trim() || 'HYSKY News',
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        coverImageUrl: coverImageUrl.trim() || null,
        publishedAt,
        readTimeMinutes: readTime ? parseInt(readTime) : null,
        isPublished: publishNow,
      })
      setTitle(''); setExcerpt(''); setContent(''); setCoverImageUrl(''); setReadTime('')
      setSuccess(publishNow ? 'Article published.' : 'Draft saved.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save article')
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5D00F5]'

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
      <div>
        <h3 className="font-bold text-white text-lg">Write an article</h3>
        <p className="text-white/35 text-xs mt-1">Use ## for section headings, ### for subheadings, - for lists, and [label](https://url) for links.</p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-emerald-400 text-sm">{success}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/45 mb-1.5">Headline *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required className={fieldClass} placeholder="Article headline" />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1.5">Byline</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} className={fieldClass} placeholder="HYSKY News" />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1.5">Publication date *</label>
          <input type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} required className={fieldClass} />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1.5">Read time (minutes)</label>
          <input type="number" value={readTime} onChange={e => setReadTime(e.target.value)} min="1" className={fieldClass} placeholder="e.g. 6" />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1.5">Cover image URL</label>
          <input type="url" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} className={fieldClass} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/45 mb-1.5">Deck / summary</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} className={fieldClass + ' resize-none'} placeholder="One or two sentences shown on the News page..." />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/45 mb-1.5">Article *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={18} required className={fieldClass + ' resize-y font-mono leading-6'} placeholder={'Opening paragraph...\n\n## Section heading\n\nMore reporting...'} />
        </div>
      </div>
      <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
        <input type="checkbox" checked={publishNow} onChange={e => setPublishNow(e.target.checked)} className="accent-[#5D00F5] w-4 h-4" />
        Publish immediately (uncheck to save as a draft)
      </label>
      <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: '#5D00F5' }}>
        {loading ? 'Saving…' : publishNow ? 'Publish article' : 'Save draft'}
      </button>
    </form>
  )
}
