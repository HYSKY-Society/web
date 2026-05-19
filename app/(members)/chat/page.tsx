import { db } from '@/lib/db'
import { chatChannels } from '@/lib/schema'
import { asc } from 'drizzle-orm'
import Link from 'next/link'

const DEFAULT_CHANNELS = [
  { name: 'General',             slug: 'general',      description: 'Open discussion for all members', icon: '💬' },
  { name: 'Hydrogen Tech',       slug: 'hydrogen-tech', description: 'Propulsion, storage, fuel cell systems', icon: '⚗️' },
  { name: 'Policy & Advocacy',   slug: 'policy',        description: 'Federal policy, regulation, and advocacy', icon: '🏛️' },
  { name: 'Events & Conferences', slug: 'events',       description: 'FLYING HY, HYSKY Monthly, and more', icon: '✈️' },
]

async function getOrCreateChannels() {
  const existing = await db.select().from(chatChannels).orderBy(asc(chatChannels.createdAt))
  if (existing.length > 0) return existing
  return db.insert(chatChannels).values(DEFAULT_CHANNELS).returning()
}

export default async function ChatPage() {
  const channels = await getOrCreateChannels()

  return (
    <div className="text-white max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Groups</h1>
        <p className="text-white/40 text-sm">HYSKY-curated group channels for members.</p>
      </div>

      <div className="space-y-2">
        {channels.map(ch => (
          <Link
            key={ch.id}
            href={`/chat/${ch.id}`}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all group"
          >
            <span className="text-2xl">{ch.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white group-hover:text-[#c4a0ff] transition-colors">
                # {ch.name}
              </p>
              {ch.description && (
                <p className="text-xs text-white/40 mt-0.5 truncate">{ch.description}</p>
              )}
            </div>
            <span className="text-white/25 group-hover:text-white/50 transition-colors text-sm">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
