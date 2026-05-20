'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from './actions'

interface Props {
  avatarUrl?: string | null
  displayName?: string | null
}

export default function FeedComposer({ avatarUrl, displayName }: Props) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)   // remount file input after each pick
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const MAX = 3000

  // ── Formatting ────────────────────────────────────────────────────────────
  function applyFormat(marker: string) {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    const selected = content.slice(s, e)
    const next = content.slice(0, s) + marker + selected + marker + content.slice(e)
    setContent(next)
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = s + marker.length
      ta.selectionEnd   = e + marker.length
    }, 0)
  }

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    // Remount the input so the same file can be picked again next time
    setInputKey((k) => k + 1)
    if (!files.length) return
    const slots = 4 - images.length
    if (!slots) return
    setUploadError(null)
    setUploading(true)
    try {
      for (const file of files.slice(0, slots)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/feed/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const { url } = await res.json()
          setImages((prev) => [...prev, url])
        } else {
          const body = await res.json().catch(() => ({}))
          setUploadError(body.error ?? `Upload failed (${res.status})`)
        }
      }
    } catch {
      setUploadError('Upload failed — check your connection')
    } finally {
      setUploading(false)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  // imageUrls come via the hidden <input> element below — React keeps it in sync
  function action(formData: FormData) {
    startTransition(async () => {
      await createPost(formData)
      setContent('')
      setImages([])
      setUploadError(null)
      router.refresh()
    })
  }

  const canSubmit = (content.trim() || images.length > 0) && !uploading && !isPending && content.length <= MAX

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#5d00f5]/30 flex items-center justify-center mt-0.5">
          {avatarUrl
            ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            : <span className="text-sm font-bold text-[#9b6dff]">{(displayName ?? '?')[0].toUpperCase()}</span>
          }
        </div>

        <form action={action} className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Hidden input — React keeps value in sync with images state */}
          <input type="hidden" name="imageUrls" value={JSON.stringify(images)} />

          {/* Formatting toolbar */}
          <div className="flex items-center gap-0.5">
            {([
              { label: 'B', title: 'Bold (**)',      marker: '**', cls: 'font-bold' },
              { label: 'I', title: 'Italic (*)',     marker: '*',  cls: 'italic' },
              { label: 'U', title: 'Underline (__)', marker: '__', cls: 'underline' },
            ] as const).map(({ label, title, marker, cls }) => (
              <button
                key={label}
                type="button"
                title={title}
                onClick={() => applyFormat(marker)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs text-white/40 hover:text-white hover:bg-white/8 transition-colors ${cls}`}
              >
                {label}
              </button>
            ))}

            <div className="w-px h-4 mx-1" style={{ background: 'var(--border-muted)' }} />

            {/* Image picker */}
            <label
              title={images.length >= 4 ? 'Max 4 images' : 'Add image'}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                images.length >= 4
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/40 hover:text-white hover:bg-white/8'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <input
                key={inputKey}
                type="file"
                accept="image/*"
                multiple
                disabled={images.length >= 4}
                className="hidden"
                onChange={handleImageSelect}
              />
            </label>

            {uploading && (
              <span className="ml-2 text-xs text-white/35 animate-pulse">Uploading…</span>
            )}
            {uploadError && (
              <span className="ml-2 text-xs text-red-400">{uploadError}</span>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with the HYSKY community… Tip: **bold**, *italic*, __underline__"
            maxLength={MAX}
            rows={3}
            className="w-full resize-none rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
            style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
          />

          {/* Image previews */}
          {images.length > 0 && (
            <div className={`grid gap-1.5 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {images.map((url, i) => (
                <div key={url} className="relative rounded-xl overflow-hidden aspect-video bg-black/20">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'rgba(0,0,0,.55)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className={`text-xs ${content.length > MAX * 0.9 ? 'text-amber-400' : 'text-white/25'}`}>
              {content.length}/{MAX}
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-[#5d00f5] hover:bg-[#7b33ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ color: '#fff' }}
            >
              {isPending ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
