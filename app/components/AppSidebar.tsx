'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { TIER_LABELS } from '@/lib/tiers'
import { hasVipCommunityAccess } from '@/lib/tiers'
import type { Tier } from '@/lib/tiers'
import type { SidebarData } from './AppShell'

function SidebarSection({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-3" />
  return (
    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 select-none">
      {label}
    </p>
  )
}

function SidebarItem({
  href, icon, label, onClick, sub, collapsed, locked,
}: {
  href: string; icon: string; label: string
  onClick: () => void; sub?: boolean; collapsed: boolean
  locked?: boolean
}) {
  const pathname = usePathname()
  const active = pathname === href || (href.length > 1 && pathname.startsWith(href + '/'))

  return (
    <div className="group/item relative">
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center rounded-lg text-sm transition-colors ${
          collapsed
            ? 'justify-center w-10 h-10 mx-auto relative'
            : `gap-2.5 px-3 py-1.5 ${sub ? 'ml-2' : ''}`
        } ${
          active
            ? 'bg-[#5d00f5]/20 text-white'
            : 'text-white/55 hover:text-white hover:bg-white/6'
        } ${locked ? 'opacity-55' : ''}`}
      >
        <span className="text-base leading-none shrink-0">{icon}</span>
        {!collapsed && <span className="truncate">{label}</span>}
        {!collapsed && locked && <span className="ml-auto text-[10px] text-white/35">VIP</span>}
      </Link>

      {/* Tooltip — only in collapsed mode; nav is overflow-visible when collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[200] opacity-0 group-hover/item:opacity-100 transition-opacity duration-150">
          <div className="bg-[#1a1428] text-white/90 text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-white/10 shadow-xl">
            {label}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppSidebar({
  data, open, collapsed, onClose,
}: {
  data: SidebarData; open: boolean; collapsed: boolean; onClose: () => void
}) {
  const tierLabel = TIER_LABELS[data.tier as Tier] ?? data.tier
  const canUseVipCommunity = hasVipCommunityAccess(data.tier) || data.isAdmin

  return (
    <aside
      className={`fixed top-[60px] left-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${collapsed ? 'lg:w-[60px]' : 'lg:w-[260px]'}
        w-[260px]`}
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-muted)' }}
    >
      {/* overflow-visible when collapsed so tooltips can escape the container */}
      <nav className={`flex-1 py-2 space-y-0.5 ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>

        <SidebarSection label="Connect" collapsed={collapsed} />
        <SidebarItem href="/feed" icon="🏠" label="Home Feed" onClick={onClose} collapsed={collapsed} />
        <SidebarItem href="/members" icon="👥" label="Members" onClick={onClose} collapsed={collapsed} />
        <SidebarItem
          href={canUseVipCommunity ? '/network' : '/messages'}
          icon={canUseVipCommunity ? '💬' : '🔒'}
          label="Messages"
          onClick={onClose}
          collapsed={collapsed}
          locked={!canUseVipCommunity}
        />

        <SidebarSection label="Discover" collapsed={collapsed} />
        <SidebarItem href="/courses" icon="📚" label="Browse Courses" onClick={onClose} collapsed={collapsed} />
        <SidebarItem href="/events" icon="📅" label="Events" onClick={onClose} collapsed={collapsed} />
        <SidebarItem href="https://news.hysky.org" icon="📰" label="HySky News" onClick={onClose} collapsed={collapsed} />

        <SidebarSection label="Membership" collapsed={collapsed} />
        {!collapsed && (
          <div className="px-3 py-1.5 flex items-center gap-2.5">
            <span className="text-base leading-none">🪪</span>
            <span className="text-xs text-white/35">
              Plan: <span className="text-[#9b6dff] font-medium">{tierLabel}</span>
            </span>
          </div>
        )}
        <SidebarItem href="/profile" icon="👤" label="My Profile" onClick={onClose} collapsed={collapsed} />

        {/* ── Admin ─────────────────────────────────────────────── */}
        {data.isAdmin && (
          <>
            <SidebarSection label="Admin" collapsed={collapsed} />
            <SidebarItem href="/admin" icon="⚙️" label="Admin Dashboard" onClick={onClose} collapsed={collapsed} />
          </>
        )}
      </nav>

      {/* ── Bottom: UserButton ────────────────────────────────────── */}
      <div className={`shrink-0 border-t border-white/8 py-3 ${collapsed ? 'flex justify-center' : 'px-4'}`}>
        {collapsed ? (
          <UserButton
            appearance={{
              variables: { colorPrimary: '#5d00f5' },
              elements: { userButtonAvatarBox: 'w-9 h-9' },
            }}
          />
        ) : (
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                variables: { colorPrimary: '#5d00f5' },
                elements: { userButtonAvatarBox: 'w-9 h-9' },
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {data.displayName || data.email}
              </p>
              {data.displayName && (
                <p className="text-xs text-white/35 truncate">{data.email}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
