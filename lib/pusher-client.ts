'use client'
import PusherJs from 'pusher-js'

let client: PusherJs | null = null

export function getPusher(): PusherJs {
  if (!client) {
    client = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'us2',
      channelAuthorization: {
        endpoint:  '/api/pusher/auth',
        transport: 'ajax',
      },
    })
  }
  return client
}
