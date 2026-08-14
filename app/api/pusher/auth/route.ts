import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pusherServer } from '@/lib/pusher'
import { getProfile, getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = await req.text()
  const params = new URLSearchParams(body)
  const socketId    = params.get('socket_id')!
  const channelName = params.get('channel_name')!

  const allowed = ['private-dm-', 'presence-chat-', 'presence-online', 'private-notify-', 'private-gm-']
  if (!allowed.some(prefix => channelName.startsWith(prefix))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (channelName.startsWith('private-notify-') && channelName !== `private-notify-${userId}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (channelName.startsWith('private-dm-')) {
    const participants = channelName.slice('private-dm-'.length).split('-')
    const tier = await getUserTier(userId)
    if (!participants.includes(userId) || !hasVipCommunityAccess(tier)) {
      return NextResponse.json({ error: 'VIP membership required' }, { status: 403 })
    }
  }

  let authData: object
  if (channelName.startsWith('presence-')) {
    const [profile, userRow] = await Promise.all([
      getProfile(userId),
      db.query.users.findFirst({ where: eq(users.id, userId) }),
    ])
    const emailFallback = userRow?.email?.split('@')[0] ?? 'Member'
    authData = pusherServer.authorizeChannel(socketId, channelName, {
      user_id: userId,
      user_info: {
        displayName: profile?.displayName ?? emailFallback,
        headline:    profile?.headline    ?? null,
        avatarUrl:   profile?.avatarUrl   ?? null,
      },
    })
  } else {
    authData = pusherServer.authorizeChannel(socketId, channelName)
  }

  return NextResponse.json(authData)
}
