import Image from 'next/image'
import Link from 'next/link'

export default function NewsShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, height: 60,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 24px', background: '#fff', borderBottom: '1px solid #e8e8e8',
      }}>
        <Link href="https://connect.hysky.org" aria-label="Go to HySky Connect">
          <Image src="/hysky-connect-light.png" alt="HySky Connect" height={40} width={190} priority className="h-[36px] w-[150px] object-contain object-left sm:w-[190px]" />
        </Link>
        <Link href="/news" style={{
          fontSize: '0.8rem', fontWeight: 700, color: '#111',
          borderLeft: '1px solid #ddd', paddingLeft: 10,
          letterSpacing: '0.04em', textTransform: 'uppercase', textDecoration: 'none',
        }}>
          News
        </Link>
        <Link href="https://connect.hysky.org/sign-in" style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: 600, color: '#5D00F5' }}>
          Log In
        </Link>
      </header>
      <main>{children}</main>
    </div>
  )
}
