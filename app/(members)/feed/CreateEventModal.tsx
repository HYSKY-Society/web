'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { upload } from '@vercel/blob/client'
import { createMemberEvent, editMemberEvent } from './actions'
import { toDateTimeLocal } from '@/lib/event-time'

interface EditingEvent {
  postId: string
  title: string
  date: string
  timeZone: string | null
  location: string
  link: string
  description: string
  imageUrl: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  editing?: EditingEvent | null
  onSuccess?: () => void
}

export default function CreateEventModal({ isOpen, onClose, editing, onSuccess }: Props) {
  if (!isOpen || typeof document === 'undefined') return null
  return <EventModal key={editing?.postId ?? 'create'} onClose={onClose} editing={editing} onSuccess={onSuccess} />
}

function EventModal({ onClose, editing, onSuccess }: Omit<Props, 'isOpen'>) {
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const [title, setTitle] = useState(editing?.title ?? '')
  const [timeZone, setTimeZone] = useState(editing?.timeZone ?? browserTimeZone)
  const [date, setDate] = useState(editing ? toDateTimeLocal(editing.date, editing.timeZone ?? browserTimeZone) : '')
  const [location, setLocation] = useState(editing?.location ?? '')
  const [link, setLink] = useState(editing?.link ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl ?? '')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  function reset() {
    setTitle('')
    setDate('')
    setTimeZone(browserTimeZone)
    setLocation('')
    setLink('')
    setDescription('')
    setImageUrl('')
    setError(null)
  }

  function handleClose() {
    if (!editing) reset()
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
    if (!imageUrl.trim()) {
      setError('Please upload an event image')
      return
    }
    startTransition(async () => {
      const result = editing
        ? await editMemberEvent(editing.postId, { title, date, timeZone, location, link, description, imageUrl })
        : await createMemberEvent({ title, date, timeZone, location, link, description, imageUrl })
      if ('error' in result) {
        setError(result.error)
        return
      }
      reset()
      onSuccess?.()
      onClose()
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,3,10,.88)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
      onWheel={(e) => {
        if (!scrollAreaRef.current?.contains(e.target as Node)) {
          scrollAreaRef.current?.scrollBy({ top: e.deltaY })
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Edit event' : 'Create an event'}
    >
      <div
        className="relative flex w-full max-w-md max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl p-5"
        style={{ background: '#fff', border: '1px solid #000' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="font-semibold text-base" style={{ color: '#000' }}>{editing ? 'Edit event' : 'Create an event'}</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-sm transition-colors"
            style={{ color: '#666' }}
          >
            Close ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div ref={scrollAreaRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#666' }}>Event title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              required
              placeholder="HySky Chapter Meetup"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: '#fff', border: '1px solid #ccc', color: '#000' }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#666' }}>Event image *</label>
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid #ccc' }}>
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
              <label
                className="flex items-center justify-center h-16 rounded-lg text-xs cursor-pointer transition-colors"
                style={{ background: '#f5f5f5', border: '1px dashed #ccc', color: '#666' }}
              >
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
            <label className="block text-xs mb-1" style={{ color: '#666' }}>Date & time *</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: '#fff', border: '1px solid #ccc', color: '#000', colorScheme: 'light' }}
            />
          </div>

          <div>
            <label htmlFor="event-time-zone" className="block text-xs mb-1" style={{ color: '#666' }}>Time zone *</label>
            <select
              id="event-time-zone"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: '#fff', border: '1px solid #ccc', color: '#000', colorScheme: 'light' }}
            >
              <optgroup label="Common time zones">
                <option value="America/New_York">Eastern Time (New York)</option>
                <option value="America/Chicago">Central Time (Chicago)</option>
                <option value="America/Denver">Mountain Time (Denver)</option>
                <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                <option value="America/Anchorage">Alaska Time (Anchorage)</option>
                <option value="Pacific/Honolulu">Hawaii Time (Honolulu)</option>
                <option value="UTC">UTC</option>
              </optgroup>
              <optgroup label="All time zones">
                {Intl.supportedValuesOf('timeZone').filter((zone) => ![
                  'America/New_York', 'America/Chicago', 'America/Denver',
                  'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu',
                ].includes(zone)).map((zone) => (
                  <option key={zone} value={zone}>{zone.replaceAll('_', ' ')}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#666' }}>Location *</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={140}
              required
              placeholder="Online, or a city like Detroit, MI"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: '#fff', border: '1px solid #ccc', color: '#000' }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#666' }}>Link *</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              placeholder="https://…"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: '#fff', border: '1px solid #ccc', color: '#000' }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#666' }}>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What's happening at this event?"
              className="w-full resize-none rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: '#fff', border: '1px solid #ccc', color: '#000' }}
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#c0392b' }}>{error}</p>}
          </div>

          <div className="mt-3 flex shrink-0 justify-end gap-2 border-t border-[#ddd] pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploadingImage || !title.trim() || !date || !timeZone || !location.trim() || !link.trim() || !imageUrl.trim()}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: '#fff', border: '1px solid #000', color: '#000' }}
            >
              {editing ? (isPending ? 'Saving…' : 'Save changes') : (isPending ? 'Creating…' : 'Create event')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
