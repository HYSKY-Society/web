'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { courses as allCourses } from '@/lib/courses'
import { events as allEvents } from '@/lib/events'
import { TIER_LABELS } from '@/lib/tiers'
import type { Tier } from '@/lib/tiers'
import type { SidebarData } from './AppShell'

function SidebarSection({ label }: { label: string }) {
  return (
    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 select-none">
      {label}
    </p>
  )
}

function SidebarItem({
  href, icon, label, onClick, sub,
}: { href: string; icon: string; label: string; onClick: () => void; sub?: boolean }) {
  const pathname = usePathname()
  const active = pathname === href || (href.length > 1 && pathname.startsWith(href + '/'))
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        sub ? 'ml-2' : ''
      } ${
        active
          ? 'bg-[#5d00f5]/20 text-white'
          : 'text-white/55 hover:text-white hover:bg-white/6'
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

function EmptyNote({ text }: { text: string }) {
  return <p className="px-3 py-1 text-xs text-white/20 italic">{text}</p>
}

export default function AppSidebar({
  data, open, onClose,
}: { data: SidebarData; open: boolean; onClose: () => void }) {
  const enrolledCourses = allCourses.filter(c => data.enrolledCourseSlugs.includes(c.slug))
  const enrolledEvents  = allEvents.filter(e => data.enrolledEventSlugs.includes(e.slug))
  const tierLabel = TIER_LABELS[data.tier as Tier] ?? data.tier

  return (
    <aside
      className={`fixed top-[60px] left-0 bottom-0 w-[260px] z-40 flex flex-col transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      style={{ background: '#060510', borderRight: '1px solid rgba(255,255,255,.07)' }}
    >
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">

        {/* ── My Events ─────────────────────────────────────────── */}
        <SidebarSection label="My Events" />
        <SidebarItem href="/dashboard/events" icon="📅" label="Calendar" onClick={onClose} />
        {enrolledEvents.length > 0
          ? enrolledEvents.map(e => (
              <SidebarItem key={e.slug} href={`/dashboard/events/${e.slug}`} icon="•" label={e.title} onClick={onClose} sub />
            ))
          : <EmptyNote text="No events subscribed to" />
        }

        {/* ── Courses ───────────────────────────────────────────── */}
        <SidebarSection label="Courses" />
        {enrolledCourses.length > 0
          ? enrolledCourses.map(c => (
              <SidebarItem key={c.slug} href={`/courses/${c.slug}`} icon="📚" label={c.title} onClick={onClose} />
            ))
          : <EmptyNote text="No courses enrolled in" />
        }
        <SidebarItem href="/courses" icon="+" label="Browse courses" onClick={onClose} sub />

        {/* ── Members Hub ───────────────────────────────────────── */}
        <SidebarSection label="Members Hub" />
        <div className="px-3 py-1.5 flex items-center gap-2.5">
          <span className="text-base leading-none">🪪</span>
          <span className="text-xs text-white/35">
            Plan: <span className="text-[#9b6dff] font-medium">{tierLabel}</span>
          </span>
        </div>
        <SidebarItem href="/members" icon="👥" label="Members Directory" onClick={onClose} />

        {/* ── Sponsors ──────────────────────────────────────────── */}
        <SidebarSection label="Sponsors" />
        <SidebarItem href="/sponsors" icon="💼" label="View Sponsors" onClick={onClose} />

        {/* ── Profile ───────────────────────────────────────────── */}
        <SidebarSection label="Account" />
        <SidebarItem href="/profile" icon="👤" label="My Profile" onClick={onClose} />

        {/* ── Admin ─────────────────────────────────────────────── */}
        {data.isAdmin && (
          <>
            <SidebarSection label="Admin" />
            <SidebarItem href="/admin/users"          icon="👥" label="Manage Members" onClick={onClose} />
            <SidebarItem href="/admin/hysky-monthly"  icon="📅" label="Manage Events"  onClick={onClose} />
            <SidebarItem href="/admin/podcast"        icon="🎙" label="Manage Podcast" onClick={onClose} />
            <SidebarItem href="/admin/sponsors"       icon="💼" label="Manage Sponsors" onClick={onClose} />
            <SidebarItem href="/admin/codes"          icon="🏷" label="Discount Codes"  onClick={onClose} />
          </>
        )}
      </nav>

      {/* ── Bottom: UserButton ────────────────────────────────────── */}
      <div className="shrink-0 border-t border-white/8 px-4 py-3">
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
      </div>
    </aside>
  )
}
