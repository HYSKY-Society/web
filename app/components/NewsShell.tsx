import { auth } from '@clerk/nextjs/server'
import NewsTopBar from './NewsTopBar'
import { ensureNewsUser, hasVipConnectMembership, type NewsTier } from '@/lib/news'

export default async function NewsShell({ children }: { children: React.ReactNode }) {
  const { userId } = auth()

  let tier: NewsTier | undefined
  let isVipMember = false
  if (userId) {
    ;[tier, isVipMember] = await Promise.all([
      ensureNewsUser(userId),
      hasVipConnectMembership(userId),
    ])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <NewsTopBar isLoggedIn={!!userId} tier={tier} isVipMember={isVipMember} />
      <main>{children}</main>
    </div>
  )
}
