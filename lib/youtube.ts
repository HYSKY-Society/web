const PATTERNS = [
  /youtu\.be\/([^?&\s]+)/,
  /[?&]v=([^&\s]+)/,
  /youtube\.com\/live\/([^?&\s]+)/,
  /youtube\.com\/embed\/([^?&\s]+)/,
]

export function extractYouTubeId(url: string): string | null {
  for (const p of PATTERNS) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function toEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}
