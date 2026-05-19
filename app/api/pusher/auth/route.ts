import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pusherServer } from '@/lib/pusher'
import { getProfile } from '@/lib/members'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = await req.text()
  const params = new URLSearchParams(body)
  const socketId   = params.get('socket_id')!
  const channelName = params.get('channel_name')!

  if (!channelName.startsWith('private-dm-') && !channelName.startsWith('presence-chat-')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let authData: object
  if (channelName.startsWith('presence-')) {
    const profile = await getProfile(userId)
    authData = pusherServer.authorizeChannel(socketId, channelName, {
      user_id: userId,
      user_info: {
        displayName: profile?.displayName ?? 'Member',
        avatarUrl:   profile?.avatarUrl ?? null,
      },
    })
  } else {
    authData = pusherServer.authorizeChannel(socketId, channelName)
  }

  return NextResponse.json(authData)
}
