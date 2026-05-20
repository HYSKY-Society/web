import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { getAdminEmails } from '@/lib/admin'

export async function POST() {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userEmail =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(userEmail)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  // Fetch all pending invitations (up to 500)
  let invitations: { id: string; emailAddress: string; status: string }[] = []
  try {
    const res = await clerkClient.invitations.getInvitationList({ limit: 500 })
    invitations = (res.data ?? []).filter(i => i.status === 'pending')
  } catch {
    return Response.json({ error: 'Failed to fetch invitations from Clerk' }, { status: 502 })
  }

  let revoked = 0
  let errors  = 0

  await Promise.allSettled(
    invitations.map(async inv => {
      try {
        await clerkClient.invitations.revokeInvitation(inv.id)
        revoked++
      } catch {
        errors++
      }
    })
  )

  return Response.json({ revoked, errors, total: invitations.length })
}
