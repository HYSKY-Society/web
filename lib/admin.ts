const HARDCODED_ADMINS = ['r@hy-sky.net', 'd@hy-sky.net']

export function getAdminEmails(): string[] {
  const envAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set([...HARDCODED_ADMINS, ...envAdmins])]
}

export function isAdmin(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase())
}

export const ADMIN_NAV = [
  { href: '/admin',              label: 'Overview' },
  { href: '/admin/users',        label: 'Users' },
  { href: '/admin/codes',        label: 'Discount Codes' },
  { href: '/admin/sponsors',     label: 'Sponsors' },
  { href: '/admin/hysky-monthly',label: 'HYSKY Monthly' },
  { href: '/admin/podcast',      label: 'Podcast' },
]
