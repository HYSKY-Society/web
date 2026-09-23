'use client'

export default function ConfirmDeleteButton({
  confirmation,
  children,
}: {
  confirmation: string
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault()
      }}
      className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
    >
      {children}
    </button>
  )
}
