import Pusher from 'pusher'

export const pusherServer = new Pusher({
  appId:   process.env.PUSHER_APP_ID!,
  key:     process.env.PUSHER_KEY!,
  secret:  process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER ?? 'us2',
  useTLS:  true,
})

export function dmChannelName(a: string, b: string) {
  return `private-dm-${[a, b].sort().join('-')}`
}

export function chatChannelName(channelId: string) {
  return `presence-chat-${channelId}`
}
