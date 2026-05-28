import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { getAdminEmails } from '@/lib/admin'
import { db } from '@/lib/db'
import { users, userProfiles } from '@/lib/schema'
import { eq, isNull, or, sql } from 'drizzle-orm'
import { upsertProfile } from '@/lib/members'

export async function POST() {
  const me = await currentUser()
  if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const myEmail = me.emailAddresses.find(e => e.id === me.primaryEmailAddressId)?.emailAddress?.toLowerCase() ?? ''
  if (!getAdminEmails().includes(myEmail)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  // Find users with missing profile fields
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(or(
      isNull(userProfiles.userId),
      isNull(userProfiles.displayName),
      isNull(userProfiles.avatarUrl),
    ))

  if (rows.length === 0) {
    return Response.json({ message: 'All profiles already complete.', updated: 0 })
  }

  const results: { id: string; email: string; status: string }[] = []

  for (const { id } of rows) {
    try {
      const cu = await clerkClient.users.getUser(id)
      const displayName = [cu.firstName, cu.lastName].filter(Boolean).join(' ').trim() || null
      const avatarUrl   = cu.imageUrl || null

      // Fetch existing to avoid overwriting user-set data
      const existing = await db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, id) })
      const updates: Record<string, string | null> = {}
      if (!existing?.displayName && displayName) updates.displayName = displayName
      if (!existing?.avatarUrl   && avatarUrl)   updates.avatarUrl   = avatarUrl

      if (!existing || Object.keys(updates).length > 0) {
        await upsertProfile(id, updates)
      }

      const email = cu.emailAddresses.find(e => e.id === cu.primaryEmailAddressId)?.emailAddress ?? id
      results.push({ id, email, status: Object.keys(updates).length > 0 ? 'updated' : 'skipped' })
    } catch (err) {
      results.push({ id, email: id, status: `error: ${err}` })
    }
  }

  const updated = results.filter(r => r.status === 'updated').length
  const skipped = results.filter(r => r.status === 'skipped').length
  return Response.json({ updated, skipped, results })
}
