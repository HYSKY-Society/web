import { notFound } from 'next/navigation'
import AddMemberForm from '../../../app/(members)/admin/directory/AddMemberForm'
import { addPreviewMember } from './actions'
import { store } from './store'

export const dynamic = 'force-dynamic'

export default function LocalMemberPreview() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
        Local test only — same Add member form and validation, with mock Clerk and an in-memory member list. Nothing reaches Neon, Vercel, or Clerk. Test records reset when this preview restarts.
      </div>
      <h1 className="mb-2 text-3xl font-bold">Directory Management</h1>
      <p className="mb-6 text-sm text-white/55">Testing as d@hy-sky.net. Add a Free or VIP member, then submit the same email again to check duplicate protection.</p>
      <AddMemberForm action={addPreviewMember} />
      <h2 className="mb-3 font-semibold">Local members ({store.members.size}) · Mock Clerk accounts ({store.identities.size})</h2>
      {[...store.members.values()].map((member) => (
        <article key={member.id} className="mb-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-semibold">{member.name || 'Unnamed member'} <span className="ml-2 text-sm text-[#13dce8]">{member.tier === 'member_full' ? 'VIP member' : member.tier === 'free' ? 'Free' : member.tier}</span></p>
          <p className="text-sm text-white/55">{member.email}</p>
          <p className="mt-1 text-xs text-white/35">Mock Clerk ID: {member.id}</p>
        </article>
      ))}
    </main>
  )
}
