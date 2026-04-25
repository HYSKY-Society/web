import { getCourse } from '@/lib/courses'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default function CoursePage({ params }: { params: { slug: string } }) {
  const course = getCourse(params.slug)
  if (!course) notFound()

  const isFirst = course.slug === 'h2-aircraft-certification'
  const accentColor = isFirst ? '#5d00f5' : '#00D4D4'
  const accentLight = isFirst ? '#9b6dff' : '#33ffff'
  const badgeLabel = isFirst ? '✈️ Certification' : '🛡️ Safety'

  return (
    <div className="text-white max-w-4xl">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
      >
        ← Back to Dashboard
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-12 mb-8">
        {/* Background glow */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5"
            style={{ backgroundColor: `${accentColor}25`, color: accentLight }}
          >
            {badgeLabel}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            {course.title}
          </h1>

          <p className="text-white/55 text-lg leading-relaxed max-w-2xl mb-8">
            {course.tagline}
          </p>

          {/* Course highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {course.highlights.map((h) => (
              <div key={h.label} className="bg-white/5 rounded-xl p-4 border border-white/8">
                <div className="text-xl mb-1">{h.icon}</div>
                <div className="text-white/40 text-xs mb-0.5">{h.label}</div>
                <div className="text-white font-semibold text-sm">{h.value}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={course.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-2xl text-base"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 8px 32px ${accentColor}40`,
            }}
          >
            Enroll Now →
          </a>
        </div>
      </div>

      {/* About */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="font-bold text-xl mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
          About This Course
        </h2>
        <div className="text-white/60 leading-relaxed whitespace-pre-line">
          {course.about}
        </div>
      </div>
    </div>
  )
}
