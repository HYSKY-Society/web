export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export const ADMIN_NAV = [
  { href: '/admin',              label: 'Overview' },
  { href: '/admin/users',        label: 'Users' },
  { href: '/admin/codes',        label: 'Discount Codes' },
  { href: '/admin/sponsors',     label: 'Sponsors' },
  { href: '/admin/hysky-monthly',label: 'HYSKY Monthly' },
  { href: '/admin/podcast',      label: 'Podcast' },
]
