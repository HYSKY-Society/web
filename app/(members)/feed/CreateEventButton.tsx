'use client'
import { useState } from 'react'
import { ZeffyModal } from '@/components/ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'
import CreateEventModal from './CreateEventModal'

interface Props {
  canUseVipCommunity: boolean
}

export default function CreateEventButton({ canUseVipCommunity }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <button
        type="button"
        title={canUseVipCommunity ? 'Create an event' : 'Upgrade to HySky VIP to create an event'}
        onClick={() => (canUseVipCommunity ? setShowForm(true) : setShowUpgrade(true))}
        className="ml-1 h-7 px-3 rounded-md text-xs font-semibold bg-white border border-black hover:bg-black/5 transition-colors"
        style={{ color: '#000' }}
      >
        Create event
      </button>

      <CreateEventModal isOpen={showForm} onClose={() => setShowForm(false)} />

      <ZeffyModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Upgrade to HySky VIP"
        options={[{ label: 'VIP Membership', icon: '👥', embedUrl: ZEFFY.membership }]}
      />
    </>
  )
}
