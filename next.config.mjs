/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@electric-sql/pglite'],
  async redirects() {
    return [
      { source: '/flying-hy', destination: 'https://www.hysky.org/flyinghy2026', permanent: false },
      { source: '/events/flying-hy-2026', destination: 'https://www.hysky.org/flyinghy2026', permanent: false },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.wixstatic.com', pathname: '/media/**' },
    ],
  },
}

export default nextConfig
