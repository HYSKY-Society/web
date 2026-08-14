'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ZeffyModal } from './ZeffyModal'

interface EnrollButtonProps {
  hasAccess: boolean
  courseSlug: string
  courseTitle: string
  courseImage?: string
  courseEmbedUrl: string
  contentPath: string
  accent: string
  size?: 'md' | 'lg'
  variant?: 'cta' | 'fee'
  feeLabel?: string
  feePrice?: string
  featured?: boolean
}

export function EnrollButton({
  hasAccess,
  courseSlug,
  courseTitle,
  courseImage,
  courseEmbedUrl,
  contentPath,
  accent,
  size = 'lg',
  variant = 'cta',
  feeLabel,
  feePrice,
  featured = false,
}: EnrollButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open || hasAccess) return

    let active = true
    let checking = false

    const checkAccess = async () => {
      if (!active || checking) return
      checking = true

      try {
        const response = await fetch(`/api/courses/${encodeURIComponent(courseSlug)}/access`, {
          cache: 'no-store',
        })
        if (!response.ok) return

        const result = await response.json() as { hasAccess?: boolean }
        if (active && result.hasAccess) {
          setOpen(false)
          router.replace(contentPath)
          router.refresh()
        }
      } catch {
        // A temporary network failure should not interrupt checkout.
      } finally {
        checking = false
      }
    }

    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible') void checkAccess()
    }

    void checkAccess()
    const intervalId = window.setInterval(checkAccess, 1500)
    window.addEventListener('focus', checkAccess)
    document.addEventListener('visibilitychange', checkWhenVisible)

    return () => {
      active = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', checkAccess)
      document.removeEventListener('visibilitychange', checkWhenVisible)
    }
  }, [open, hasAccess, courseSlug, contentPath, router])

  const textColor = accent.toLowerCase() === '#00d4d4' ? 'text-black' : 'text-[#fff]'
  const cls = size === 'lg'
    ? `inline-flex items-center gap-2 ${textColor} font-bold px-10 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-base`
    : `inline-flex items-center gap-2 ${textColor} font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] text-sm`

  if (hasAccess) {
    return (
      <Link href={contentPath} className={cls} style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}>
        Access Course Content →
      </Link>
    )
  }

  if (variant === 'fee' && feeLabel && feePrice) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Enroll with the ${feeLabel} option`}
          className="group w-full rounded-2xl p-5 border flex items-center justify-between gap-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            borderColor: `${accent}${featured ? '90' : '55'}`,
            boxShadow: featured ? `0 8px 24px ${accent}18` : undefined,
            outlineColor: accent,
          }}
        >
          <span className="text-white/70 text-sm font-medium">{feeLabel}</span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="font-bold text-lg text-white">{feePrice}</span>
            <span className="text-white/45 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
          </span>
        </button>
        <ZeffyModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={courseTitle}
          heroImage={courseImage}
          heroAccent={accent}
          options={[
            { label: courseTitle, icon: '🎓', embedUrl: courseEmbedUrl },
          ]}
        />
      </>
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
        title={courseTitle}
        heroImage={courseImage}
        heroAccent={accent}
        options={[
          { label: courseTitle, icon: '🎓', embedUrl: courseEmbedUrl },
        ]}
      />
    </>
  )
}
