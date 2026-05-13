import { auth } from '@clerk/nextjs/server'
import NewsTopBar from './NewsTopBar'
import { ensureNewsUser, type NewsTier } from '@/lib/news'

export default async function NewsShell({ children }: { children: React.ReactNode }) {
  const { userId } = auth()

  let tier: NewsTier | undefined
  if (userId) {
    tier = await ensureNewsUser(userId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <NewsTopBar isLoggedIn={!!userId} tier={tier} />
      <main>{children}</main>
    </div>
  )
}
