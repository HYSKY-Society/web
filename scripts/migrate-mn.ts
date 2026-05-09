#!/usr/bin/env tsx
/**
 * Mighty Networks → Neon DB migration
 *
 * Usage:
 *   DATABASE_URL=... MN_API_KEY=... npx tsx scripts/migrate-mn.ts
 *
 * What it does:
 *  1. Fetches every plan's member list from MN
 *  2. Maps each plan → tier / course slugs / event slugs
 *  3. Upserts into pending_tiers (applied automatically on first Clerk sign-in)
 *  4. Upserts VIP members into sponsors table
 */

import * as https from 'https'
import { db } from '../lib/db'
import { pendingTiers, sponsors } from '../lib/schema'

const BASE    = 'https://api.mn.co/admin/v1'
const NETWORK = '8343683'
const TOKEN   = process.env.MN_API_KEY

if (!TOKEN) {
  console.error('ERROR: set MN_API_KEY env var')
  process.exit(1)
}

// ── Plan → access mapping ─────────────────────────────────────────────────────
// tier priority: member_full(5) > member_courses_events(4) > member_courses(3) > instructor(2) > free(1)
const TIER_RANK: Record<string, number> = {
  member_full: 5, member_courses_events: 4, member_courses: 3, instructor: 2, free: 1,
}

const PLAN_MAP: Record<number, { tier?: string; course?: string; event?: string; vipTier?: string }> = {
  1538717: { tier: 'member_full',    vipTier: 'vip_platinum'   }, // Platinum $7500
  1538722: { tier: 'member_full',    vipTier: 'vip_gold'       }, // Gold $5000
  1538727: { tier: 'member_full',    vipTier: 'vip_silver'     }, // Silver $3000
  1538729: { tier: 'member_full',    vipTier: 'vip_bronze'     }, // Bronze $1500
  1538730: { tier: 'member_full',    vipTier: 'vip_copper'     }, // Copper $750
  1538731: { tier: 'member_full',    vipTier: 'vip_startup'    }, // Startup $500
  1538740: { tier: 'member_full',    vipTier: 'vip_early_bird' }, // Early Bird VIP $250
  1541703: { tier: 'member_courses', course: 'h2-aircraft-certification' },
  1867930: { tier: 'free'                                       }, // Free Member Hub
  1867935: { tier: 'member_full',    vipTier: 'vip_free'       }, // Company Directory
  1867940: { tier: 'free'                                       }, // HYSKY Monthly
  1874703: { tier: 'instructor'                                 }, // Instructor 2025
  1894893: { tier: 'member_full',    vipTier: 'vip_free'       }, // Free VIP
  1904470: { tier: 'member_courses', course: 'hydrogen-safety-aviation' },
  1966695: { tier: 'member_courses', course: 'h2-aviation-policy-power' },
  1967257: { event: 'flying-hy-2025'                           }, // FLYING HY 2025
}

// ── API helpers ───────────────────────────────────────────────────────────────
function httpsGet(urlStr: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } }, (res) => {
      let body = ''
      res.on('data', (chunk: Buffer) => { body += chunk.toString() })
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body }))
    })
    req.setTimeout(15000, () => { req.destroy(new Error('Request timed out')) })
    req.on('error', reject)
  })
}

async function mnGet(path: string, params: Record<string, string | number> = {}, retries = 3): Promise<Record<string, unknown>> {
  const url = new URL(`${BASE}${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  const { status, body } = await httpsGet(url.toString())
  if (status === 429 && retries > 0) {
    console.log(`    ⏳  Rate limited — waiting 65s…`)
    await new Promise(r => setTimeout(r, 65000))
    return mnGet(path, params, retries - 1)
  }
  if (status < 200 || status >= 300) throw new Error(`MN ${path}: ${status} — ${body}`)
  return JSON.parse(body) as Record<string, unknown>
}

async function fetchAll(path: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = []
  let page = 1
  while (true) {
    const data = await mnGet(path, { per_page: 100, page })
    const batch = (data.items as Record<string, unknown>[]) ?? []
    items.push(...batch)
    if (batch.length < 100) break  // MN always returns next link — stop when page is not full
    page++
    await new Promise(r => setTimeout(r, 400)) // stay under 200 req/min
  }
  return items
}

// ── Member record ─────────────────────────────────────────────────────────────
interface MemberRecord {
  email: string
  name: string
  mnId: string
  tier: string
  courses: string[]
  events: string[]
  vipTier?: string
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  Starting Mighty Networks → Neon migration\n')

  // 1. Fetch all plans
  console.log('📋  Fetching plans…')
  const plans = await fetchAll(`/networks/${NETWORK}/plans`)
  console.log(`    ${plans.length} plans found\n`)

  // 2. Build member map by iterating each plan's member list
  const map = new Map<string, MemberRecord>()

  for (const plan of plans) {
    const planId = plan.id as number
    const mapping = PLAN_MAP[planId]
    if (!mapping) {
      console.log(`    ⚠  No mapping for "${plan.name}" (${planId}) — skipping`)
      continue
    }

    process.stdout.write(`📥  ${plan.name}… `)
    const members = await fetchAll(`/networks/${NETWORK}/plans/${planId}/members`)
    console.log(`${members.length} members`)

    for (const m of members) {
      const email = (m.email as string | undefined)?.toLowerCase().trim()
      if (!email) continue

      const rec: MemberRecord = map.get(email) ?? {
        email,
        name: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
        mnId: String(m.id),
        tier: 'free',
        courses: [],
        events: [],
      }

      if (mapping.tier && (TIER_RANK[mapping.tier] ?? 0) > (TIER_RANK[rec.tier] ?? 0)) {
        rec.tier = mapping.tier
      }
      if (mapping.vipTier && !rec.vipTier) rec.vipTier = mapping.vipTier
      if (mapping.course && !rec.courses.includes(mapping.course)) rec.courses.push(mapping.course)
      if (mapping.event  && !rec.events.includes(mapping.event))   rec.events.push(mapping.event)

      map.set(email, rec)
    }
  }

  // 3. Catch any members not on any paid plan (free tier baseline)
  console.log('\n📥  All network members (baseline)…')
  const allMembers = await fetchAll(`/networks/${NETWORK}/members`)
  console.log(`    ${allMembers.length} total network members`)
  for (const m of allMembers) {
    const email = (m.email as string | undefined)?.toLowerCase().trim()
    if (!email || map.has(email)) continue
    map.set(email, {
      email,
      name: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
      mnId: String(m.id),
      tier: 'free',
      courses: [],
      events: [],
    })
  }

  const records = Array.from(map.values())
  console.log(`\n📊  Unique members to migrate: ${records.length}`)

  // 4. Upsert into pending_tiers
  console.log('\n💾  Writing to pending_tiers…')
  for (const r of records) {
    await db.insert(pendingTiers).values({
      email:       r.email,
      tier:        r.tier,
      name:        r.name || null,
      mnMemberId:  r.mnId,
      courseSlugs: JSON.stringify(r.courses),
      eventSlugs:  JSON.stringify(r.events),
    }).onConflictDoUpdate({
      target: pendingTiers.email,
      set: {
        tier:        r.tier,
        courseSlugs: JSON.stringify(r.courses),
        eventSlugs:  JSON.stringify(r.events),
      },
    })
  }
  console.log(`    ✅  ${records.length} records upserted`)

  // 5. Upsert VIP members into sponsors table (name only — details filled in admin UI)
  const vipRecords = records.filter(r => r.vipTier)
  if (vipRecords.length) {
    console.log(`\n🏢  Upserting ${vipRecords.length} VIP members into sponsors…`)
    for (const r of vipRecords) {
      await db.insert(sponsors).values({
        name:    r.name || r.email,
        tier:    r.vipTier!,
        isActive: true,
      }).onConflictDoNothing()
    }
    console.log('    ✅  Done')
  }

  // 6. Summary
  const counts: Record<string, number> = {}
  for (const r of records) counts[r.tier] = (counts[r.tier] ?? 0) + 1
  console.log('\n📈  By tier:')
  for (const [t, c] of Object.entries(counts).sort((a, b) => (TIER_RANK[b[0]] ?? 0) - (TIER_RANK[a[0]] ?? 0))) {
    console.log(`    ${t.padEnd(28)} ${c}`)
  }
  console.log(`\n✅  Migration complete. Members will receive their tiers on first sign-in.`)
}

main().catch(err => { console.error(err); process.exit(1) })
