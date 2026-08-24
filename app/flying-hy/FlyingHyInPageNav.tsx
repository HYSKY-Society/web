'use client'

const SECTIONS = [
  { href: '#speakers', label: 'Speakers' },
  { href: '#agenda',   label: 'Agenda' },
  { href: '#sponsors', label: 'Sponsors' },
  { href: '#faq',      label: 'FAQ' },
]

export default function FlyingHyInPageNav() {
  return (
    <nav
      className="flying-hy-inpage-nav sticky top-[60px] z-30 border-b"
      style={{ background: 'var(--bg-topbar)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-muted)' }}
    >
      <div className="scrollbar-hide mx-auto flex w-full max-w-5xl items-center gap-1 overflow-x-auto px-6 lg:px-8">
        {SECTIONS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-white/45 transition-colors first:pl-0 hover:border-[#5d00f5] hover:text-white"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}

