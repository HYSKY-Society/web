import { db } from '@/lib/db'
import { flyingHySpeakers, flyingHyAgenda } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'
import { AddSpeakerForm, AddAgendaForm } from './FlyingHyForms'
import { deleteSpeaker, deleteAgendaItem } from './actions'

const YEAR = 2026

export default async function AdminFlyingHyPage() {
  const [speakers, agenda] = await Promise.all([
    db.select().from(flyingHySpeakers)
      .where(eq(flyingHySpeakers.eventYear, YEAR))
      .orderBy(asc(flyingHySpeakers.displayOrder)),
    db.select().from(flyingHyAgenda)
      .where(eq(flyingHyAgenda.eventYear, YEAR))
      .orderBy(asc(flyingHyAgenda.displayOrder)),
  ])

  return (
    <div className="text-white max-w-4xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-1.5">Manage FLYING HY</h1>
        <p className="text-white/40">Manage speakers and agenda for FLYING HY {YEAR}.</p>
      </div>

      {/* ── Speakers ── */}
      <section>
        <AddSpeakerForm />
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">Speakers ({speakers.length})</h2>
          {speakers.length === 0 ? (
            <p className="text-white/30 text-sm">No speakers added yet.</p>
          ) : (
            <div className="space-y-3">
              {speakers.map(s => (
                <div key={s.id} className="flex items-start gap-4 rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                  {s.avatarUrl && (
                    <img src={s.avatarUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{s.name}</p>
                    {s.title && <p className="text-white/40 text-xs">{s.title}{s.organization ? ` · ${s.organization}` : ''}</p>}
                    {s.sessionTitle && <p className="text-white/30 text-xs italic mt-0.5">"{s.sessionTitle}"</p>}
                  </div>
                  <form action={deleteSpeaker.bind(null, s.id)}>
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400/70 hover:text-red-400 transition-colors shrink-0">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Agenda ── */}
      <section>
        <AddAgendaForm />
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">Agenda Items ({agenda.length})</h2>
          {agenda.length === 0 ? (
            <p className="text-white/30 text-sm">No agenda items added yet.</p>
          ) : (
            <div className="space-y-3">
              {agenda.map(item => (
                <div key={item.id} className="flex items-start gap-4 rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                  <div className="shrink-0 w-20 text-right">
                    <span className="text-[#13dce8] text-xs font-bold">{item.timeSlot ?? '—'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{item.title}</p>
                    {item.speakerName && <p className="text-white/40 text-xs">{item.speakerName}</p>}
                    <span className="text-[10px] uppercase tracking-wide text-white/25">{item.sessionType}</span>
                  </div>
                  <form action={deleteAgendaItem.bind(null, item.id)}>
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400/70 hover:text-red-400 transition-colors shrink-0">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
