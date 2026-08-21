import 'server-only'

import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin'

/**
 * Authorize sensitive server-side admin operations independently of the UI.
 * Admin pages are protected too, but Server Actions must not rely on page access.
 */
export async function requireAdmin() {
  const user = await currentUser()
  if (!user) throw new Error('Unauthorized')

  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress

  if (!primaryEmail || !isAdmin(primaryEmail)) throw new Error('Forbidden')

  return user
}
