import Link from 'next/link'
import { courses } from '@/lib/courses'

export default function CoursesPage() {
  return (
    <div className="text-white max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Courses</h1>
        <p className="text-white/40">Hydrogen aviation courses from HYSKY Society.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {courses.map((course, i) => {
          const isFirst = i === 0
          const accentColor = isFirst ? '#5d00f5' : '#00D4D4'
          const accentLight = isFirst ? '#9b6dff' : '#33ffff'
          const badgeLabel = isFirst ? '✈️ Certification' : '🛡️ Safety'

          return (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-[#5d00f5]/50 rounded-2xl p-7 transition-all hover:bg-white/8 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#5d00f5]/10"
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: accentColor }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-4 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${accentColor}25`, color: accentLight }}
                >
                  {badgeLabel}
                </div>
                <h2 className="font-bold text-lg text-white mb-2 leading-snug group-hover:text-[#c4a0ff] transition-colors">
                  {course.title}
                </h2>
                <p className="text-white/45 text-sm leading-relaxed mb-5">{course.tagline}</p>
                <div
                  className="flex items-center gap-1 text-sm font-medium transition-colors"
                  style={{ color: accentColor }}
                >
                  View course{' '}
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
