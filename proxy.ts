import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

const clerkFreePublicPaths = new Set([
  '/about',
  '/courses',
  '/events',
  '/hysky-monthly',
  '/podcast', // Retired route: let Next.js return 404 without an auth redirect.
  '/sponsors',
  '/donate',
])

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/not-authorized',
  '/donate',
  '/courses',
  '/events(.*)',
  '/hysky-monthly',
  '/news(.*)',
  '/robots.txt',
  '/sitemap.xml',
  '/flying-hy(.*)',
  '/sponsors',
  '/invoice(.*)',
  '/api/webhooks(.*)',
  '/api/oembed',
  '/api/presence',
  '/api/messages(.*)',
])

const protectedProxy = clerkMiddleware(async (auth, request) => {
  const hostname = request.headers.get('host') ?? ''
  const isNewsHost = hostname.startsWith('news.') || hostname === 'hysky.news' || hostname === 'www.hysky.news'
  if (isNewsHost) {
    const url = request.nextUrl.clone()
    const isSeoFile = url.pathname === '/robots.txt' || url.pathname === '/sitemap.xml'
    if (!isSeoFile && !url.pathname.startsWith('/news') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
      // News articles are paid content. Authenticate before rewriting to them.
      await auth.protect()
      url.pathname = url.pathname === '/' ? '/news' : `/news${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  const isPublicCourseDetail = /^\/courses\/(h2-aircraft-certification|h2-safety-for-aviation|h2-aviation-policy)\/?$/.test(request.nextUrl.pathname)

  if (!isPublicRoute(request) && !isPublicCourseDetail) {
    await auth.protect()
  }
})

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const hostname = request.headers.get('host') ?? ''
  const isNewsHost =
    hostname.startsWith('news.') ||
    hostname === 'hysky.news' ||
    hostname === 'www.hysky.news'

  // Only the news landing page bypasses Clerk on the news domain.
  if (isNewsHost) {
    const url = request.nextUrl.clone()
    const isSeoFile = url.pathname === '/robots.txt' || url.pathname === '/sitemap.xml'
    if (!isSeoFile && !url.pathname.startsWith('/news') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
      url.pathname = url.pathname === '/' ? '/news' : `/news${url.pathname}`
      if (url.pathname === '/news' || url.pathname === '/news/subscribe') {
        return NextResponse.rewrite(url)
      }
      return protectedProxy(request, event)
    }
  }

  const pathname = request.nextUrl.pathname
  const isPublicDetail = /^\/(courses|events)\/[^/]+\/?$/.test(pathname)
  const isNewsPage = pathname === '/news' || pathname === '/news/subscribe'
  const isSeoFile = pathname === '/robots.txt' || pathname === '/sitemap.xml'

  if (clerkFreePublicPaths.has(pathname) || isPublicDetail || isNewsPage || isSeoFile) {
    return NextResponse.next()
  }

  return protectedProxy(request, event)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
