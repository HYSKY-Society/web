import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    sitemap: 'https://news.hysky.org/sitemap.xml',
    host: 'https://news.hysky.org',
  }
}
