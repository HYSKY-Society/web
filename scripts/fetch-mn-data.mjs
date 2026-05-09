#!/usr/bin/env node
// Step 1: Fetch all MN data and save to migration-data.json
// Usage: MN_API_KEY=... node scripts/fetch-mn-data.mjs

import https from 'https'
import fs from 'fs'

const NETWORK = '8343683'
const TOKEN = process.env.MN_API_KEY
if (!TOKEN) { console.error('Set MN_API_KEY'); process.exit(1) }

function get(urlStr) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' }
    }, res => {
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => resolve({ status: res.statusCode, body }))
    })
    req.setTimeout(15000, () => { req.destroy(new Error('timeout')) })
    req.on('error', reject)
  })
}

async function mnGet(path, params = {}, retries = 4) {
  const url = new URL(`https://api.mn.co/admin/v1${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  const { status, body } = await get(url.toString())
  if (status === 429) {
    if (retries === 0) throw new Error('Rate limit retries exhausted')
    process.stdout.write(` [429 wait 65s] `)
    await new Promise(r => setTimeout(r, 65000))
    return mnGet(path, params, retries - 1)
  }
  if (status < 200 || status >= 300) throw new Error(`${path}: ${status} — ${body}`)
  return JSON.parse(body)
}

async function fetchAll(path) {
  const items = []
  let page = 1
  while (true) {
    const data = await mnGet(path, { per_page: 100, page })
    const batch = data.items ?? []
    items.push(...batch)
    if (batch.length < 100) break  // MN always returns next link — stop when page is not full
    page++
    await new Promise(r => setTimeout(r, 400))
  }
  return items
}

async function main() {
  console.log('Fetching plans...')
  const plans = await fetchAll(`/networks/${NETWORK}/plans`)
  console.log(`  ${plans.length} plans`)

  const planMembers = {}
  for (const plan of plans) {
    process.stdout.write(`Fetching members for: ${plan.name}... `)
    const members = await fetchAll(`/networks/${NETWORK}/plans/${plan.id}/members`)
    planMembers[plan.id] = { name: plan.name, members }
    console.log(`${members.length}`)
  }

  console.log('Fetching all members...')
  const allMembers = await fetchAll(`/networks/${NETWORK}/members`)
  console.log(`  ${allMembers.length} total`)

  const output = { plans, planMembers, allMembers }
  fs.writeFileSync('scripts/migration-data.json', JSON.stringify(output, null, 2))
  console.log('Saved to scripts/migration-data.json')
}

main().catch(e => { console.error(e); process.exit(1) })
