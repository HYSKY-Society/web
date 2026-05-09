#!/usr/bin/env tsx
/**
 * Sync YouTube playlist RSS feeds → Neon DB
 * Uses YouTube's public Atom feed — no API key required (returns ~15 most recent videos)
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/sync-youtube.ts
 */

import * as https from 'https'
import { db } from '../lib/db'
import { hyskySessions, podcastEpisodes } from '../lib/schema'

const PLAYLISTS = {
  monthly: 'PL3P9ZgJ8pBRVpqyGejVMh4RO7VSQ5DbJn',
  podcast: 'PL3P9ZgJ8pBRUPecvgJnIl07My_2hPQ5Ak',
}

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/xml,text/xml,*/*' } }, res => {
      let body = ''
      res.on('data', (c: Buffer) => body += c.toString())
      res.on('end', () => resolve(body))
    }).on('error', reject)
  })
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
}

interface VideoEntry {
  videoId:     string
  title:       string
  description: string
  publishedAt: Date
  youtubeUrl:  string
}

function parseRss(xml: string): VideoEntry[] {
  const entries: VideoEntry[] = []
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g
  let m
  while ((m = entryRe.exec(xml)) !== null) {
    const e = m[1]
    const vid   = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim()
    const title = e.match(/<media:title>([\s\S]*?)<\/media:title>/)?.[1]
                ?? e.match(/<title>([^<]*)<\/title>/)?.[1]
    const desc  = e.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? ''
    const pub   = e.match(/<published>([^<]+)<\/published>/)?.[1]?.trim()
    if (!vid || !title || !pub) continue
    entries.push({
      videoId:     vid,
      title:       decodeXml(title.trim()),
      description: decodeXml(desc.trim()),
      publishedAt: new Date(pub),
      youtubeUrl:  `https://www.youtube.com/watch?v=${vid}`,
    })
  }
  return entries
}

async function main() {
  console.log('🎬  YouTube Playlist Sync\n')

  // ── HYSKY Monthly ──────────────────────────────────────────────────────────
  console.log('📅  Fetching HYSKY Monthly RSS feed...')
  const monthlyXml  = await httpsGet(`https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLISTS.monthly}`)
  const monthlyVids = parseRss(monthlyXml)
  console.log(`    ${monthlyVids.length} videos in feed`)

  const existingSessions = await db.select({ youtubeUrl: hyskySessions.youtubeUrl }).from(hyskySessions)
  const sessionUrls = new Set(existingSessions.map(r => r.youtubeUrl).filter(Boolean) as string[])

  let mNew = 0
  for (const v of monthlyVids) {
    if (sessionUrls.has(v.youtubeUrl)) continue
    await db.insert(hyskySessions).values({
      title:       v.title,
      description: v.description || null,
      sessionDate: v.publishedAt,
      youtubeUrl:  v.youtubeUrl,
      isPublished: true,
    })
    mNew++
    console.log(`    + ${v.title}`)
  }
  console.log(`    ✅  ${mNew} inserted, ${monthlyVids.length - mNew} already existed\n`)

  // ── HYSKY Podcast ──────────────────────────────────────────────────────────
  console.log('🎙  Fetching HYSKY Pod RSS feed...')
  const podcastXml  = await httpsGet(`https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLISTS.podcast}`)
  const podcastVids = parseRss(podcastXml)
  console.log(`    ${podcastVids.length} videos in feed`)

  const existingEps = await db.select({ youtubeUrl: podcastEpisodes.youtubeUrl }).from(podcastEpisodes)
  const episodeUrls = new Set(existingEps.map(r => r.youtubeUrl))

  // Chronological order for episode numbering
  const chrono    = [...podcastVids].reverse()
  const epOffset  = existingEps.length

  let pNew = 0
  for (const v of podcastVids) {
    if (episodeUrls.has(v.youtubeUrl)) continue
    const epNum = chrono.findIndex(c => c.videoId === v.videoId) + 1 + epOffset
    await db.insert(podcastEpisodes).values({
      title:         v.title,
      description:   v.description || null,
      youtubeUrl:    v.youtubeUrl,
      publishedAt:   v.publishedAt,
      episodeNumber: epNum > 0 ? epNum : null,
      isPublished:   true,
    })
    pNew++
    console.log(`    + [Ep ${epNum}] ${v.title}`)
  }
  console.log(`    ✅  ${pNew} inserted, ${podcastVids.length - pNew} already existed\n`)

  console.log('✅  Sync complete.')
}

main().catch(e => { console.error(e); process.exit(1) })
