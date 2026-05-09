import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eventPurchases, hyskySessions } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'
import { events as allEvents } from '@/lib/events'
import CalendarClient, { type CalEvent } from './CalendarClient'

export default async function CalendarPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const [purchases, sessions] = await Promise.all([
    db.select().from(eventPurchases).where(eq(eventPurchases.userId, userId)),
    db.select().from(hyskySessions)
      .where(eq(hyskySessions.isPublished, true))
      .orderBy(asc(hyskySessions.sessionDate)),
  ])

  const registeredSlugs = new Set(purchases.map(p => p.eventSlug))

  const calEvents: CalEvent[] = [
    // Static events the user has registered for
    ...allEvents
      .filter(e => registeredSlugs.has(e.slug))
      .map(e => ({
        date: new Date(e.date).toISOString(),
        title: e.title,
        type: 'event' as const,
        href: `/events/${e.slug}`,
      })),
    // HYSKY Monthly sessions
    ...sessions.map(s => ({
      date: s.sessionDate.toISOString(),
      title: s.title,
      type: 'session' as const,
      href: s.youtubeUrl ?? s.zoomUrl ?? '/hysky-monthly',
    })),
  ]

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">My Calendar</h1>
        <p className="text-white/40 text-sm">Your registered events and upcoming HYSKY Monthly sessions.</p>
      </div>
      <CalendarClient events={calEvents} />
    </div>
  )
}
