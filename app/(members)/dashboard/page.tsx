import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { courses } from '@/lib/courses'

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
        {/* Airtable embed */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5d00f5]" />
              Member Resources
            </h2>
          </div>
          <iframe
            src="https://airtable.com/embed/appoM2KFFLCAR6w43/pagJliokOXsfv3pbp"
            width="100%"
            height="500"
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Next event */}
          <div className="bg-[#00D4D4]/5 border border-[#00D4D4]/20 rounded-2xl p-6">
            <div className="text-[#00D4D4] text-xs font-semibold uppercase tracking-wider mb-2">
              Next Event
            </div>
            <div className="text-white/60 text-xs mb-0.5">The 4th Global</div>
            <div className="text-white font-bold text-sm mb-1">FLYING HY 2026 Conference</div>
            <div className="text-white/40 text-xs mb-4">Nov 4, 2026 · Zoom · 9:00 AM – 5:00 PM CT</div>
            <a
              href="https://www.zeffy.com/en-US/ticketing/flying-hy--2026"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-teal-glow block w-full text-white text-sm py-2.5 rounded-lg font-medium text-center"
            >
              Register Now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
