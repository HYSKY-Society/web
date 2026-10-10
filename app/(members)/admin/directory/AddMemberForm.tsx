'use client'

import { useState } from 'react'
import type { AddMemberState } from '@/lib/manual-members'
import SaveButton from './SaveButton'

export default function AddMemberForm({ action, collapsible = true }: {
  action: (state: AddMemberState, formData: FormData) => Promise<AddMemberState>
  collapsible?: boolean
}) {
  const [state, setState] = useState<AddMemberState>({})
  async function formAction(formData: FormData) {
    setState(await action({}, formData))
  }
  const fieldClass = 'w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan/60'
  const Container = collapsible ? 'details' : 'section'

  return (
    <Container id="add-member" className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
      {collapsible
        ? <summary className="cursor-pointer font-semibold text-accent-cyan">+ Add member</summary>
        : <h2 className="text-xl font-semibold">Add member</h2>}
      <p className="mt-3 text-sm text-white/55">Add someone manually to Connect and Clerk. Choose Free or VIP; you can change their membership later.</p>
      <form action={formAction} className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-xs font-semibold text-white/55">
            <span>Name (optional)</span>
            <input className={fieldClass} name="name" autoComplete="name" maxLength={150} />
          </label>
          <label className="space-y-1 text-xs font-semibold text-white/55">
            <span>Email address</span>
            <input className={fieldClass} name="email" type="email" autoComplete="email" required maxLength={254} />
          </label>
          <label className="space-y-1 text-xs font-semibold text-white/55">
            <span>Membership</span>
            <select className={fieldClass} name="tier" defaultValue="free">
              <option value="free">Free</option>
              <option value="member_full">VIP member</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-white/40">No email is sent. Share the Connect sign-in page with them when you’re ready.</p>
        {state.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}
        {state.message && <p role="status" className="text-sm text-emerald-200">{state.message} {state.href && <a className="underline" href={state.href}>Edit member →</a>}</p>}
        <SaveButton>Add member</SaveButton>
      </form>
    </Container>
  )
}
