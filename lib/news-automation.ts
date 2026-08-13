import { createHash, timingSafeEqual } from 'crypto'

export type AutomatedNewsDraft = {
  slug: string
  title: string
  dek: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  content: string
  sources: Array<{ name: string; url: string }>
  coverImageUrl?: string | null
  imageAltText?: string | null
  readTimeMinutes?: number | null
}

export function secretsMatch(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false
  const supplied = received.startsWith('Bearer ') ? received.slice(7) : ''
  if (!supplied) return false
  return timingSafeEqual(createHash('sha256').update(supplied).digest(), createHash('sha256').update(expected).digest())
}

export function normalizeHySky(value: string): string {
  return value.replace(/\bHYSKY\b/gi, 'HySky')
}

export function cleanSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100)
}

export function parseAutomatedDraft(body: unknown): AutomatedNewsDraft {
  if (!body || typeof body !== 'object') throw new Error('Request body must be an object.')
  const row = body as Record<string, unknown>
  const required = ['slug', 'title', 'dek', 'excerpt', 'seoTitle', 'seoDescription', 'content'] as const
  for (const field of required) {
    if (typeof row[field] !== 'string' || !(row[field] as string).trim()) throw new Error(`${field} is required.`)
  }
  if (!Array.isArray(row.keywords) || row.keywords.length === 0 || row.keywords.some(v => typeof v !== 'string')) {
    throw new Error('keywords must be a non-empty string array.')
  }
  if (!Array.isArray(row.sources) || row.sources.length < 1) throw new Error('At least one source is required.')
  const sources = row.sources.map((value) => {
    if (!value || typeof value !== 'object') throw new Error('Each source must be an object.')
    const source = value as Record<string, unknown>
    if (typeof source.name !== 'string' || typeof source.url !== 'string') throw new Error('Each source needs a name and URL.')
    const url = new URL(source.url)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Source URLs must use HTTP or HTTPS.')
    return { name: normalizeHySky(source.name.trim()), url: url.toString() }
  })
  const content = normalizeHySky((row.content as string).trim())
  const linkCount = (content.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || []).length
  if (linkCount < 1) throw new Error('The article must contain at least one authoritative link.')
  const title = normalizeHySky((row.title as string).trim())
  const h2s = [...content.matchAll(/^##\s+(.+)$/gm)].map(match => match[1]).join(' ')
  const keywords = (row.keywords as string[]).map(value => normalizeHySky(value.trim())).filter(Boolean)
  const headingText = `${title} ${h2s}`.toLowerCase()
  if (!keywords.some(keyword => headingText.includes(keyword.toLowerCase()))) {
    throw new Error('At least one focus keyword must appear in the headline or an H2 heading.')
  }
  return {
    slug: cleanSlug(row.slug as string),
    title,
    dek: normalizeHySky((row.dek as string).trim()),
    excerpt: normalizeHySky((row.excerpt as string).trim()),
    seoTitle: normalizeHySky((row.seoTitle as string).trim()),
    seoDescription: normalizeHySky((row.seoDescription as string).trim()),
    keywords,
    content,
    sources,
    coverImageUrl: typeof row.coverImageUrl === 'string' ? row.coverImageUrl.trim() || null : null,
    imageAltText: typeof row.imageAltText === 'string' ? normalizeHySky(row.imageAltText.trim()) || null : null,
    readTimeMinutes: typeof row.readTimeMinutes === 'number' ? Math.max(1, Math.round(row.readTimeMinutes)) : null,
  }
}
