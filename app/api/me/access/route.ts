import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const tier = await getUserTier(userId)
  return NextResponse.json(
    { tier, canUseVipCommunity: hasVipCommunityAccess(tier) },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
