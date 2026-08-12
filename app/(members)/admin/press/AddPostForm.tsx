'use client'

import { useState } from 'react'
import { addPressPost } from './actions'

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().substring(0, 80)
}

export default function AddPostForm() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('HySky News')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [keywords, setKeywords] = useState('hydrogen aviation, sustainable aviation, HySky News')
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
        author: author.trim() || 'HySky News',
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        coverImageUrl: coverImageUrl.trim() || null,
        imageAltText: imageAltText.trim() || null,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || excerpt.trim() || null,
        keywords: keywords.trim() || null,
        publishedAt,
        readTimeMinutes: readTime ? parseInt(readTime) : null,
        isPublished: publishNow,
      })
      setTitle(''); setExcerpt(''); setContent(''); setCoverImageUrl(''); setImageAltText(''); setSeoTitle(''); setSeoDescription(''); setReadTime('')
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
        <p className="text-white/35 text-xs mt-1">Formatting: ## section heading · ### subheading · - list item · [label](https://url) link.</p>
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
          <input value={author} onChange={e => setAuthor(e.target.value)} className={fieldClass} placeholder="HySky News" />
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
          <label className="block text-xs text-white/45 mb-1.5">Cover image path or URL *</label>
          <input value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} className={fieldClass} placeholder="/article-image.webp or https://..." />
        </div>
        <div>
          <label className="block text-xs text-white/45 mb-1.5">Image alt text *</label>
          <input value={imageAltText} onChange={e => setImageAltText(e.target.value)} className={fieldClass} placeholder="Describe what is visible, without keyword stuffing" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/45 mb-1.5">Deck / summary</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} className={fieldClass + ' resize-none'} placeholder="One or two sentences shown on the News page..." />
        </div>
        <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4 rounded-xl p-4 border border-white/10 bg-black/10">
          <div>
            <label className="block text-xs text-white/45 mb-1.5">SEO title</label>
            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className={fieldClass} placeholder="Defaults to headline" />
          </div>
          <div>
            <label className="block text-xs text-white/45 mb-1.5">Focus keywords (comma-separated) *</label>
            <input value={keywords} onChange={e => setKeywords(e.target.value)} className={fieldClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-white/45 mb-1.5">SEO description *</label>
            <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} className={fieldClass + ' resize-none'} placeholder="A clear 140–160 character summary for search results" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/45 mb-1.5">Article *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={18} required className={fieldClass + ' resize-y font-mono leading-6'} placeholder={'Opening paragraph...\n\n## Section heading\n\nMore reporting...'} />
        </div>
      </div>
      <div className="rounded-xl border border-white/10 p-4 text-xs text-white/55 space-y-1.5">
        <p className="font-bold text-white/80">SEO publishing checks</p>
        <p>• Use a focus keyword naturally in the headline or at least one ## heading.</p>
        <p>• Include an original/approved image with descriptive alt text.</p>
        <p>• Include at least two useful internal or authoritative links with descriptive labels.</p>
        <p>• “HySky” casing is standardized automatically.</p>
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
