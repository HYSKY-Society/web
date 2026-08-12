import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://news.hysky.org'),
  title: { default: 'HySky News | Hydrogen & Electric Aviation', template: '%s | HySky News' },
  description: 'Original reporting on hydrogen aviation, fuel cells, eVTOL, advanced air mobility, and sustainable aviation.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'HySky News', title: 'HySky News | Hydrogen & Electric Aviation', description: 'Original reporting on hydrogen aviation, fuel cells, eVTOL, advanced air mobility, and sustainable aviation.', url: 'https://news.hysky.org' },
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
