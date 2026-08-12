'use client'
import { Fragment, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleLike, createReply, repostPost } from './actions'
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

const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|__[^_\n]+__|https?:\/\/[^\s]+)/g

function renderLine(line: string) {
  const nodes: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  INLINE.lastIndex = 0
  while ((m = INLINE.exec(line)) !== null) {
    if (m.index > last) nodes.push(line.slice(last, m.index))
    const t = m[0]
    if (t.startsWith('**'))
      nodes.push(<strong key={key++} className="font-semibold text-white">{t.slice(2, -2)}</strong>)
    else if (t.startsWith('__'))
      nodes.push(<u key={key++}>{t.slice(2, -2)}</u>)
    else if (t.startsWith('*'))
      nodes.push(<em key={key++}>{t.slice(1, -1)}</em>)
    else
      nodes.push(
        <a key={key++} href={t} target="_blank" rel="noopener noreferrer"
           className="text-[#9b6dff] hover:underline break-all">
          {t}
        </a>
      )
    last = m.index + t.length
  }
  if (last < line.length) nodes.push(line.slice(last))
  return nodes
}

function RichContent({ text }: { text: string }) {
  if (!text) return null
  return (
    <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
      {text.split('\n').map((line, i, arr) => (
        <Fragment key={i}>
          {renderLine(line)}
          {i < arr.length - 1 && <br />}
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
}: {
  post: PostData
  canUseVipCommunity: boolean
}) {
  const [liked, setLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [repostCount, setRepostCount] = useState(post.repostCount)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyPending, startReply] = useTransition()
  const [likePending, startLike] = useTransition()
  const [repostPending, startRepost] = useTransition()
  const [copied, setCopied] = useState(false)
  const [showRepostConfirm, setShowRepostConfirm] = useState(false)
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

  const handleRepost = () => {
    startRepost(async () => {
      await repostPost(post.id)
      setRepostCount((c) => c + 1)
      setShowRepostConfirm(false)
      router.refresh()
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
      </div>

      {/* Content + images */}
      <RichContent text={displayPost.content} />
      <ImageGallery urls={displayPost.imageUrls} />

      {/* Divider */}
      <div className="mt-3 mb-3" style={{ borderTop: '1px solid var(--border-muted)' }} />

      {/* Action bar */}
      <div className="flex items-center gap-1">

        {/* Like */}
        <button
          onClick={handleLike}
          disabled={likePending}
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

        {/* Repost — publishing is a VIP community feature */}
        {canUseVipCommunity && <div className="relative">
          <button
            onClick={() => setShowRepostConfirm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/45 hover:text-white hover:bg-white/6 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
              <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
            {repostCount > 0 && <span>{repostCount}</span>}
            <span className="hidden sm:inline">Repost</span>
          </button>
          {showRepostConfirm && (
 �����$z{-���jםplayName || data.email}
              </p>
              {data.displayName && (
                <p className="text-xs text-white/35 truncate">{data.email}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
