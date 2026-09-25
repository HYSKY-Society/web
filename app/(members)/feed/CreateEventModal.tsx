'use client'
import { useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { upload } from '@vercel/blob/client'
import { createMemberEvent } from './actions'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CreateEventModal({ isOpen, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const imageInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || typeof document === 'undefined') return null

  function reset() {
    setTitle('')
    setDate('')
    setLink('')
    setDescription('')
    setImageUrl('')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (!file) return
    setError(null)
    setUploadingImage(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80)
      const blob = await upload(`events/${Date.now()}_${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/feed/upload',
        clientPayload: JSON.stringify({ kind: 'image' }),
      })
      setImageUrl(blob.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createMemberEvent({ title, date, link, description, imageUrl })
      if ('error' in result) {
        setError(result.error)
        return
      }
      reset()
      onClose()
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,3,10,.88)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create an event"
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-5"
        style={{ background: '#09090f', border: '1px solid rgba(255,255,255,.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-base">Create an event</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Close ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-white/50 mb-1">Event title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              required
              placeholder="HySky Chapter Meetup"
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Event image (optional)</label>
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-muted)' }}>
                <img src={imageUrl} alt="" className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center h-16 rounded-lg text-xs text-white/40 hover:text-white/60 cursor-pointer transition-colors" style={{ background: 'var(--surface-subtle)', border: '1px dashed var(--border-muted)' }}>
                {uploadingImage ? 'Uploading…' : 'Click to upload an image'}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Date & time *</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)', colorScheme: 'dark' }}
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Link (optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What's happening at this event?"
              className="w-full resize-none rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploadingImage || !title.trim() || !date}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-[#5d00f5] hover:bg-[#7b33ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ color: '#fff' }}
            >
              {isPending ? 'Creating…' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
