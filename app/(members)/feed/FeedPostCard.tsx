'use client'
import { Fragment, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleLike, createReply, deletePost, deleteReply } from './actions'
import { useChatCtx } from '@/app/components/ChatProvider'

export type PostAuthor = {
  id: string
  name: string | null
  avatar: string | null
  headline: string | null
  email: string
}

export type ReplyData = {
  id: string
  content: string
  createdAt: Date
  author: PostAuthor
}

export type PostData = {
  id: string
  content: string
  imageUrls: string[]
  repostOfId: string | null
  likeCount: number
  replyCount: number
  repostCount: number
  createdAt: Date
  author: PostAuthor
  isLiked: boolean
  likers: PostAuthor[]
  replies: ReplyData[]
  originalPost?: {
    id: string
    content: string
    imageUrls: string[]
    author: PostAuthor
    createdAt: Date
  } | null
}

// ── Markdown renderer ────────────────────────────────────────────────────────

type MentionRef = {
  id: string
  name: string
}

const MENTION_METADATA = /\n\u2063hysky-mentions:([^\n]+)$/

function parseMentionMetadata(text: string): { visibleText: string; mentions: MentionRef[] } {
  const match = text.match(MENTION_METADATA)
  if (!match) return { visibleText: text, mentions: [] }
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as unknown
    const mentions = Array.isArray(parsed)
      ? parsed.filter((value): value is MentionRef =>
          !!value
          && typeof value === 'object'
          && typeof (value as MentionRef).id === 'string'
          && typeof (value as MentionRef).name === 'string'
        )
      : []
    const metadataIndex = match.index ?? text.length
    return { visibleText: text.slice(0, metadataIndex), mentions }
  } catch {
    const metadataIndex = match.index ?? text.length
    return { visibleText: text.slice(0, metadataIndex), mentions: [] }
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function renderLine(line: string, mentions: MentionRef[]) {
  const mentionMap = new Map(mentions.map((mention) => [`@${mention.name}`, mention]))
  const mentionPatterns = [...mentionMap.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
  const patterns = [
    '\\*\\*[^*\\n]+\\*\\*',
    '\\*[^*\\n]+\\*',
    '__[^_\\n]+__',
    'https?:\\/\\/[^\\s]+',
    ...mentionPatterns,
  ]
  const inline = new RegExp(`(${patterns.join('|')})`, 'g')
  const nodes: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = inline.exec(line)) !== null) {
    if (match.index > last) nodes.push(line.slice(last, match.index))
    const token = match[0]
    const mention = mentionMap.get(token)
    if (mention) {
      nodes.push(
        <Link
          key={key++}
          href={`/members/${mention.id}`}
          className="inline-flex rounded-md bg-[#5d00f5]/15 px-1 font-semibold text-[#8b4dff] hover:bg-[#5d00f5]/25 hover:underline"
        >
          {token}
        </Link>
      )
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key++} className="font-semibold text-white">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('__')) {
      nodes.push(<u key={key++}>{token.slice(2, -2)}</u>)
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>)
    } else {
      nodes.push(
        <a key={key++} href={token} target="_blank" rel="noopener noreferrer"
           className="text-[#9b6dff] hover:underline break-all">
          {token}
        </a>
      )
    }
    last = match.index + token.length
  }
  if (last < line.length) nodes.push(line.slice(last))
  return nodes
}

function RichContent({ text }: { text: string }) {
  if (!text) return null
  const { visibleText, mentions } = parseMentionMetadata(text)
  return (
    <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
      {visibleText.split('\n').map((line, i, lines) => (
        <Fragment key={i}>
          {renderLine(line, mentions)}
          {i < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </p>
  )
}

// ── Image gallery ────────────────────────────────────────────────────────────

function ImageGallery({ urls }: { urls: string[] }) {
  if (!urls.length) return null
  const [lightbox, setLightbox] = useState<string | null>(null)
  const cols = urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
  return (
    <>
      <div className={`grid gap-1 rounded-xl overflow-hidden ${cols} mt-3 mb-1`}>
        {urls.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightbox(url)}
            className={`block overflow-hidden bg-black/20 ${
              urls.length === 3 && i === 0 ? 'row-span-2' : ''
            }`}
            style={{ aspectRatio: urls.length === 1 ? '16/9' : '1/1' }}
          >
            <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white"
            style={{ background: 'rgba(0,0,0,.5)' }}
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}

// ── Author helpers ────────────────────────────────────────────────────────────

function emailToName(email: string): string {
  return email
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function authorDisplayName(author: PostAuthor): string {
  return author.name || emailToName(author.email)
}

// ── Author hover card ─────────────────────────────────────────────────────────

function AuthorHoverCard({
  author,
  size = 'sm',
  canUseVipCommunity,
}: {
  author: PostAuthor
  size?: 'xs' | 'sm'
  canUseVipCommunity: boolean
}) {
  const [show, setShow] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const name = authorDisplayName(author)
  const { openDM } = useChatCtx()

  if (!canUseVipCommunity) {
    return (
      <span className={`${size === 'sm' ? 'text-sm' : 'text-xs'} font-semibold text-white`}>
        {name}
      </span>
    )
  }

  function enter() {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setShow(true)
  }
  function leave() {
    hideTimer.current = setTimeout(() => setShow(false), 120)
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <Link
        href={`/members/${author.id}`}
        className={`${size === 'sm' ? 'text-sm' : 'text-xs'} font-semibold text-white hover:text-[#9b6dff] transition-colors`}
      >
        {name}
      </Link>
      {show && (
        <div
          className="absolute left-0 top-full mt-1.5 z-30 rounded-2xl p-4 shadow-2xl"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)', width: '240px' }}
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-[#5d00f5]/30 flex items-center justify-center">
              {author.avatar
                ? <img src={author.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-lg font-bold text-[#9b6dff]">{name[0].toUpperCase()}</span>
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white leading-snug truncate">{name}</p>
              {author.headline && (
                <p className="text-xs text-white/45 leading-snug mt-0.5">{author.headline}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/members/${author.id}`}
              className="flex-1 text-center text-xs py-1.5 rounded-lg font-medium text-white/60 hover:text-white transition-colors"
              style={{ border: '1px solid var(--border-muted)' }}
            >
              View Profile
            </Link>
            <button
              onClick={() => openDM(author.id, name, author.avatar)}
              className="flex-1 text-center text-xs py-1.5 rounded-lg font-medium bg-[#5d00f5] hover:bg-[#7b33ff] transition-colors"
              style={{ color: '#fff' }}
            >
              Message
            </button>
          </div>
        </div>
      )}
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ author }: { author: PostAuthor }) {
  return (
    <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#5d00f5]/30 flex items-center justify-center">
      {author.avatar
        ? <img src={author.avatar} alt="" className="w-full h-full object-cover" />
        : <span className="text-sm font-bold text-[#9b6dff]">{authorDisplayName(author)[0].toUpperCase()}</span>
      }
    </div>
  )
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 7)  return `${d}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Card ─────────────────────────────────────────────────────────────────────

export default function FeedPostCard({
  post,
  canUseVipCommunity,
  canModerate,
}: {
  post: PostData
  canUseVipCommunity: boolean
  canModerate: boolean
}) {
  const [liked, setLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyPending, startReply] = useTransition()
  const [likePending, startLike] = useTransition()
  const [deletePending, startDelete] = useTransition()
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const isRepost = !!post.repostOfId
  const displayPost = isRepost && post.originalPost ? post.originalPost : post
  const displayAuthor = displayPost.author

  const handleLike = () => {
    startLike(async () => {
      const next = !liked
      setLiked(next)
      setLikeCount((c) => next ? c + 1 : Math.max(c - 1, 0))
      await toggleLike(post.id)
      router.refresh()
    })
  }

  const handleReply = () => {
    startReply(async () => {
      await createReply(post.id, replyText)
      setReplyText('')
      setShowReplyForm(false)
      router.refresh()
    })
  }

  const handleDeletePost = () => {
    if (!window.confirm('Delete this post and all of its comments?')) return
    startDelete(async () => {
      const result = await deletePost(post.id)
      if (result.deleted) router.refresh()
    })
  }

  const handleDeleteReply = (replyId: string) => {
    if (!window.confirm('Delete this comment?')) return
    startDelete(async () => {
      const result = await deleteReply(replyId)
      if (result.deleted) router.refresh()
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/feed#post-${post.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-2xl p-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
    >
      {/* Repost header */}
      {isRepost && (
        <div className="flex items-center gap-1.5 text-xs text-white/35 mb-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
            <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          <span>{authorDisplayName(post.author)} reposted</span>
        </div>
      )}

      {/* Author row */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar author={displayAuthor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <AuthorHoverCard author={displayAuthor} canUseVipCommunity={canUseVipCommunity} />
            {displayAuthor.headline && (
              <span className="text-xs text-white/35 truncate hidden sm:block">· {displayAuthor.headline}</span>
            )}
          </div>
          <span className="text-xs text-white/30">{timeAgo(displayPost.createdAt)}</span>
        </div>
        {canModerate && (
          <button
            type="button"
            onClick={handleDeletePost}
            disabled={deletePending}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
            aria-label="Delete post"
          >
            Delete
          </button>
        )}
      </div>

      {/* Content + images */}
      <RichContent text={displayPost.content} />
      <ImageGallery urls={displayPost.imageUrls} />

      {/* Divider */}
      <div className="mt-3 mb-3" style={{ borderTop: '1px solid var(--border-muted)' }} />

      {/* Action bar */}
      <div className="flex items-center gap-1">

        {/* Like */}
        <div className="group/likes relative">
          <button
            onClick={handleLike}
            disabled={likePending}
            aria-label={likeCount > 0 ? `${likeCount} likes. Hover to see who liked this post.` : 'Like this post'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              liked ? 'text-[#9b6dff] bg-[#5d00f5]/15' : 'text-white/45 hover:text-white hover:bg-white/6'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            {likeCount > 0 && <span>{likeCount}</span>}
            <span className="hidden sm:inline">Like</span>
          </button>
          {post.likers.length > 0 && (
            <div
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 min-w-[190px] max-w-[260px] translate-y-1 rounded-xl p-3 opacity-0 shadow-2xl transition-all duration-150 group-hover/likes:translate-y-0 group-hover/likes:opacity-100 group-focus-within/likes:translate-y-0 group-focus-within/likes:opacity-100"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)' }}
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">
                Liked by
              </p>
              <div className="space-y-1.5">
                {post.likers.slice(0, 8).map((liker) => (
                  <div key={liker.id} className="flex items-center gap-2">
                    <Avatar author={liker} />
                    <span className="truncate text-xs font-medium text-white">
                      {authorDisplayName(liker)}
                    </span>
                  </div>
                ))}
              </div>
              {post.likers.length > 8 && (
                <p className="mt-2 text-xs text-white/40">
                  +{post.likers.length - 8} more
                </p>
              )}
            </div>
          )}
        </div>

        {/* Reply */}
        <button
          onClick={() => setShowReplyForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/45 hover:text-white hover:bg-white/6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {post.replyCount > 0 && <span>{post.replyCount}</span>}
          <span className="hidden sm:inline">Reply</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/45 hover:text-white hover:bg-white/6 transition-colors ml-auto"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="mt-3 flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply…"
            rows={2}
            className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#5d00f5]/60"
            style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-muted)' }}
          />
          <button
            onClick={handleReply}
            disabled={!replyText.trim() || replyPending}
            className="self-end px-3 py-2 rounded-lg text-xs font-semibold bg-[#5d00f5] hover:bg-[#7b33ff] disabled:opacity-40 transition-colors"
            style={{ color: '#fff' }}
          >
            {replyPending ? '…' : 'Reply'}
          </button>
        </div>
      )}

      {/* Replies */}
      {post.replies.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowReplies((v) => !v)}
            className="text-xs text-white/35 hover:text-white/60 transition-colors mb-2"
          >
            {showReplies ? 'Hide' : 'View'} {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {showReplies && (
            <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid var(--border-muted)' }}>
              {post.replies.map((r) => (
                <div key={r.id} className="flex gap-2">
                  <Avatar author={r.author} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <AuthorHoverCard author={r.author} size="xs" canUseVipCommunity={canUseVipCommunity} />
                      <span className="text-[10px] text-white/30">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="text-xs text-white/75 mt-0.5 leading-relaxed">
                      <RichContent text={r.content} />
                    </div>
                  </div>
                  {canModerate && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReply(r.id)}
                      disabled={deletePending}
                      className="self-start rounded-md px-2 py-1 text-[10px] font-medium text-red-400/75 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                      aria-label="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
