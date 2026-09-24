'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from './actions'
import { upload } from '@vercel/blob/client'

export type MentionMember = {
  id: string
  name: string
  avatarUrl: string | null
  headline: string | null
}

interface Props {
  avatarUrl?: string | null
  displayName?: string | null
  mentionMembers: MentionMember[]
}

type Attachment = { url: string; name: string; type: string }

function fileIcon(type: string) {
  if (type === 'application/pdf') return '📄'
  if (type.includes('word')) return '📝'
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊'
  if (type.includes('sheet') || type.includes('excel') || type === 'text/csv') return '📋'
  return '📎'
}

export default function FeedComposer({ avatarUrl, displayName, mentionMembers }: Props) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)   // remount file input after each pick
  const [attachKey, setAttachKey] = useState(0) // remount attachment input
  const [mentionedIds, setMentionedIds] = useState<string[]>([])
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [activeMention, setActiveMention] = useState(0)
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

  // ── Member tagging ────────────────────────────────────────────────────────
  const mentionMatches = mentionQuery === null
    ? []
    : mentionMembers
        .filter((member) => member.name.toLowerCase().includes(mentionQuery.toLowerCase()))
        .slice(0, 8)

  function updateMentionSearch(value: string, cursor: number) {
    const beforeCursor = value.slice(0, cursor)
    const match = beforeCursor.match(/(?:^|\s)@([^@\n]{0,40})$/)
    if (!match) {
      setMentionQuery(null)
      setMentionStart(null)
      return
    }
    setMentionQuery(match[1])
    setMentionStart(cursor - match[1].length - 1)
    setActiveMention(0)
  }

  function selectMention(member: MentionMember) {
    const ta = textareaRef.current
    if (!ta || mentionStart === null) return
    const cursor = ta.selectionStart
    const insertion = `@${member.name} `
    const next = content.slice(0, mentionStart) + insertion + content.slice(cursor)
    setContent(next)
    setMentionedIds((current) => current.includes(member.id) ? current : [...current, member.id])
    setMentionQuery(null)
    setMentionStart(null)
    setTimeout(() => {
      const nextCursor = mentionStart + insertion.length
      ta.focus()
      ta.setSelectionRange(nextCursor, nextCursor)
    }, 0)
  }

  function handleComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery === null || mentionMatches.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveMention((current) => (current + 1) % mentionMatches.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveMention((current) => (current - 1 + mentionMatches.length) % mentionMatches.length)
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      selectMention(mentionMatches[activeMention] ?? mentionMatches[0])
    } else if (event.key === 'Escape') {
      setMentionQuery(null)
      setMentionStart(null)
    }
  }

  function startMention() {
    const ta = textareaRef.current
    if (!ta) return
    const cursor = ta.selectionStart
    const prefix = cursor > 0 && !/\s/.test(content[cursor - 1]) ? ' @' : '@'
    const next = content.slice(0, cursor) + prefix + content.slice(cursor)
    setContent(next)
    const nextCursor = cursor + prefix.length
    setMentionQuery('')
    setMentionStart(nextCursor - 1)
    setActiveMention(0)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(nextCursor, nextCursor)
    }, 0)
  }

  // ── Image upload ──────────────────────────────────────────────────────────
  // Uploaded directly from the browser to Blob storage (bypasses the ~4.5MB
  // serverless function body limit, which caused 413s on real files).
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setInputKey((k) => k + 1)
    if (!files.length) return
    const slots = 4 - images.length
    if (!slots) return
    setUploadError(null)
    setUploading(true)
    try {
      for (const file of files.slice(0, slots)) {
        try {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80)
          const blob = await upload(`feed/${Date.now()}_${safeName}`, file, {
            access: 'public',
            handleUploadUrl: '/api/feed/upload',
            clientPayload: JSON.stringify({ kind: 'image' }),
          })
          setImages((prev) => [...prev, blob.url])
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : 'Upload failed')
        }
      }
    } catch {
      setUploadError('Upload failed — check your connection')
    } finally {
      setUploading(false)
    }
  }

  // ── File attachment upload ────────────────────────────────────────────────
  // Uploaded directly from the browser to Blob storage (bypasses the ~4.5MB
  // serverless function body limit, which caused 413s on real files).
  const handleAttachmentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setAttachKey((k) => k + 1)
    if (!files.length) return
    const slots = 5 - attachments.length
    if (!slots) return
    setUploadError(null)
    setUploading(true)
    try {
      for (const file of files.slice(0, slots)) {
        try {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80)
          const blob = await upload(`feed/${Date.now()}_${safeName}`, file, {
            access: 'public',
            handleUploadUrl: '/api/feed/upload',
            clientPayload: JSON.stringify({ kind: 'file' }),
          })
          setAttachments((prev) => [...prev, { url: blob.url, name: file.name, type: file.type || blob.contentType }])
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : 'Upload failed')
        }
      }
    } catch {
      setUploadError('Upload failed — check your connection')
    } finally {
      setUploading(false)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  function action(formData: FormData) {
    startTransition(async () => {
      await createPost(formData)
      setContent('')
      setImages([])
      setAttachments([])
      setMentionedIds([])
      setMentionQuery(null)
      setMentionStart(null)
      setUploadError(null)
      router.refresh()
    })
  }

  const canSubmit = (content.trim() || images.length > 0 || attachments.length > 0) && !uploading && !isPending && content.length <= MAX

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
          {/* Hidden inputs — React keeps values in sync with state */}
          <input type="hidden" name="imageUrls" value={JSON.stringify(images)} />
          <input type="hidden" name="mentionUserIds" value={JSON.stringify(mentionedIds)} />
          <input type="hidden" name="attachmentUrls" value={JSON.stringify(attachments)} />

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

            <button
              type="button"
              title="Tag a member (@)"
              onClick={startMention}
              className="w-7 h-7 flex items-center justify-center rounded text-xs font-bold text-white/40 hover:text-white hover:bg-white/8 transition-colors"
              aria-label="Tag a member"
            >
              @
            </button>

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

            {/* File attachment picker */}
            <label
              title={attachments.length >= 5 ? 'Max 5 files' : 'Attach file (PDF, Word, Excel, etc.)'}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                attachments.length >= 5
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/40 hover:text-white hover:bg-white/8'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              <input
                key={attachKey}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt"
                multiple
                disabled={attachments.length >= 5}
                className="hidden"
                onChange={handleAttachmentSelect}
              />
            </label>

            {uploading && (
              <span className="ml-2 text-xs text-white/35 animate-pulse">Uploading…</span>
            )}
            {uploadError && (
              <span className="ml-2 text-xs text-red-400">{uploadError}</span>
            )}
          </div>

          {/* Textarea + member tagging */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              name="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                updateMentionSearch(e.target.value, e.target.selectionStart)
              }}
              onClick={(e) => updateMentionSearch(e.currentTarget.value, e.currentTarget.selectionStart)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Share something with the HySky community… Type @ to tag a member."
              maxLength={MAX}
              rows={3}
              className="w-full resize-none rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
              style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
              aria-autocomplete="list"
              aria-expanded={mentionQuery !== null && mentionMatches.length > 0}
              aria-controls="feed-mention-list"
            />
            {mentionQuery !== null && mentionMatches.length > 0 && (
              <div
                id="feed-mention-list"
                role="listbox"
                className="absolute z-30 left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded-xl p-1 shadow-2xl"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)' }}
              >
                {mentionMatches.map((member, index) => (
                  <button
                    key={member.id}
                    type="button"
                    role="option"
                    aria-selected={index === activeMention}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      selectMention(member)
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      index === activeMention ? 'bg-[#5d00f5]/20' : 'hover:bg-white/6'
                    }`}
                  >
                    <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-[#5d00f5]/25 flex items-center justify-center">
                      {member.avatarUrl
                        ? <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-[#9b6dff]">{member.name[0].toUpperCase()}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                      {member.headline && <p className="text-xs text-white/45 truncate">{member.headline}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

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

          {/* File attachment list */}
          {attachments.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {attachments.map((att, i) => (
                <div
                  key={att.url}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
                >
                  <span className="text-base leading-none shrink-0">{fileIcon(att.type)}</span>
                  <span className="flex-1 text-white/80 truncate min-w-0">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                    aria-label={`Remove ${att.name}`}
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
