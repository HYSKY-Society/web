import Link from 'next/link'
import { courses } from '@/lib/courses'
import PublicShell from '@/app/components/PublicShell'

export default function CoursesPage() {
  return (
    <PublicShell>
      <div className="text-white max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1.5">Courses</h1>
          <p className="text-white/40">Hydrogen aviation courses from HYSKY Society.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-7 transition-all hover:bg-white/8 hover:scale-[1.01] hover:shadow-xl"
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: course.accent }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-4 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${course.accent}25`, color: course.accentLight }}
                >
                  {course.badge}
                </div>
                <h2 className="font-bold text-lg text-white mb-2 leading-snug">
                  {course.title}
                </h2>
                <p className="text-white/45 text-sm leading-relaxed mb-5">{course.tagline}</p>
                <div
                  className="flex items-center gap-1 text-sm font-medium transition-colors"
                  style={{ color: course.accent }}
                >
                  View course{' '}
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PublicShell>
  )
}
