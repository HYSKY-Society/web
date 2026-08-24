import { getFlyingHyAgenda, type FlyingHyAgendaItem } from '@/lib/flying-hy-agenda'

type FlyingHyAgendaProps = {
  agenda?: FlyingHyAgendaItem[]
}

export default async function FlyingHyAgenda({ agenda: providedAgenda }: FlyingHyAgendaProps = {}) {
  const agenda = providedAgenda ?? await getFlyingHyAgenda()

  return (
    <section id="agenda" className="mx-auto mb-6 max-w-5xl scroll-mt-[110px] pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-black uppercase leading-[.92] tracking-[-1px] text-[#5d00f5]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Agenda
        </h2>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="flying-hy-agenda-date rounded-full border border-[#13dce8]/30 bg-[#13dce8]/10 px-3 py-1.5">
            November 4, 2026
          </span>
          <span className="flying-hy-agenda-timezone rounded-full border border-[#5d00f5]/30 bg-[#5d00f5]/10 px-3 py-1.5 text-[#9b6dff]">
            Central Time
          </span>
        </div>
      </div>

      <div
        className="flying-hy-agenda-container relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, rgba(93,0,245,.16), rgba(19,220,232,.06) 48%, var(--bg-panel))',
          border: '1px solid rgba(93,0,245,.32)',
        }}
      >
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-20 bg-[#13dce8]" />
        <div className="relative px-5 py-8 sm:p-10">
          <div className="relative">
            <div className="space-y-3">
              {agenda.map((item) => (
                <article key={`${item.time}-${item.name}`}
                  className="flying-hy-agenda-row group relative grid grid-cols-[100px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-[#13dce8]/40 hover:bg-[#13dce8]/5 sm:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-8 sm:px-6">
                  <div className="flex items-center">
                    <p className="text-sm font-normal leading-tight text-[var(--text-primary)] group-hover:font-bold">
                      {item.time.split('–')[0].trim()}
                    </p>
                  </div>
                  <h3 className="min-w-0 text-sm font-normal leading-snug group-hover:font-bold">{item.name}</h3>
                  <p className="col-start-2 min-w-0 text-sm font-normal text-[#9b6dff] group-hover:font-bold sm:col-start-auto">
                    {item.company}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

