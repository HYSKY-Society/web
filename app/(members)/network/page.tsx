import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import NetworkClient from './NetworkClient'

export default async function NetworkPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Network</h1>
        <p className="text-white/40 text-sm">See who's online and start a conversation.</p>
      </div>
      <NetworkClient myId={userId} />
    </div>
  )
}
