import NetworkClient from './NetworkClient'

export default function NetworkPage() {
  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Network</h1>
        <p className="text-white/40 text-sm">See who&apos;s online and start a conversation.</p>
      </div>
      <NetworkClient />
    </div>
  )
}
