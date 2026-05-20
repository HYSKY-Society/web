import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { getAdminEmails } from '@/lib/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://connect.hysky.org'

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userEmail =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(userEmail)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { emails } = await req.json() as { emails: string[] }
  if (!Array.isArray(emails) || emails.length === 0) return Response.json({ sent: 0, errors: 0 })

  let sent = 0
  let errors = 0

  await Promise.allSettled(
    emails.map(async (email: string) => {
      try {
        await clerkClient.invitations.createInvitation({
          emailAddress: email,
          redirectUrl: APP_URL + '/feed',
          notify: true,
        })
        sent++
      } catch {
        errors++
      }
    })
  )

  return Response.json({ sent, errors })
}
