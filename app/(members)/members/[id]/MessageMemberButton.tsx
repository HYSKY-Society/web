'use client'

import { useState } from 'react'
import { useChatCtx } from '@/app/components/ChatProvider'
import { ZeffyModal } from '@/components/ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'

export default function MessageMemberButton({
  memberId,
  name,
  avatarUrl,
  canMessage,
  canReceiveMessages = true,
}: {
  memberId: string
  name: string
  avatarUrl: string | null
  canMessage: boolean
  canReceiveMessages?: boolean
}) {
  const { openDM } = useChatCtx()
  const [membershipOpen, setMembershipOpen] = useState(false)
  const [unavailableOpen, setUnavailableOpen] = useState(false)

  const handleClick = () => {
    if (!canMessage) {
      setMembershipOpen(true)
    } else if (!canReceiveMessages) {
      setUnavailableOpen(true)
    } else {
      openDM(memberId, name, avatarUrl)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#5d00f5] hover:bg-[#7b33ff] px-4 py-2 rounded-lg transition-colors"
        aria-label={`Message ${name}`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Message
        {!canMessage && <span className="text-[10px] text-white/65">VIP</span>}
      </button>
      {!canMessage && (
        <ZeffyModal
          isOpen={membershipOpen}
          onClose={() => {
            setMembershipOpen(false)
            window.dispatchEvent(new Event('vip-access:check'))
          }}
          title="Upgrade to HySky VIP"
          options={[{ label: 'VIP Membership', icon: '👥', embedUrl: ZEFFY.membership }]}
        />
      )}
      {unavailableOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="message-unavailable-title">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#11131a] p-6 text-white shadow-2xl">
            <h2 id="message-unavailable-title" className="text-lg font-semibold">Messaging unavailable</h2>
            <p className="mt-2 text-sm text-white/60">Messaging is not available for this profile yet.</p>
            <button type="button" onClick={() => setUnavailableOpen(false)} className="mt-5 w-full rounded-xl bg-[#5d00f5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7b33ff]">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

