/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@electric-sql/pglite'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.wixstatic.com', pathname: '/media/**' },
    ],
  },
}

export default nextConfig
