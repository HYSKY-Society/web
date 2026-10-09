import Link from 'next/link'
import Image from 'next/image'

export default function PublicNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 sm:px-10 py-4"
      style={{
        background: 'rgba(4,3,10,.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}
    >
      <Link href="/" prefetch={false}>
        <Image src="/logo-new.png" alt="HySky Society" height={44} width={175} className="object-contain" />
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/hysky-monthly" prefetch={false} className="hidden md:block text-sm text-white/50 hover:text-white transition-colors">
          HySky Monthly
        </Link>
        <Link href="/sponsors" prefetch={false} className="hidden md:block text-sm text-white/50 hover:text-white transition-colors">
          Sponsors
        </Link>
        <Link href="/donate" prefetch={false} className="hidden md:block text-sm text-white/50 hover:text-white transition-colors">
          Donate
        </Link>
        <Link
          href="/sign-up"
          prefetch={false}
          className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all"
          style={{ background: '#5d00f5' }}
        >
          Join Free
        </Link>
      </div>
    </nav>
  )
}
