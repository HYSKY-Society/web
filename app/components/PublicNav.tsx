import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'

export default async function PublicNav() {
  const { userId } = auth()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 sm:px-10 py-4"
      style={{
        background: 'rgba(4,3,10,.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}
    >
      <Link href="/">
        <Image src="/logo-new.png" alt="HYSKY Society" height={44} width={175} className="object-contain" />
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/hysky-monthly" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors">
          HYSKY Monthly
        </Link>
        <Link href="/podcast" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors">
          Podcast
        </Link>
        <Link href="/sponsors" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors">
          Sponsors
        </Link>
        {userId ? (
          <Link
            href="/dashboard"
            className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all"
            style={{ background: '#5d00f5' }}
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/sign-up"
            className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all"
            style={{ background: '#5d00f5' }}
          >
            Join Free
          </Link>
        )}
      </div>
    </nav>
  )
}
