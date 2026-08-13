'use client'

import { useState } from 'react'
import { ZeffyModal } from '@/components/ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'

export default function UpgradeChatButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-0 right-4 z-50 pb-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Upgrade to HySky VIP for messaging"
          aria-label="Upgrade to HySky VIP for messaging"
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl relative shadow-2xl transition-transform hover:scale-105 active:scale-95"
          style={{ background: '#5d00f5', boxShadow: '0 8px 32px #5d00f540' }}
        >
          💬
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#13dce8] text-[8px] font-black flex items-center justify-center" style={{ color: '#04080F' }}>
            VIP
          </span>
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
