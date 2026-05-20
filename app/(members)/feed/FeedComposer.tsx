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
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const MAX = 3000

  function action(formData: FormData) {
    startTransition(async () => {
      await createPost(formData)
      setContent('')
      formRef.current?.reset()
      router.refresh()
    })
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#5d00f5]/30 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#9b6dff]">
              {(displayName ?? '?')[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Form */}
        <form ref={formRef} action={action} className="flex-1 flex flex-col gap-3">
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with the HYSKY community…"
            maxLength={MAX}
            rows={3}
            className="w-full resize-none rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
            style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${content.length > MAX * 0.9 ? 'text-amber-400' : 'text-white/25'}`}>
              {content.length}/{MAX}
            </span>
            <button
              type="submit"
              disabled={!content.trim() || isPending || content.length > MAX}
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
