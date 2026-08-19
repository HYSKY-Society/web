const ADMIN_EMAILS = new Set(['d@hy-sky.net', 'r@hy-sky.net'])

export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS]
}

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.has(email.trim().toLowerCase())
}

export function isFeedModerator(email: string): boolean {
  return isAdmin(email)
}

export const ADMIN_NAV = [
  { href: '/admin',              label: 'Overview' },
  { href: '/admin/users',        label: 'Users' },
  { href: '/admin/codes',        label: 'Discount Codes' },
  { href: '/admin/press',        label: 'News Automation' },
  { href: '/admin/sponsors',     label: 'Sponsors' },
  { href: '/admin/hysky-monthly',label: 'HySky Monthly' },
  { href: '/admin/podcast',      label: 'Podcast' },
  { href: '/admin/migration',    label: 'Migration' },
]

