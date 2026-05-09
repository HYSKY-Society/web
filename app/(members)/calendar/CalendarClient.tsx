'use client'

import { useState } from 'react'
import Link from 'next/link'

export type CalEvent = {
  date: string   // ISO string
  title: string
  type: 'event' | 'session'
  href: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarClient({ events }: { events: CalEvent[] }) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const byDay: Record<number, CalEvent[]> = {}
  for (const e of events) {
    const d = new Date(e.date)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      ;(byDay[day] ??= []).push(e)
    }
  }

  const isToday = (d: number) =>
    d === today.getDate() && year === today.getFullYear() && month === today.getMonth()

  const prev = () => month === 0  ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)
  const next = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1)

  // Upcoming events list (next 90 days from today)
  const cutoff = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
  const upcoming = events
    .filter(e => { const d = new Date(e.date); return d >= today && d <= cutoff })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="max-w-5xl space-y-8">
      {/* Calendar card */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            ‹
          </button>
          <h2 className="font-bold text-white text-lg">{MONTHS[month]} {year}</h2>
          <button
            onClick={next}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            ›
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-white/25 py-1 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => (
            <div
              key={i}
              className={`min-h-[72px] sm:min-h-[88px] rounded-lg p-1.5 transition-colors ${
                d ? 'hover:bg-white/4' : ''
              } ${
                d && isToday(d) ? 'ring-1 ring-[#5d00f5]/70 bg-[#5d00f5]/8' : d ? 'bg-white/[0.02]' : ''
              }`}
            >
              {d && (
                <>
                  <span className={`block text-right text-xs font-medium mb-1 ${
                    isToday(d) ? 'text-[#9b6dff] font-bold' : 'text-white/30'
                  }`}>
                    {d}
                  </span>
                  <div className="space-y-0.5">
                    {(byDay[d] ?? []).slice(0, 3).map((e, ei) => (
                      <Link
                        key={ei}
                        href={e.href}
                        title={e.title}
                        className={`block truncate text-[9px] sm:text-[10px] px-1 py-0.5 rounded font-medium transition-opacity hover:opacity-80 ${
                          e.type === 'event'
                            ? 'bg-[#5d00f5]/35 text-[#c4a0ff]'
                            : 'bg-[#13dce8]/15 text-[#13dce8]'
                        }`}
                      >
                        {e.title}
                      </Link>
                    ))}
                    {(byDay[d]?.length ?? 0) > 3 && (
                      <span className="text-[9px] text-white/25 pl-1">
                        +{byDay[d].length - 3} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/6">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#5d00f5]/35" />
            <span className="text-xs text-white/35">Your registered events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#13dce8]/15" />
            <span className="text-xs text-white/35">HYSKY Monthly sessions</span>
          </div>
        </div>
      </div>

      {/* Upcoming list */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Upcoming (next 90 days)</h3>
          <div className="space-y-2">
            {upcoming.map((e, i) => {
              const d = new Date(e.date)
              return (
                <Link
                  key={i}
                  href={e.href}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 group transition-colors hover:bg-white/4"
                  style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)' }}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                    e.type === 'event' ? 'bg-[#5d00f5]/25' : 'bg-[#13dce8]/12'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase ${e.type === 'event' ? 'text-[#9b6dff]' : 'text-[#13dce8]'}`}>
                      {MONTHS[d.getMonth()].slice(0, 3)}
                    </span>
                    <span className={`text-sm font-black leading-none ${e.type === 'event' ? 'text-[#9b6dff]' : 'text-[#13dce8]'}`}>
                      {d.getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-[#c4a0ff] transition-colors truncate">{e.title}</p>
                    <p className="text-xs text-white/35 mt-0.5">
                      {d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    e.type === 'event' ? 'bg-[#5d00f5]/20 text-[#9b6dff]' : 'bg-[#13dce8]/10 text-[#13dce8]'
                  }`}>
                    {e.type === 'event' ? 'Event' : 'Monthly'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {upcoming.length === 0 && Object.keys(byDay).length === 0 && (
        <div className="text-center py-10 text-white/20 text-sm">
          No events in this month. Navigate to find upcoming events.
        </div>
      )}
    </div>
  )
}
