'use client'

import Link from 'next/link'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/resources', label: 'Resources' },
  { href: '/dashboard/events', label: 'Events' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#04080F]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-15 flex items-center justify-between h-[60px]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Image src="/logo-white.png" alt="HYSKY Society" height={36} width={120} className="object-contain" />
          </Link>
          <nav className="hidden sm:flex gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === l.href
                    ? 'bg-white/10 text-white'
                    : 'text-white/45 hover:text-white hover:bg-white/6'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="hidden sm:block text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Admin
          </Link>
          <UserButton
            appearance={{
              variables: { colorPrimary: '#5d00f5' },
              elements: { userButtonAvatarBox: 'w-9 h-9' },
            }}
          />
        </div>
      </div>
    </header>
  )
}
