'use client'

import { FormEvent, useState } from 'react'

type InviteResult = {
  sent?: number
  results?: { email: string; ok: boolean; error?: string }[]
  error?: string
}

export default function InviteUserButton() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const close = () => {
    if (status === 'sending') return
    setOpen(false)
    setEmail('')
    setStatus('idle')
    setMessage('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return

    if (!window.confirm(`Are you sure you want to invite ${normalizedEmail} to create a HySky Connect account?`)) {
      return
    }

    setStatus('sending')
    setMessage('')

    try {
      const response = await fetch('/api/admin/invite-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [normalizedEmail] }),
      })
      const result = await response.json() as InviteResult
      const invitation = result.results?.[0]

      if (!response.ok || !invitation?.ok) {
        throw new Error(invitation?.error ?? result.error ?? 'The invitation could not be sent.')
      }

      setStatus('sent')
      setMessage(`Invitation sent to ${normalizedEmail}.`)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'The invitation could not be sent.')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#5d00f5] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#7130f7]"
      >
        Invite User
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-user-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0b13] p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="invite-user-title" className="text-xl font-bold">Invite a User</h2>
                <p className="mt-1 text-sm text-white/50">They’ll receive an email from Clerk with a secure account-creation link.</p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={status === 'sending'}
                className="rounded-lg px-2 py-1 text-xl text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-40"
                aria-label="Close invitation form"
              >
                ×
              </button>
            </div>

            {status === 'sent' ? (
              <div>
                <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">{message}</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 w-full rounded-lg bg-[#5d00f5] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#7130f7]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label htmlFor="invite-email" className="mb-2 block text-sm font-semibold">Email address</label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="person@example.com"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#8f5cff]"
                />
                {status === 'error' && (
                  <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{message}</p>
                )}
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    disabled={status === 'sending'}
                    className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="rounded-lg bg-[#5d00f5] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#7130f7] disabled:cursor-wait disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
