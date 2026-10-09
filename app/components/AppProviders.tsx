'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

const clerkFreePaths = new Set([
  '/',
  '/about',
  '/courses',
  '/events',
  '/hysky-monthly',
  '/podcast', // Retired route: render the 404 page without Clerk.
  '/sponsors',
  '/donate',
])

export default function AppProviders({
  children,
  fontFamily,
}: {
  children: React.ReactNode
  fontFamily: string
}) {
  const pathname = usePathname()

  const isPublicDetail = /^\/(courses|events)\/[^/]+\/?$/.test(pathname)
  const isNewsPage = pathname === '/news' || pathname === '/news/subscribe'

  if (clerkFreePaths.has(pathname) || isPublicDetail || isNewsPage) {
    return children
  }

  return (
    <ClerkProvider
      appearance={{
        variables: { fontFamily },
        elements: { profileSection__danger: { display: 'none' } },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
