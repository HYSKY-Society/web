'use client'

const SECTIONS = [
  { href: '#about',    label: 'About' },
  { href: '#speakers', label: 'Speakers' },
  { href: '#agenda',   label: 'Agenda' },
  { href: '#sponsors', label: 'Sponsors' },
  { href: '#faq',      label: 'FAQ' },
]

export default function FlyingHyInPageNav() {
  return (
    <nav
      className="sticky top-[60px] z-30 flex items-center gap-1 overflow-x-auto px-6 lg:px-8 border-b scrollbar-hide"
      style={{ background: 'rgba(4,3,10,.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,.07)' }}
    >
      {SECTIONS.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className="shrink-0 px-3 py-3 text-sm font-medium text-white/45 hover:text-white transition-colors border-b-2 border-transparent hover:border-[#5d00f5]"
        >
          {label}
        </a>
      ))}
    </nav>
  )
}
