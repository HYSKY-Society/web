import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

const themeInitScript = `
(function () {
  try {
    var cookieMatch = document.cookie.match(/(?:^|; )hysky-theme=(light|dark)(?:;|$)/)
    var cookieTheme = cookieMatch ? cookieMatch[1] : null
    var storedTheme = localStorage.getItem('theme')
    var theme = cookieTheme || (storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark')

    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)

    if (!cookieTheme) {
      var sharedDomain = location.hostname === 'hysky.org' || location.hostname.endsWith('.hysky.org')
      document.cookie = 'hysky-theme=' + theme + '; Path=/; Max-Age=31536000; SameSite=Lax' +
        (sharedDomain ? '; Domain=.hysky.org; Secure' : '')
    }
  } catch (_) {
    // The static dark theme remains as the safe fallback when storage is unavailable.
  }
})()
`

export const metadata: Metadata = {
  title: 'HySky Society — Members',
  description: 'The Hydrogen Aviation Society — Exclusive Member Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ variables: { fontFamily: spaceGrotesk.style.fontFamily } }}>
      <html lang="en" data-theme="dark" suppressHydrationWarning>
        <head>
          {/* Apply the last saved theme before first paint to avoid a light/dark flash. */}
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body className={spaceGrotesk.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
