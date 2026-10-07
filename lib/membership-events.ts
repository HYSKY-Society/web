import { pusherServer } from './pusher'

export async function notifyMembershipChanged(userId: string) {
  await pusherServer.trigger(`private-access-${userId}`, 'membership-changed', {}).catch(() => {
    // A page navigation will pick up the saved tier if realtime is unavailable.
  })
}
