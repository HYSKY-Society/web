'use client'

import { useEffect, useState } from 'react'

export default function ContactEmailAction({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 2500)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      const input = document.createElement('textarea')
      input.value = email
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    setCopied(true)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copyEmail}
        className="group flex min-w-0 flex-1 items-center gap-3 text-left text-sm text-white/60 transition-colors hover:text-white"
        aria-label={`Copy ${email}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-base transition-colors group-hover:bg-[#5d00f5]/20">✉️</span>
        <span className="min-w-0">
          <span className="block truncate">{email}</span>
          <span className="block text-[11px] text-white/35">{copied ? 'Copied to clipboard!' : 'Click to copy email'}</span>
        </span>
      </button>
      <a
        href={`mailto:${email}`}
        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#9b6dff] transition-colors hover:border-[#5d00f5]/50 hover:text-white"
      >
        Open email app
      </a>
    </div>
  )
}


