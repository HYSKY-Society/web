'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike, createReply, repostPost } from './actions'

export type PostAuthor = {
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
    author: PostAuthor
    createdAt: Date
  } | null
}

function Avatar({ author }: { author: PostAuthor }) {
  return (
    <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[#5d00f5]/30 flex items-center justify-center">
      {author.avatar ? (
        <img src={author.avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-[#9b6dff]">
          {(author.name ?? author.email)[0].toUpperCase()}
        </span>
      )}
    </div>
  )
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function FeedPostCard({ post }: { post: PostData }) {
  const [liked, setLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [repostCount, setRepostCount] = useState(post.repostCount)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyPending, startReplyTransition] = useTransition()
  const [likePending, startLikeTransition] = useTransition()
  const [repostPending, startRepostTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [showRepostConfirm, setShowRepostConfirm] = useState(false)
  const router = useRouter()

  const handleLike = () => {
    startLikeTransition(async () => {
      const newLiked = !liked
      setLiked(newLiked)
      setLikeCount((c) => (newLiked ? c + 1 : Math.max(c - 1, 0)))
      await toggleLike(post.id)
    })
  }

  const handleReply = async () => {
    if (!replyText.trim()) return
    startReplyTransition(async () => {
      await createReply(post.id, replyText)
      setReplyText('')
      setShowReplyForm(false)
      router.refresh()
    })
  }

  const handleRepost = () => {
    startRepostTransition(async () => {
      await repostPost(post.id)
      setRepostCount((c) => c + 1)
      setShowRepostConfirm(false)
      router.refresh()
    })
  }

  const handleShare = () => {
    const url = `${window.location.origin}/feed#post-${post.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isRepost = !!post.repostOfId

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-2xl p-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-muted)' }}
    >
      {/* Repost header */}
      {isRepost && (
        <div className="flex items-center gap-1.5 text-xs text-white/35 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
            <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          <span>{post.author.name ?? post.author.email} reposted</span>
        </div>
      )}

      {/* Author row */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar author={isRepost && post.originalPost ? post.originalPost.author : post.author} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">
              {(isRepost && post.originalPost ? post.originalPost.author : post.author).name
                ?? (isRepost && post.originalPost ? post.originalPost.author : post.author).email}
            </span>
            {(isRepost && post.originalPost ? post.originalPost.author : post.author).headline && (
              <span className="text-xs text-white/35 truncate hidden sm:block">
                · {(isRepost && post.originalPost ? post.originalPost.author : post.author).headline}
              </span>
            )}
          </div>
          <span className="text-xs text-white/30">
            {timeAgo(isRepost && post.originalPost ? post.originalPost.createdAt : post.createdAt)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap mb-4">
        {isRepost && post.originalPost ? post.originalPost.content : post.content}
      </div>

      {/* Divider */}
      <div className="mb-3" style={{ borderTop: '1px solid var(--border-muted)' }} />

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

        {/* Repost */}
        <div className="relative">
          <button
            onClick={() => setShowRepostConfirm((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              repostPending ? 'text-emerald-400' : 'text-white/45 hover:text-white hover:bg-white/6'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" />
              <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
            {repostCount > 0 && <span>{repostCount}</span>}
            <span className="hidden sm:inline">Repost</span>
          </button>
          {showRepostConfirm && (
            <div
              className="absolute bottom-full left-0 mb-2 z-20 rounded-xl p-3 shadow-xl"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dim)', width: '160px' }}
            >
              <p className="text-xs text-white/60 mb-2">Share to your feed?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRepostConfirm(false)}
                  className="flex-1 text-xs py-1 rounded-lg text-white/50 hover:text-white transition-colors"
                  style={{ border: '1px solid var(--border-muted)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRepost}
                  disabled={repostPending}
                  className="flex-1 text-xs py-1 rounded-lg bg-[#5d00f5] hover:bg-[#7b33ff] transition-colors"
                  style={{ color: '#fff' }}
                >
                  Repost
                </button>
              </div>
            </div>
          )}
        </div>

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
                      <span className="text-xs font-semibold text-white">
                        {r.author.name ?? r.author.email}
                      </span>
                      <span className="text-[10px] text-white/30">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-white/75 mt-0.5 leading-relaxed">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
