import { getCourse } from '@/lib/courses'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default function CoursePage({ params }: { params: { slug: string } }) {
  const course = getCourse(params.slug)
  if (!course) notFound()

  const isFirst = course.slug === 'h2-aircraft-certification'
  const accent = isFirst ? '#5d00f5' : '#00D4D4'
  const accentLight = isFirst ? '#9b6dff' : '#33ffff'
  const badgeLabel = isFirst ? '✈️ Certification' : '🛡️ Safety'

  return (
    <div className="text-white max-w-4xl">
      {/* Back */}
      <Link href="/courses" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
        ← Back to Courses
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-12 mb-6">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ backgroundColor: accent }} />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-8" style={{ backgroundColor: accent }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5" style={{ backgroundColor: `${accent}25`, color: accentLight }}>
            {badgeLabel}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
          <p className="text-white/55 text-lg leading-relaxed max-w-2xl mb-8">{course.tagline}</p>

          {/* Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {course.highlights.map((h) => (
              <div key={h.label} className="bg-black/20 rounded-xl p-4 border border-white/8">
                <div className="text-xl mb-1">{h.icon}</div>
                <div className="text-white/40 text-xs mb-0.5">{h.label}</div>
                <div className="text-white font-semibold text-sm">{h.value}</div>
              </div>
            ))}
          </div>

          {/* Key features */}
          <div className="flex flex-wrap gap-2 mb-8">
            {course.keyFeatures.map((f) => (
              <span key={f} className="text-xs px-3 py-1.5 rounded-full border text-white/60 border-white/15 bg-white/5">
                ✓ {f}
              </span>
            ))}
          </div>

          {/* CTA */}
          <a
            href={course.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-base"
            style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}
          >
            Enroll Now →
          </a>
        </div>
      </div>

      {/* Fees */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {course.fees.map((f, i) => (
          <div key={f.label} className={`rounded-2xl p-5 border flex items-center justify-between ${i === 0 ? 'border-white/20 bg-white/8' : 'border-white/10 bg-white/4'}`}>
            <span className="text-white/60 text-sm">{f.label}</span>
            <span className={`font-bold text-lg ${i === 0 ? 'text-white' : 'text-white/50'}`}>{f.price}</span>
          </div>
        ))}
      </div>

      {/* Overview */}
      {course.overview && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            Overview
          </h2>
          <p className="text-white/60 leading-relaxed whitespace-pre-line">{course.overview}</p>
        </div>
      )}

      {/* Learning Objectives */}
      {course.objectives.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="font-bold text-xl mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            Learning Objectives
          </h2>
          <ul className="space-y-3">
            {course.objectives.map((o) => (
              <li key={o} className="flex gap-3 text-white/65 text-sm leading-relaxed">
                <span className="mt-0.5 shrink-0 text-xs" style={{ color: accent }}>✓</span>
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Audience */}
      {course.audience.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="font-bold text-xl mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            Who This Course is For
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {course.audience.map((a) => (
              <div key={a} className="flex gap-2 text-white/60 text-sm">
                <span style={{ color: accentLight }}>→</span>
                {a}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outline */}
      {course.outline.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            Course Outline
          </h2>
          <div className="space-y-5">
            {course.outline.map((section, i) => (
              <div key={section.title} className="border border-white/8 rounded-xl p-5">
                <div className="flex gap-3 mb-3">
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: accent }}>
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-sm text-white/90 leading-snug">{section.title}</h3>
                </div>
                <ul className="ml-9 space-y-1">
                  {section.points.map((p) => (
                    <li key={p} className="text-white/45 text-sm flex gap-2">
                      <span className="opacity-50">·</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructors */}
      {course.instructors.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
            Instructors
          </h2>
          <div className="space-y-6">
            {course.instructors.map((ins) => (
              <div key={ins.name} className="flex gap-4 pb-6 border-b border-white/6 last:border-0 last:pb-0">
                <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: `${accent}30`, border: `1px solid ${accent}40` }}>
                  {ins.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{ins.name}</div>
                  <div className="text-xs mb-2" style={{ color: accentLight }}>{ins.role}</div>
                  <p className="text-white/50 text-sm leading-relaxed">{ins.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CEUs */}
      {course.ceus && course.ceus !== 'TBD' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-center">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Continuing Education</div>
          <div className="text-white font-semibold">{course.ceus}</div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="rounded-3xl p-8 sm:p-12 text-center" style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}08)`, border: `1px solid ${accent}30` }}>
        <h2 className="font-bold text-2xl mb-2">Ready to enroll?</h2>
        <p className="text-white/50 mb-6">Join industry professionals advancing hydrogen aviation certification.</p>
        <a
          href={course.buyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-base"
          style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}
        >
          Enroll Now →
        </a>
      </div>
    </div>
  )
}
