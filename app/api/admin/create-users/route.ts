import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { getAdminEmails } from '@/lib/admin'

type UserInput = { email: string; firstName?: string; lastName?: string }
type Result    = { email: string; ok: boolean; error?: string }

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userEmail =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(userEmail)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { users: inputs } = await req.json() as { users: UserInput[] }
  if (!Array.isArray(inputs) || inputs.length === 0)
    return Response.json({ created: 0, errors: 0, results: [] })

  const results: Result[] = []

  await Promise.allSettled(
    inputs.map(async ({ email, firstName, lastName }) => {
      try {
        await clerkClient.users.createUser({
          emailAddress: [email],
          ...(firstName ? { firstName } : {}),
          ...(lastName  ? { lastName  } : {}),
          skipPasswordRequirement: true,
        })
        results.push({ email, ok: true })
      } catch (err: unknown) {
        let msg = 'Unknown error'
        if (err && typeof err === 'object') {
          const clerkErr = err as { errors?: { message: string; longMessage?: string }[]; message?: string }
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

  return Response.json({
    created: results.filter(r => r.ok).length,
    errors:  results.filter(r => !r.ok).length,
    results,
  })
}
