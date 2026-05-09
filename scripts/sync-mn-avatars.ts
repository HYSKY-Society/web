#!/usr/bin/env tsx
/**
 * Sync MN profile photo URLs into pending_tiers.avatar_url
 * Run this once to backfill avatars from MN API.
 *
 * Usage:
 *   DATABASE_URL=... MN_API_KEY=... npx tsx scripts/sync-mn-avatars.ts
 */

import * as https from 'https'
import { db } from '../lib/db'
import { pendingTiers } from '../lib/schema'
import { eq, isNull } from 'drizzle-orm'

const BASE    = 'https://api.mn.co/admin/v1'
const NETWORK = '8343683'
const TOKEN   = process.env.MN_API_KEY

if (!TOKEN) { console.error('ERROR: set MN_API_KEY env var'); process.exit(1) }

function httpsGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } }, res => {
      let body = ''
      res.on('data', (c: Buffer) => body += c.toString())
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body }))
    })
    req.setTimeout(15000, () => req.destroy(new Error('timeout')))
    req.on('error', reject)
  })
}

async function fetchAll(path: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = []
  let page = 1
  while (true) {
    const url = new URL(`${BASE}${path}`)
    url.searchParams.set('per_page', '100')
    url.searchParams.set('page', String(page))
    const { status, body } = await httpsGet(url.toString())
    if (status === 429) {
      console.log('Rate limited — waiting 65s…')
      await new Promise(r => setTimeout(r, 65000))
      continue
    }
    if (status < 200 || status >= 300) throw new Error(`${path}: ${status}`)
    const data = JSON.parse(body) as { items?: Record<string, unknown>[] }
    const batch = data.items ?? []
    items.push(...batch)
    if (batch.length < 100) break
    page++
    await new Promise(r => setTimeout(r, 400))
  }
  return items
}

async function main() {
  console.log('🖼  Syncing MN profile photos → pending_tiers\n')

  // Log first member object to identify the correct avatar field
  console.log('📋  Fetching member list (first page to inspect fields)…')
  const url = new URL(`${BASE}/networks/${NETWORK}/members`)
  url.searchParams.set('per_page', '1')
  const { body } = await httpsGet(url.toString())
  const sample = JSON.parse(body) as { items?: Record<string, unknown>[] }
  if (sample.items?.[0]) {
    const keys = Object.keys(sample.items[0])
    console.log('    Available fields:', keys.join(', '))
    const avatarField = keys.find(k => k.toLowerCase().includes('photo') || k.toLowerCase().includes('avatar') || k.toLowerCase().includes('image'))
    console.log('    Detected avatar field:', avatarField ?? 'none found')
  }

  console.log('\n📥  Fetching all members…')
  const members = await fetchAll(`/networks/${NETWORK}/members`)
  console.log(`    ${members.length} members fetched`)

  // Build email → avatar map (try multiple field names)
  const avatarMap = new Map<string, string>()
  for (const m of members) {
    const email = (m.email as string | undefined)?.toLowerCase().trim()
    if (!email) continue
    const url = (m.profile_photo_url as string | undefined)
             ?? (m.avatar_url as string | undefined)
             ?? (m.profile_image_url as string | undefined)
             ?? (m.photo_url as string | undefined)
    if (url) avatarMap.set(email, url)
  }
  console.log(`    ${avatarMap.size} members have avatar URLs`)

  // Update pending_tiers
  const pending = await db.select({ email: pendingTiers.email }).from(pendingTiers)
  let updated = 0, notFound = 0
  for (const row of pending) {
    const url = avatarMap.get(row.email)
    if (url) {
      await db.update(pendingTiers).set({ avatarUrl: url }).where(eq(pendingTiers.email, row.email))
      updated++
    } else {
      notFound++
    }
  }

  console.log(`\n✅  Updated ${updated} avatars (${notFound} pending members had no avatar in MN)`)
}

main().catch(e => { console.error(e); process.exit(1) })
