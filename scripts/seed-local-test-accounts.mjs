import nextEnv from '@next/env'
import { PGlite } from '@electric-sql/pglite'

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

if (
  process.env.LOCAL_DATABASE !== 'pglite' ||
  !process.env.CLERK_SECRET_KEY?.startsWith('sk_test_') ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_')
) {
  throw new Error('This script requires the local PGlite database and Clerk development keys.')
}

const accounts = [
  { email: 'd@hy-sky.net', tier: 'member_full' },
  { email: 'daniellemclean1@gmail.com', tier: 'free' },
]

async function findClerkUser(email) {
  const url = new URL('https://api.clerk.com/v1/users')
  url.searchParams.set('query', email)
  url.searchParams.set('limit', '10')

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!response.ok) throw new Error(`Clerk user lookup failed (${response.status}).`)

  const users = await response.json()
  const matches = users.filter((user) =>
    user.email_addresses?.some((entry) => entry.email_address?.toLowerCase() === email)
  )
  if (matches.length !== 1) {
    throw new Error(`Expected one Clerk development user for ${email}; found ${matches.length}.`)
  }
  return matches[0]
}

async function main() {
  // Resolve all identities before opening a transaction or changing local data.
  const identities = await Promise.all(
    accounts.map(async (account) => ({ ...account, user: await findClerkUser(account.email) }))
  )
  const db = new PGlite('./.local-data')

  try {
    await db.query('BEGIN')
    for (const { email, tier, user } of identities) {
      await db.query(
        `INSERT INTO users (id, email, tier)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, tier = EXCLUDED.tier`,
        [user.id, email, tier]
      )

      const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || null
      await db.query(
        `INSERT INTO user_profiles (user_id, display_name, avatar_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, name, user.image_url || null]
      )
    }
    await db.query('COMMIT')

    for (const { email, tier } of identities) {
      console.log(`${email}: ${tier === 'member_full' ? 'VIP' : 'Free'}`)
    }
    console.log('Admin access is determined separately by lib/admin.ts.')
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    await db.close()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
