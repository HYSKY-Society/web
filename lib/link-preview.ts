import 'server-only'

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

export type LinkPreviewData = {
  url: string
  title: string
  description: string | null
  image: string | null
  siteName: string
}

const URL_PATTERN = /https?:\/\/[^\s<]+/i
const MAX_REDIRECTS = 3
const MAX_HTML_BYTES = 512_000

function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_PATTERN)?.[0]
  return match ? match.replace(/[),.!?;:'"\]]+$/, '') : null
}

function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase()
  if (normalized === '::1' || normalized === '::' || normalized.startsWith('fe80:')) return true
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true
  if (normalized.startsWith('::ffff:')) return isPrivateAddress(normalized.slice(7))
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(normalized)) return false
  const [a, b] = normalized.split('.').map(Number)
  return a === 0
    || a === 10
    || a === 127
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || a >= 224
}

async function assertPublicUrl(value: string): Promise<URL> {
  const url = new URL(value)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Unsupported protocol')
  if (url.username || url.password) throw new Error('Credentials are not allowed in preview URLs')
  const hostname = url.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Private hosts cannot be previewed')
  }
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true })
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('Private addresses cannot be previewed')
  }
  return url
}

async function readLimitedHtml(response: Response): Promise<string> {
  if (!response.body) return ''
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let size = 0
  let html = ''
  while (size < MAX_HTML_BYTES) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    html += decoder.decode(value, { stream: true })
    if (/<\/head\s*>/i.test(html)) break
  }
  await reader.cancel().catch(() => {})
  return html + decoder.decode()
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

function getAttribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? '') : null
}

function getMeta(html: string, keys: string[]): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = (getAttribute(tag, 'property') ?? getAttribute(tag, 'name') ?? '').toLowerCase()
    if (keys.includes(key)) {
      const content = getAttribute(tag, 'content')
      if (content) return content
    }
  }
  return null
}

function getTitle(html: string): string | null {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  return match ? decodeHtml(match[1].replace(/<[^>]+>/g, '')) : null
}

function normalizeAssetUrl(value: string | null, pageUrl: URL): string | null {
  if (!value) return null
  try {
    const url = new URL(value, pageUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export async function fetchLinkPreview(text: string): Promise<LinkPreviewData | null> {
  const firstUrl = extractFirstUrl(text)
  if (!firstUrl) return null

  try {
    let currentUrl = await assertPublicUrl(firstUrl)
    let response: Response | null = null

    for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(6000),
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; HySkyConnect/1.0; +https://connect.hysky.org)',
          accept: 'text/html,application/xhtml+xml',
        },
        next: { revalidate: 86400 },
      })
      if (![301, 302, 303, 307, 308].includes(response.status)) break
      const location = response.headers.get('location')
      if (!location || redirect === MAX_REDIRECTS) throw new Error('Too many redirects')
      currentUrl = await assertPublicUrl(new URL(location, currentUrl).toString())
    }

    if (!response?.ok) throw new Error('Preview request failed')
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error('Preview URL is not an HTML page')
    }

    const html = await readLimitedHtml(response)
    const title = getMeta(html, ['og:title', 'twitter:title']) ?? getTitle(html)
    const description = getMeta(html, ['og:description', 'twitter:description', 'description'])
    const image = normalizeAssetUrl(getMeta(html, ['og:image', 'twitter:image', 'twitter:image:src']), currentUrl)
    const siteName = getMeta(html, ['og:site_name']) ?? currentUrl.hostname.replace(/^www\./, '')

    return {
      url: currentUrl.toString(),
      title: (title ?? siteName).slice(0, 240),
      description: description?.slice(0, 320) ?? null,
      image,
      siteName: siteName.slice(0, 120),
    }
  } catch {
    try {
      const url = new URL(firstUrl)
      return {
        url: url.toString(),
        title: url.hostname.replace(/^www\./, ''),
        description: null,
        image: null,
        siteName: url.hostname.replace(/^www\./, ''),
      }
    } catch {
      return null
    }
  }
}

