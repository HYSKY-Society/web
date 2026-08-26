import { currentUser } from '@clerk/nextjs/server'
import { getAdminEmails } from '@/lib/admin'
import { importZohoSnapshot } from '@/lib/zoho-crm'

export const maxDuration = 60

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const email = user.emailAddresses
    .find((entry) => entry.id === user.primaryEmailAddressId)
    ?.emailAddress?.trim().toLowerCase() ?? ''
  if (!getAdminEmails().includes(email)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    return Response.json(await importZohoSnapshot(await request.json()))
  } catch (error) {
    console.error('Zoho snapshot import failed', error)
    return Response.json({
      error: error instanceof Error ? error.message : 'Zoho snapshot import failed.',
    }, { status: 400 })
  }
}
