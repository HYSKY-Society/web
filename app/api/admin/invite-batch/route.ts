import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { getAdminEmails } from '@/lib/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://connect.hysky.org'

type Result = { email: string; ok: boolean; error?: string }

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userEmail =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(userEmail)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { emails } = await req.json() as { emails: string[] }
  if (!Array.isArray(emails) || emails.length === 0) return Response.json({ sent: 0, errors: 0, results: [] })

  const results: Result[] = []

  await Promise.allSettled(
    emails.map(async (email: string) => {
      try {
        await clerkClient.invitations.createInvitation({
          emailAddress: email,
          redirectUrl: APP_URL + '/feed',
          notify: true,
        })
        results.push({ email, ok: true })
      } catch (err: unknown) {
        // Clerk SDK wraps errors — extract the most useful message
        let msg = 'Unknown error'
        if (err && typeof err === 'object') {
          // Clerk ClerkAPIResponseError has .errors array
          const clerkErr = err as { errors?: { message: string; longMessage?: string; code?: string }[]; message?: string; status?: number }
          if (clerkErr.errors?.length) {
            msg = clerkErr.errors.map(e => e.longMessage ?? e.message).join('; ')
          } else if (clerkErr.message) {
            msg = clerkErr.message
          }
        }
        results.push({ email, ok: false, error: msg })
      }
    })
  )

  const sent   = results.filter(r => r.ok).length
  const errors = results.filter(r => !r.ok).length

  return Response.json({ sent, errors, results })
}
