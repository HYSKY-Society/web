import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { users, pendingTiers } from '@/lib/schema'
import { getAdminEmails, ADMIN_NAV } from '@/lib/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://connect.hysky.org'

async function inviteUser(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  if (!email) return
  try {
    await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: APP_URL + '/feed',
      notify: true,
    })
  } catch (_) {
    // already invited or already has an account — silently continue
  }
  revalidatePath('/admin/migration')
}

async function inviteAll(formData: FormData) {
  'use server'
  const emailsJson = formData.get('emails') as string
  const emails: string[] = JSON.parse(emailsJson || '[]')
  if (!emails.length) return

  // Send in batches of 10 with 400ms between batches to stay under Clerk rate limits
  const BATCH = 10
  const DELAY = 400
  for (let i = 0; i < emails.length; i += BATCH) {
    await Promise.allSettled(
      emails.slice(i, i + BATCH).map((email) =>
        clerkClient.invitations.createInvitation({
          emailAddress: email,
          redirectUrl: APP_URL + '/feed',
          notify: true,
        })
      )
    )
    if (i + BATCH < emails.length) {
      await new Promise<void>((resolve) => setTimeout(resolve, DELAY))
    }
  }
  revalidatePath('/admin/migration')
}

type RowStatus = 'active' | 'invited' | 'needs_invite'

const STATUS_LABEL: Record<RowStatus, string> = {
  active:       'Active',
  invited:      'Invited',
  needs_invite: 'Needs Invite',
}
const STATUS_COLOR: Record<RowStatus, string> = {
  active:       'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  invited:      'bg-amber-500/15 text-amber-400 border-amber-500/30',
  needs_invite: 'bg-white/6 text-white/50 border-white/10',
}

export default async function MigrationPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const userEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''

  if (!getAdminEmails().includes(userEmail)) redirect('/dashboard')

  const [pendingRows, activeUsers] = await Promise.all([
    db.select().from(pendingTiers),
    db.select({ email: users.email }).from(users),
  ])

  // Wrap separately — Clerk may be rate-limited right after a bulk invite
  let invitationsRes: { data: { status: string; emailAddress: string }[] } = { data: [] }
  try {
    invitationsRes = await clerkClient.invitations.getInvitationList({ limit: 500 })
  } catch {
    // Rate limited or API error — invitation status will show as unknown this render
  }

  const activeEmails = new Set(activeUsers.map((u) => u.email.toLowerCase()))
  const invitedEmails = new Set(
    (invitationsRes.data ?? [])
      .filter((i) => i.status === 'pending')
      .map((i) => i.emailAddress.toLowerCase())
  )

  const rows = pendingRows
    .map((p) => ({
      email:  p.email,
      name:   p.name,
      tier:   p.tier,
      status: (activeEmails.has(p.email.toLowerCase())
        ? 'active'
        : invitedEmails.has(p.email.toLowerCase())
          ? 'invited'
          : 'needs_invite') as RowStatus,
    }))
    .sort((a, b) => {
      const o: Record<RowStatus, number> = { needs_invite: 0, invited: 1, active: 2 }
      return o[a.status] - o[b.status]
    })

  const needsInviteCount = rows.filter((r) => r.status === 'needs_invite').length
  const invitedCount     = rows.filter((r) => r.status === 'invited').length
  const activeCount      = rows.filter((r) => r.status === 'active').length

  const needsInviteEmails = rows
    .filter((r) => r.status === 'needs_invite')
    .map((r) => r.email)

  const stats = [
    { label: 'Migrated Members', value: rows.length,        color: 'text-[#5d00f5]' },
    { label: 'Needs Invite',     value: needsInviteCount,   color: 'text-white/60' },
    { label: 'Invited',          value: invitedCount,        color: 'text-amber-400' },
    { label: 'Active',           value: activeCount,         color: 'text-emerald-400' },
  ]

  return (
    <div className="text-white max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Member Migration</h1>
        <p className="text-white/40 text-sm">
          Send Clerk sign-up invitations to migrated Mighty Networks members.
        </p>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 w-fit flex-wrap">
        {ADMIN_NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              l.href === '/admin/migration'
                ? 'bg-[#5d00f5] text-white'
                : 'text-white/50 hover:text-white'
            }`}
            {...(l.href === '/admin/migration' ? { style: { color: '#fff' } } : {})}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bulk invite */}
      <div className="flex items-center gap-4 mb-6">
        <form action={inviteAll}>
          <input type="hidden" name="emails" value={JSON.stringify(needsInviteEmails)} />
          <button
            type="submit"
            disabled={needsInviteCount === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#5d00f5] hover:bg-[#7b33ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ color: '#fff' }}
          >
            Invite All Pending ({needsInviteCount})
          </button>
        </form>
        <p className="text-white/30 text-xs">
          Sends a Clerk sign-up email to every member that hasn&apos;t been invited yet.
        </p>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/30">No migrated members found in the database.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Tier</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.email}
                    className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                  >
                    <td className="px-4 py-3 text-white/80 font-mono text-xs">{row.email}</td>
                    <td className="px-4 py-3 text-white/55">{row.name || <span className="text-white/20">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-white/40">{row.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[row.status]}`}>
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.status !== 'active' && (
                        <form action={inviteUser} className="inline">
                          <input type="hidden" name="email" value={row.email} />
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-white/8 hover:bg-[#5d00f5]/30 hover:text-white text-white/60 transition-colors border border-white/10"
                          >
                            {row.status === 'invited' ? 'Resend' : 'Send Invite'}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
