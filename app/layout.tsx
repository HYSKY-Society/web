import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HYSKY Society — Members',
  description: 'The Hydrogen Aviation Society — Exclusive Member Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ variables: { fontFamily: spaceGrotesk.style.fontFamily } }}>
      <html lang="en" data-theme="dark" suppressHydrationWarning>
        <head>
          {/* Anti-FOUC: apply saved theme before first paint */}
          <script dangerouslySetInnerHTML={{ __html:
            `(function(){var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');})()`
          }} />
        </head>
        <body className={spaceGrotesk.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
