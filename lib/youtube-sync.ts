import * as https from 'https'
import { db } from './db'
import { hyskySessions, podcastEpisodes } from './schema'

export const MONTHLY_PLAYLIST = 'PL3P9ZgJ8pBRVpqyGejVMh4RO7VSQ5DbJn'
export const PODCAST_PLAYLIST  = 'PL3P9ZgJ8pBRUPecvgJnIl07My_2hPQ5Ak'

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
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

export async function syncMonthlyPlaylist(): Promise<{ inserted: number; total: number }> {
  const xml     = await httpsGet(`https://www.youtube.com/feeds/videos.xml?playlist_id=${MONTHLY_PLAYLIST}`)
  const videos  = parseRss(xml)
  const existing = await db.select({ youtubeUrl: hyskySessions.youtubeUrl }).from(hyskySessions)
  const urls    = new Set(existing.map(r => r.youtubeUrl).filter(Boolean) as string[])
  let inserted  = 0
  for (const v of videos) {
    if (urls.has(v.youtubeUrl)) continue
    await db.insert(hyskySessions).values({
      title: v.title, description: v.description || null,
      sessionDate: v.publishedAt, youtubeUrl: v.youtubeUrl, isPublished: true,
    })
    inserted++
  }
  return { inserted, total: videos.length }
}

export async function syncPodcastPlaylist(): Promise<{ inserted: number; total: number }> {
  const xml     = await httpsGet(`https://www.youtube.com/feeds/videos.xml?playlist_id=${PODCAST_PLAYLIST}`)
  const videos  = parseRss(xml)
  const existing = await db.select({ youtubeUrl: podcastEpisodes.youtubeUrl }).from(podcastEpisodes)
  const urls    = new Set(existing.map(r => r.youtubeUrl))
  const chrono  = [...videos].reverse()
  const offset  = existing.length
  let inserted  = 0
  for (const v of videos) {
    if (urls.has(v.youtubeUrl)) continue
    const epNum = chrono.findIndex(c => c.videoId === v.videoId) + 1 + offset
    await db.insert(podcastEpisodes).values({
      title: v.title, description: v.description || null,
      youtubeUrl: v.youtubeUrl, publishedAt: v.publishedAt,
      episodeNumber: epNum > 0 ? epNum : null, isPublished: true,
    })
    inserted++
  }
  return { inserted, total: videos.length }
}

// Fetch title from YouTube oEmbed (no API key required)
export async function fetchYoutubeTitle(url: string): Promise<string | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const body = await httpsGet(oembedUrl)
    const data = JSON.parse(body) as { title?: string }
    return data.title ?? null
  } catch {
    return null
  }
}
