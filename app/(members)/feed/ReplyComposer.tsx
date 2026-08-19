'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createReply } from './actions'
import type { MentionMember } from './FeedComposer'

export default function ReplyComposer({
  postId,
  mentionMembers,
  canTagMembers,
  onComplete,
}: {
  postId: string
  mentionMembers: MentionMember[]
  canTagMembers: boolean
  onComplete: () => void
}) {
  const [content, setContent] = useState('')
  const [mentionedIds, setMentionedIds] = useState<string[]>([])
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [activeMention, setActiveMention] = useState(0)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const mentionMatches = !canTagMembers || mentionQuery === null
    ? []
    : mentionMembers
        .filter((member) => member.name.toLowerCase().includes(mentionQuery.toLowerCase()))
        .slice(0, 8)

  function updateMentionSearch(value: string, cursor: number) {
    if (!canTagMembers) return
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
    const textarea = textareaRef.current
    if (!textarea || mentionStart === null) return
    const cursor = textarea.selectionStart
    const insertion = `@${member.name} `
    setContent(content.slice(0, mentionStart) + insertion + content.slice(cursor))
    setMentionedIds((current) => current.includes(member.id) ? current : [...current, member.id])
    setMentionQuery(null)
    setMentionStart(null)
    setTimeout(() => {
      const nextCursor = mentionStart + insertion.length
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
    }, 0)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
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
    const textarea = textareaRef.current
    if (!textarea) return
    const cursor = textarea.selectionStart
    const prefix = cursor > 0 && !/\s/.test(content[cursor - 1]) ? ' @' : '@'
    const next = content.slice(0, cursor) + prefix + content.slice(cursor)
    setContent(next)
    const nextCursor = cursor + prefix.length
    setMentionQuery('')
    setMentionStart(nextCursor - 1)
    setActiveMention(0)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
    }, 0)
  }

  function submitReply() {
    startTransition(async () => {
      await createReply(postId, content, mentionedIds)
      setContent('')
      setMentionedIds([])
      setMentionQuery(null)
      onComplete()
      router.refresh()
    })
  }

  return (
    <div className="mt-3 flex items-end gap-2">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            setContent(event.target.value)
            updateMentionSearch(event.target.value, event.target.selectionStart)
          }}
          onClick={(event) => updateMentionSearch(event.currentTarget.value, event.currentTarget.selectionStart)}
          onKeyDown={handleKeyDown}
          placeholder={canTagMembers ? 'Write a reply… Use @ to tag a member' : 'Write a reply…'}
          rows={2}
          maxLength={1000}
          className="w-full resize-none rounded-xl px-3 py-2 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
          style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
        />

        {canTagMembers && (
          <button
            type="button"
            title="Tag a member (@)"
            aria-label="Tag a member"
            onClick={startMention}
            className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-[#9b6dff] transition-colors hover:bg-[#5d00f5]/15"
          >
            @
          </button>
        )}

        {mentionQuery !== null && mentionMatches.length > 0 && (
          <div
            className="absolute bottom-full left-0 z-40 mb-2 max-h-64 w-full min-w-[260px] overflow-y-auto rounded-xl p-1 shadow-2xl"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)' }}
          >
            {mentionMatches.map((member, index) => (
              <button
                key={member.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectMention(member)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                  index === activeMention ? 'bg-[#5d00f5]/20' : 'hover:bg-white/5'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#5d00f5]/25 text-xs font-bold text-[#9b6dff]">
                  {member.avatarUrl
                    ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
                    : member.name[0]?.toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">{member.name}</span>
                  {member.headline && <span className="block truncate text-xs text-white/40">{member.headline}</span>}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={submitReply}
        disabled={!content.trim() || isPending}
        className="rounded-lg bg-[#5d00f5] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#7b33ff] disabled:opacity-40"
        style={{ color: '#fff' }}
      >
        {isPending ? '…' : 'Reply'}
      </button>
    </div>
  )
}

