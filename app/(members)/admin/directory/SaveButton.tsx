'use client'

import { useFormStatus } from 'react-dom'

export default function SaveButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[#5d00f5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7020ff] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? 'Saving…' : children}
    </button>
  )
}
