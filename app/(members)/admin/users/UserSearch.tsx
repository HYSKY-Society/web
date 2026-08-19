'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function UserSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  function updateSearch(value: string) {
    setQuery(value)
    startTransition(() => {
      const normalized = value.trim()
      router.replace(normalized ? `/admin/users?q=${encodeURIComponent(normalized)}` : '/admin/users')
    })
  }

  return (
    <div className="relative mt-4">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
        🔎
      </span>
      <input
        type="search"
        value={query}
        onChange={(event) => updateSearch(event.target.value)}
        placeholder="Search users by email..."
        aria-label="Search users by email"
        className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#5d00f5]/70 focus:bg-white/8"
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">Searching…</span>
      )}
    </div>
  )
}

