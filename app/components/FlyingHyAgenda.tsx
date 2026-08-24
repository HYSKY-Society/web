import { getFlyingHyAgenda, type FlyingHyAgendaItem } from '@/lib/flying-hy-agenda'

type FlyingHyAgendaProps = {
  agenda?: FlyingHyAgendaItem[]
}

export default async function FlyingHyAgenda({ agenda: providedAgenda }: FlyingHyAgendaProps = {}) {
  const agenda = providedAgenda ?? await getFlyingHyAgenda()

  return (
    <section id="agenda" className="relative mx-auto mb-6 max-w-5xl scroll-mt-[110px] overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(145deg, rgba(93,0,245,.16), rgba(19,220,232,.06) 48%, var(--bg-panel))',
        border: '1px solid rgba(93,0,245,.32)',
      }}>
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-20 bg-[#13dce8]" />
      <div className="relative px-5 py-8 sm:p-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-9">
          <div>
            <div className="flying-hy-agenda-kicker text-xs font-bold uppercase tracking-[2.5px] mb-3">
              Event agenda
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              A Full Day of <span className="text-[#5d00f5]">Hydrogen Aviation</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="flying-hy-agenda-date rounded-full border border-[#13dce8]/30 bg-[#13dce8]/10 px-3 py-1.5">
              November 4, 2026
            </span>
            <span className="rounded-full border border-[#5d00f5]/30 bg-[#5d00f5]/10 px-3 py-1.5 text-[#9b6dff]">
              Central Time
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="space-y-3">
            {agenda.map((item) => (
              <article key={`${item.time}-${item.name}`}
                className="relative grid grid-cols-[100px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-[#13dce8]/40 hover:bg-[#13dce8]/5 sm:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-8 sm:px-6">
                <div className="flex items-center sm:justify-end sm:text-right">
                  <p className="text-sm font-black leading-tight text-[var(--text-primary)]">
                    {item.time.split('–')[0].trim()}
                  </p>
                </div>
                <h3 className="min-w-0 text-sm font-black leading-snug">{item.name}</h3>
                <p className="col-start-2 min-w-0 text-sm font-semibold text-[#9b6dff] sm:col-start-auto">
                  {item.company}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

