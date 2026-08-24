import { getFlyingHyAgenda, type FlyingHyAgendaItem } from '@/lib/flying-hy-agenda'

export type FlyingHyAgendaDisplayItem = FlyingHyAgendaItem & {
  headshotUrls?: string[]
}

type FlyingHyAgendaProps = {
  agenda?: FlyingHyAgendaDisplayItem[]
}

export default async function FlyingHyAgenda({ agenda: providedAgenda }: FlyingHyAgendaProps = {}) {
  const agenda: FlyingHyAgendaDisplayItem[] = providedAgenda ?? await getFlyingHyAgenda()

  return (
    <section id="agenda" className="relative mx-auto mb-6 max-w-5xl scroll-mt-[110px] overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(145deg, rgba(93,0,245,.16), rgba(19,220,232,.06) 48%, var(--bg-panel))',
        border: '1px solid rgba(93,0,245,.32)',
      }}>
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-20 bg-[#13dce8]" />
      <div className="relative px-5 py-8 sm:p-10">
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-[2.5px] text-[#13dce8]">
              Event agenda
            </div>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">
              A Full Day of <span className="text-[#5d00f5]">Hydrogen Aviation</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full border border-[#13dce8]/30 bg-[#13dce8]/10 px-3 py-1.5 text-[#13dce8]">
              November 4, 2026
            </span>
            <span className="rounded-full border border-[#5d00f5]/30 bg-[#5d00f5]/10 px-3 py-1.5 text-[#9b6dff]">
              Central Time
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute bottom-4 left-[7px] top-4 w-px bg-gradient-to-b from-[#13dce8] via-[#5d00f5] to-transparent sm:left-[210px]" />
          <div className="space-y-4">
            {agenda.map((item, index) => {
              const startTime = item.time.split('–')[0].trim()
              const sessionNumber = String(index + 1).padStart(2, '0')
              const headshots = item.headshotUrls ?? []

              return (
                <article
                  key={`${item.time}-${item.name}`}
                  tabIndex={0}
                  aria-label={`Session ${sessionNumber}: ${item.name}. Hover or focus for presentation details.`}
                  className="group relative min-h-[430px] rounded-2xl outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-[#13dce8] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-h-[230px]"
                >
                  <span className="absolute left-[1px] top-8 z-20 h-3.5 w-3.5 rounded-full border-2 border-[#13dce8] bg-[var(--bg-panel)] shadow-[0_0_14px_rgba(19,220,232,.55)] sm:left-[203px] sm:top-1/2 sm:-translate-y-1/2" />

                  <div className="absolute inset-0 transition-transform duration-700 ease-out [transform-style:preserve-3d] [-webkit-transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)] motion-reduce:duration-0">
                    <div className="absolute inset-0 grid gap-5 rounded-2xl border border-white/10 bg-black/10 px-5 py-6 transition-colors [backface-visibility:hidden] [-webkit-backface-visibility:hidden] group-hover:border-[#13dce8]/40 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-10 sm:px-6">
                      <div className="ml-5 flex items-center gap-4 sm:ml-0 sm:justify-end">
                        <div className="flex min-h-[178px] w-full max-w-[160px] flex-col items-center justify-center rounded-2xl border border-[#13dce8]/25 bg-[var(--bg-card)] px-4 py-4 text-center shadow-[0_14px_45px_rgba(19,220,232,.12)]">
                          {headshots.length > 0 ? (
                            <div className="mb-3 flex -space-x-4">
                              {headshots.map((headshotUrl, headshotIndex) => (
                                <img
                                  key={headshotUrl}
                                  src={headshotUrl}
                                  alt={`${item.name} headshot${headshots.length > 1 ? ` ${headshotIndex + 1}` : ''}`}
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  className={`${headshots.length > 1 ? 'h-20 w-20' : 'h-24 w-24'} rounded-full object-cover ring-2 ring-[#5d00f5]/45`}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[#5d00f5]/15 text-2xl font-black text-[#5d00f5]">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <p className="font-black leading-tight text-white">{startTime}</p>
                        </div>
                      </div>

                      <div className="pl-7 sm:pl-0">
                        <span className="text-[10px] font-black uppercase tracking-[1.5px] text-[#9b6dff]">
                          Session {sessionNumber}
                        </span>
                        <h3 className="mt-2 text-xl font-black leading-snug">{item.name}</h3>
                        <p className="mt-2 text-sm font-semibold text-white/60">{item.title}</p>
                        <p className="mt-1 text-sm text-[#9b6dff]">{item.company}</p>
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-[1.5px] text-white/40">
                          Hover or tap for presentation details
                        </p>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-center overflow-hidden rounded-2xl border border-[#13dce8]/45 bg-[var(--bg-panel)] px-9 py-7 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] sm:px-12">
                      <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#13dce8]/15 blur-3xl" />
                      <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#5d00f5]/20 blur-3xl" />
                      <div className="relative">
                        <span className="text-[10px] font-black uppercase tracking-[1.8px] text-[#13dce8]">
                          Session {sessionNumber} · {startTime}
                        </span>
                        <h3 className="mt-3 text-2xl font-black leading-tight">
                          {item.presentationTitle || 'Presentation details coming soon'}
                        </h3>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
                          {item.bio || 'The presentation title and speaker bio will appear here as soon as they are added to the speaker sheet.'}
                        </p>
                        <p className="mt-5 text-xs font-bold text-[#9b6dff]">
                          {item.name} · {item.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

