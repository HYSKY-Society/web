export type SidebarIconName =
  | 'home'
  | 'members'
  | 'companies'
  | 'messages'
  | 'lock'
  | 'courses'
  | 'events'
  | 'news'
  | 'plan'
  | 'profile'
  | 'admin'
  | 'settings'
  | 'logout'
  | 'plane'
  | 'video'
  | 'podcast'
  | 'feed'
  | 'clock'
  | 'monitor'
  | 'handshake'
  | 'graduation'
  | 'broadcast'
  | 'ticket'
  | 'trophy'
  | 'search'
  | 'location'
  | 'globe'

export default function SidebarIcon({ name, className = '' }: { name: SidebarIconName; className?: string }) {
  const paths: Record<SidebarIconName, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    members: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 20v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    companies: <><path d="M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M17 13h1M17 17h1M2 21h20" /></>,
    messages: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3v-7a4 4 0 0 1-1-2.6V7a4 4 0 0 1 4-4h11a4 4 0 0 1 4 4Z" /><path d="M7 9h10M7 13h6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    courses: <><path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H11v18H6.5A3.5 3.5 0 0 0 3 23Z" /><path d="M21 5.5A3.5 3.5 0 0 0 17.5 2H13v18h4.5A3.5 3.5 0 0 1 21 23Z" /></>,
    events: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
    news: <><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    plan: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    admin: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></>,
    plane: <><path d="M22 2 9 15" /><path d="m22 2-7 20-4-9-9-4Z" /></>,
    video: <><rect x="3" y="5" width="15" height="14" rx="2" /><path d="m18 10 4-2v8l-4-2Z" /></>,
    podcast: <><circle cx="12" cy="11" r="3" /><path d="M7.8 15.2a6 6 0 1 1 8.4 0M5 18a10 10 0 1 1 14 0M12 14v8" /></>,
    feed: <><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    handshake: <><path d="m8 11 3 3a2 2 0 0 0 3 0l5-5" /><path d="m2 12 5-5 4 1 2-2 4 1 5 5" /><path d="m7 17 2 2a2 2 0 0 0 3 0l1-1" /></>,
    graduation: <><path d="m2 10 10-5 10 5-10 5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6" /></>,
    broadcast: <><circle cx="12" cy="12" r="2" /><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13" /></>,
    ticket: <><path d="M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4Z" /><path d="M13 7v12" /></>,
    trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0Z" /><path d="M6 6H3v1a4 4 0 0 0 5 4M18 6h3v1a4 4 0 0 1-5 4M12 12v5M8 21h8M9 17h6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`themed-icon h-5 w-5 shrink-0 ${className}`}
    >
      {paths[name]}
    </svg>
  )
}
