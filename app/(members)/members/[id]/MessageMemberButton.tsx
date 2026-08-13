'use client'

import { useChatCtx } from '@/app/components/ChatProvider'

export default function MessageMemberButton({
  memberId,
  name,
  avatarUrl,
}: {
  memberId: string
  name: string
  avatarUrl: string | null
}) {
  const { openDM } = useChatCtx()

  return (
    <button
      type="button"
      onClick={() => openDM(memberId, name, avatarUrl)}
      className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#5d00f5] hover:bg-[#7b33ff] px-4 py-2 rounded-lg transition-colors"
      aria-label={`Message ${name}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      Message
    </button>
  )
}
