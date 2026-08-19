'use client'

import { useState } from 'react'
import { ZeffyModal } from '@/components/ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'

export default function ProfileAccessTease({ name }: { name: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mb-6 block w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition-colors hover:border-[#5d00f5]/45 hover:bg-white/8"
        aria-label={`Upgrade to view ${name}'s contact details`}
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">Contact &amp; Links</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-base">✉️</span>
          <span className="font-medium text-white/60">Email and contact details</span>
          <span className="ml-auto text-xs font-semibold text-[#9b6dff] group-hover:underline">VIP — click to view</span>
        </div>
      </button>
      <ZeffyModal
        isOpen={open}
        onClose={() => {
          setOpen(false)
          window.dispatchEvent(new Event('vip-access:check'))
        }}
        title="Upgrade to HySky VIP"
        options={[{ label: 'VIP Membership', icon: '👥', embedUrl: ZEFFY.membership }]}
      />
    </>
  )
}

