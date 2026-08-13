'use client'

import { useState } from 'react'
import { ZeffyModal } from '@/components/ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'

export default function ProfileAccessTease({ name }: { name: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(93,0,245,.16), rgba(255,255,255,.03))', border: '1px solid rgba(93,0,245,.35)' }}>
        <p className="text-xs text-[#9b6dff] uppercase tracking-wider font-semibold mb-2">VIP Member Access</p>
        <h2 className="text-lg font-semibold text-white">Connect with {name}</h2>
        <p className="text-sm text-white/50 mt-1 mb-4">
          Upgrade to email this member, view company and phone details, see complete profile links, and send direct messages.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-[#5d00f5] hover:bg-[#7c2fff] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Upgrade to VIP
        </button>
      </div>
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
