import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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
  '/podcast',
  '/news(.*)',
  '/flying-hy(.*)',
  '/sponsors',
  '/api/webhooks(.*)',
  '/api/oembed',
  '/api/presence',
  '/api/messages(.*)',
])

export default clerkMiddleware((auth, request) => {
  const hostname = request.headers.get('host') ?? ''

  // When news.hysky.org is added as a Vercel domain, rewrite its root
  // and any non-/news paths so they resolve to /news/* routes.
  
  const isNewsHost =
    hostname.startsWith('news.') ||
    hostname === 'hysky.news' ||
    hostname === 'www.hysky.news'

  // Rewrite news-host root and non-/news paths so they resolve to /news/* routes.
  if (isNewsHost) {
    const url = request.nextUrl.clone()
    if (!url.pathname.startsWith('/news') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
      url.pathname = url.pathname === '/' ? '/news' : `/news${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
