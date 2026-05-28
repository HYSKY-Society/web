/**
 * One-time backfill: populate userProfiles.display_name and avatar_url from Clerk
 * for any user who is missing those fields in Neon.
 *
 * Only fills in NULL fields — never overwrites data the user has already set
 * in the Edit Profile page.
 *
 * Usage (auto-loads .env.local):
 *   node scripts/backfill-profiles.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env.local / .env
const __dir = dirname(fileURLToPath(import.meta.url))
for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(join(__dir, '..', file), 'utf8').split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i < 1) continue
      const k = t.slice(0, i).trim()
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
      if (k && !process.env[k]) process.env[k] = v
    }
  } catch {}
}

const CLERK_SECRET = process.env.CLERK_SECRET_KEY
const DATABASE_URL = process.env.DATABASE_URL

if (!CLERK_SECRET) { console.error('CLERK_SECRET_KEY not set'); process.exit(1) }
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1) }

const { neon } = await import('@neondatabase/serverless')
const sql = neon(DATABASE_URL)

// --- Clerk API helpers ---

async function clerkFetch(path) {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    headers: { Authorization: `Bearer ${CLERK_SECRET}` },
  })
  if (!res.ok) throw new Error(`Clerk ${path} → ${res.status} ${await res.text()}`)
  return res.json()
}

async function fetchAllClerkUsers() {
  const all = []
  let offset = 0
  const limit = 100
  while (true) {
    const data = await clerkFetch(`/users?limit=${limit}&offset=${offset}`)
    const page = Array.isArray(data) ? data : (data.data ?? [])
    all.push(...page)
    if (page.length < limit) break
    offset += page.length
    await new Promise(r => setTimeout(r, 100)) // stay under rate limit
  }
  return all
}

// --- Main ---

async function main() {
  console.log('Querying Neon for users with incomplete profiles...')

  const rows = await sql`
    SELECT u.id
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE up.user_id IS NULL
       OR up.display_name IS NULL
       OR up.avatar_url   IS NULL
  `

  if (rows.length === 0) {
    console.log('All profiles already complete — nothing to do.')
    return
  }

  const needsBackfill = new Set(rows.map(r => r.id))
  console.log(`${needsBackfill.size} user(s) need backfill.\n`)

  console.log('Fetching users from Clerk...')
  const clerkUsers = await fetchAllClerkUsers()
  console.log(`Fetched ${clerkUsers.length} user(s) from Clerk.\n`)

  let updated = 0, skipped = 0

  for (const cu of clerkUsers) {
    if (!needsBackfill.has(cu.id)) continue

    const displayName = [cu.first_name, cu.last_name].filter(Boolean).join(' ').trim() || null
    const avatarUrl   = cu.image_url || null
    const email       = cu.email_addresses?.find(e => e.id === cu.primary_email_address_id)?.email_address ?? cu.id

    if (!displayName && !avatarUrl) {
      console.log(`  SKIP  ${email} — no name or photo in Clerk`)
      skipped++
      continue
    }

    // INSERT … ON CONFLICT: use COALESCE so existing non-null values are never overwritten
    await sql`
      INSERT INTO user_profiles (user_id, display_name, avatar_url, updated_at)
      VALUES (${cu.id}, ${displayName}, ${avatarUrl}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = COALESCE(user_profiles.display_name, EXCLUDED.display_name),
        avatar_url   = COALESCE(user_profiles.avatar_url,   EXCLUDED.avatar_url),
        updated_at   = NOW()
    `

    console.log(`  ✓  ${email}  name=${displayName ?? '(already set)'}`)
    updated++
  }

  // Users in Neon but not found in Clerk (deleted accounts, etc.)
  const foundInClerk = new Set(clerkUsers.map(u => u.id))
  for (const id of needsBackfill) {
    if (!foundInClerk.has(id)) {
      console.log(`  WARN  ${id} is in Neon but not in Clerk`)
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`)
}

main().catch(err => { console.error(err); process.exit(1) })
