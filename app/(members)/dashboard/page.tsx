import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { courses } from '@/lib/courses'

const updates = [
  { date: 'Apr 2025', type: 'Whitepaper', title: 'A Novel Method to Indirectly Measure Electro-Osmotic Drag and Back Diffusion from Total Water Flow Experiments in PEM', href: '/documents/pem-electro-osmotic-drag-whitepaper.pdf' },
  { date: 'Apr 2025', type: 'Report', title: 'Q1 2025 Hydrogen Aviation Market Report Released' },
  { date: 'Mar 2025', type: 'Event', title: 'Working Group: Certification Pathways for H₂ Aircraft' },
  { date: 'Mar 2025', type: 'Announcement', title: '12 new organizations joined this quarter' },
  { date: 'Feb 2025', type: 'Policy', title: 'Policy Brief: EU Hydrogen Aviation Incentive Framework' },
]

const stats = [
  { label: 'Members', value: '240+' },
  { label: 'Countries', value: '18' },
  { label: 'Working Groups', value: '6' },
  { label: 'Reports Published', value: '14' },
]

export default async function DashboardPage() {
  const user = await currentUser()
  const firstName = user?.firstName || 'Member'

  return (
    <div className="text-white">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1.5">Welcome back, {firstName}</h1>
        <p className="text-white/40">Here&apos;s what&apos;s happening in hydrogen aviation.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-2xl font-bold text-[#5d00f5]">{s.value}</div>
            <div className="text-white/45 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div className="mb-8">
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5d00f5]" />
          Courses
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((course, i) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-[#5d00f5]/50 rounded-2xl p-6 transition-all hover:bg-white/8 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#5d00f5]/10"
            >
              {/* Gradient glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${i === 0 ? 'bg-[#5d00f5]' : 'bg-[#00D4D4]'}`} />

              <div className="relative">
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-3 px-2.5 py-1 rounded-full ${i === 0 ? 'bg-[#5d00f5]/20 text-[#9b6dff]' : 'bg-[#00D4D4]/15 text-[#00D4D4]'}`}>
                  {i === 0 ? '✈️ Certification' : '🛡️ Safety'}
                </div>
                <h3 className="font-bold text-base text-white mb-2 leading-snug group-hover:text-[#c4a0ff] transition-colors">
                  {course.title}
                </h3>
                <p className="text-white/45 text-sm leading-relaxed mb-4">
                  {course.tagline}
                </p>
                <div className="flex items-center gap-1 text-[#5d00f5] group-hover:text-[#9b6dff] text-sm font-medium transition-colors">
                  View course <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Latest updates */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-semibold text-base mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5d00f5]" />
            Latest Member Updates
          </h2>
          <div className="space-y-4">
            {updates.map((item) => {
              const inner = (
                <>
                  <span className="text-xs bg-[#5d00f5]/15 text-[#5d00f5] px-2.5 py-0.5 rounded-full whitespace-nowrap mt-0.5 font-medium">
                    {item.type}
                  </span>
                  <div>
                    <div className="font-medium text-sm leading-snug text-white/90">{item.title}</div>
                    <div className="text-white/30 text-xs mt-1">{item.date}{item.href && <span className="ml-2 text-[#00D4D4]">↓ Download</span>}</div>
                  </div>
                </>
              )
              return item.href ? (
                <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer"
                  className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0 hover:bg-white/3 rounded-lg px-2 -mx-2 transition-colors">
                  {inner}
                </a>
              ) : (
                <div key={item.title} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  {inner}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Next event */}
          <div className="bg-[#5d00f5]/8 border border-[#5d00f5]/25 rounded-2xl p-6">
            <div className="text-[#5d00f5] text-xs font-semibold uppercase tracking-wider mb-2">
              Next Event
            </div>
            <div className="text-white font-semibold text-sm mb-1">Annual Member Summit</div>
            <div className="text-white/40 text-xs mb-4">June 12–13, 2025 · Washington D.C.</div>
            <button className="w-full bg-[#5d00f5] hover:bg-[#4a00c4] text-white text-sm py-2.5 rounded-lg font-medium transition-colors">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
