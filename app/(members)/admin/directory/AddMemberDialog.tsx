'use client'

import { useRef } from 'react'
import type { AddMemberState } from '@/lib/manual-members'
import AddMemberForm from './AddMemberForm'

export default function AddMemberDialog({ action }: {
  action: (state: AddMemberState, formData: FormData) => Promise<AddMemberState>
}) {
  const dialog = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className="group text-left bg-white/5 border border-white/10 hover:border-accent-cyan/50 rounded-2xl p-6 transition-all"
      >
        <div className="text-2xl mb-3">＋</div>
        <h2 className="font-semibold mb-1 group-hover:text-accent-cyan">Add member</h2>
        <p className="text-white/40 text-sm">Manually add a member to Connect and Clerk, then manage their membership.</p>
      </button>
      <dialog
        ref={dialog}
        aria-label="Add member"
        className="w-[calc(100%-2rem)] max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 p-4 text-white shadow-2xl backdrop:bg-black/60"
        style={{ background: 'var(--bg-page)' }}
      >
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close Add member" className="rounded-lg px-3 py-1 text-sm text-white/65 hover:bg-white/10">Close ×</button>
        </div>
        <AddMemberForm action={action} collapsible={false} />
      </dialog>
    </>
  )
}
