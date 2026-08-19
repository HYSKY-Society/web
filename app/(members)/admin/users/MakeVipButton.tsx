'use client'

type MakeVipButtonProps = {
  action: (formData: FormData) => void | Promise<void>
  userId: string
  userEmail: string
  currentTier: string
}

export default function MakeVipButton({ action, userId, userEmail, currentTier }: MakeVipButtonProps) {
  const isVip = currentTier === 'member_full'
  const targetTier = isVip ? 'free' : 'member_full'
  const buttonLabel = isVip ? 'Make Free' : 'Make VIP'
  const confirmation = isVip
    ? `Are you sure you want to make ${userEmail} a free member? They will lose VIP Connect and unlimited HySky News access.`
    : `Are you sure you want to make ${userEmail} a VIP member?`

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmation)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="targetTier" value={targetTier} />
      <button
        type="submit"
        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
          isVip
            ? 'border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20'
            : 'border-[#5d00f5]/40 bg-[#5d00f5] text-white hover:bg-[#7130f7]'
        }`}
      >
        {buttonLabel}
      </button>
    </form>
  )
}

