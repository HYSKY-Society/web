import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fetchWhitelistedEmails } from '@/lib/members'

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export default async function AdminPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const userEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''

  if (!getAdminEmails().includes(userEmail)) redirect('/dashboard')

  // Fetch sheet emails and Clerk users in parallel
  const [sheetEmails, clerkUsersRes] = await Promise.all([
    fetchWhitelistedEmails(),
    clerkClient.users.getUserList({ limit: 200, orderBy: '-created_at' }),
  ])

  const clerkUsers = clerkUsersRes.data ?? []

  // Build a set of emails that have signed up in Clerk
  const signedUpEmailSet = new Set(
    clerkUsers.flatMap((u) => u.emailAddresses.map((e) => e.emailAddress.toLowerCase()))
  )

  const sheetList = [...sheetEmails].sort()
  const activeMembers = sheetList.filter((e) => signedUpEmailSet.has(e))
  const pendingMembers = sheetList.filter((e) => !signedUpEmailSet.has(e))
  const unauthorizedUsers = clerkUsers.filter((u) => {
    const email = u.emailAddresses
      .find((e) => e.id === u.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase()
    return email && !sheetEmails.has(email)
  })

  const sheetUrl = process.env.GOOGLE_SHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/edit`
    : null

  return (
    <div className="text-white max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1.5">Member Overview</h1>
          <p className="text-white/40 text-sm">
            Source of truth is the Google Sheet. Changes reflect within 5 minutes.
          </p>
        </div>
        {sheetUrl && (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white/70 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <span>📊</span> Open Sheet
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'In Sheet', value: sheetList.length, color: 'text-[#5d00f5]' },
          { label: 'Active', value: activeMembers.length, color: 'text-emerald-400' },
          { label: 'Pending Sign-up', value: pendingMembers.length, color: 'text-amber-400' },
          { label: 'Unauthorized', value: unauthorizedUsers.length, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active members */}
      <Section
        title="Active Members"
        subtitle="In the Google Sheet and have signed up"
        badge={activeMembers.length}
        badgeColor="text-emerald-400"
        empty="No active members yet."
      >
        {activeMembers.map((email) => (
          <Row key={email}>
            <span className="font-mono text-sm text-white/80">{email}</span>
            <StatusPill color="emerald">Active</StatusPill>
          </Row>
        ))}
      </Section>

      {/* Pending sign-up */}
      <Section
        title="Pending Sign-up"
        subtitle="In the sheet but haven't created an account yet"
        badge={pendingMembers.length}
        badgeColor="text-amber-400"
        empty="Everyone in the sheet has signed up."
      >
        {pendingMembers.map((email) => (
          <Row key={email}>
            <span className="font-mono text-sm text-white/55">{email}</span>
            <StatusPill color="amber">Pending</StatusPill>
          </Row>
        ))}
      </Section>

      {/* Unauthorized attempts */}
      <Section
        title="Unauthorized Accounts"
        subtitle="Signed up with Clerk but not in the Google Sheet — cannot access the site"
        badge={unauthorizedUsers.length}
        badgeColor="text-red-400"
        empty="No unauthorized accounts."
      >
        {unauthorizedUsers.map((u) => {
          const email =
            u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ??
            u.emailAddresses[0]?.emailAddress ??
            '(unknown)'
          return (
            <Row key={u.id}>
              <span className="font-mono text-sm text-white/55">{email}</span>
              <StatusPill color="red">No access</StatusPill>
            </Row>
          )
        })}
      </Section>
    </div>
  )
}

// ─── Small shared components ──────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  badge,
  badgeColor,
  empty,
  children,
}: {
  title: string
  subtitle: string
  badge: number
  badgeColor: string
  empty: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-semibold">{title}</h2>
        <span className={`text-sm font-normal ${badgeColor}`}>{badge}</span>
      </div>
      <p className="text-white/35 text-xs mb-5">{subtitle}</p>
      {badge === 0 ? (
        <p className="text-white/25 text-sm text-center py-6">{empty}</p>
      ) : (
        <div className="divide-y divide-white/5">{children}</div>
      )}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between py-2.5">{children}</div>
}

function StatusPill({
  color,
  children,
}: {
  color: 'emerald' | 'amber' | 'red'
  children: React.ReactNode
}) {
  const styles = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
  }
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${styles[color]}`}>
      {children}
    </span>
  )
}
