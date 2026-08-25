'use client'

import { EventRegisterButton } from '@/components/EventRegisterButton'
import {
  FLYING_HY_REGISTER_OPTIONS,
  FLYING_HY_REGISTRATION_TITLE,
} from '@/lib/flying-hy-registration'

export default function FlyingHyTicketButton() {
  return (
    <EventRegisterButton
      label={(
        <>
          <span className="hidden lg:inline">Get FLYING HY Tickets</span>
          <span className="lg:hidden">Tickets</span>
        </>
      )}
      options={FLYING_HY_REGISTER_OPTIONS}
      title={FLYING_HY_REGISTRATION_TITLE}
      compactModal
      className="shrink-0 whitespace-nowrap rounded-full bg-[#5d00f5] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-[0_8px_24px_rgba(93,0,245,.24)] transition-all hover:bg-[#7130ff] hover:shadow-[0_10px_28px_rgba(93,0,245,.34)] sm:px-4"
      style={{ color: '#fff' }}
    />
  )
}

