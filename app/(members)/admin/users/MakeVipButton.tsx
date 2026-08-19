'use client'

type MakeVipButtonProps = {
  action: (formData: FormData) => void | Promise<void>
  userId: string
  userEmail: string
}

export default function MakeVipButton({ action, userId, userEmail }: MakeVipButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm('Are you sure you want to make ' + userEmail + ' a VIP member?')) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="rounded-lg border border-[#5d00f5]/40 bg-[#5d00f5] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#7130f7]"
      >
        Make VIP
      </button>
    </form>
  )
}

