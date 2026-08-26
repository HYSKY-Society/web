'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ZeffyModal } from '@/components/ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'
import SidebarIcon from './SidebarIcon'

function FullVipDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,3,10,.82)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your VIP membership"
    >
      <div
        className="section-dark w-full max-w-md rounded-2xl border border-white/12 bg-[#09090f] p-6 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white">You&apos;re a full VIP member</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Your account already includes full VIP access to the HySky Connect community.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-xl bg-[#5d00f5] px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Got it
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default function MembershipPlanButton({ tierLabel, isVip }: { tierLabel: string; isVip: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-1 flex w-[calc(100%-0.5rem)] items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-[#5d00f5]/50"
        aria-label={`View membership plan: ${tierLabel}`}
      >
        <SidebarIcon name="plan" />
        <span className="text-xs text-white/35">
          Plan: <span className="font-medium text-[#9b6dff]">{tierLabel}</span>
        </span>
      </button>

      {isVip ? (
        <FullVipDialog isOpen={open} onClose={() => setOpen(false)} />
      ) : (
        <ZeffyModal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Upgrade Your HySky Membership"
          options={[{ label: 'VIP Membership', icon: '', embedUrl: ZEFFY.membership }]}
        />
      )}
    </>
  )
}
