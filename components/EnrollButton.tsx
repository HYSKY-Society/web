'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ZeffyModal } from './ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'

interface EnrollButtonProps {
  hasAccess: boolean
  courseSlug: string
  courseTitle: string
  courseEmbedUrl: string
  contentPath: string
  accent: string
  size?: 'md' | 'lg'
}

export function EnrollButton({
  hasAccess,
  courseTitle,
  courseEmbedUrl,
  contentPath,
  accent,
  size = 'lg',
}: EnrollButtonProps) {
  const [open, setOpen] = useState(false)

  const cls = size === 'lg'
    ? 'inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-base'
    : 'inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] text-sm'

  if (hasAccess) {
    return (
      <Link href={contentPath} className={cls} style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}>
        Access Course Content →
      </Link>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cls}
        style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}
      >
        Enroll Now →
      </button>
      <ZeffyModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`Get Access — ${courseTitle}`}
        options={[
          { label: 'This Course', icon: '🎓', embedUrl: courseEmbedUrl },
          { label: 'Membership', icon: '👥', embedUrl: ZEFFY.membership },
        ]}
      />
    </>
  )
}
