import { currentUser } from '@clerk/nextjs/server'
import { hasCourseAccess } from '@/lib/course-access'
import Link from 'next/link'

const accent = '#00D4D4'
const accentLight = '#33ffff'

export default async function CourseContentPage() {
  const user = await currentUser()
  const hasAccess = user ? await hasCourseAccess(user.id, 'h2-safety-for-aviation') : false

  if (!hasAccess) {
    return (
      <div className="text-white max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Course Access Required</h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          This content is available to enrolled students. Purchase the course to access all lectures.
        </p>
        <a
          href="https://www.zeffy.com/en-US/ticketing/h2-safety-for-aviation-course"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-sm"
          style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}
        >
          Enroll Now →
        </a>
        <div className="mt-4">
          <Link href="/courses/h2-safety-for-aviation" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Back to course overview
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-white max-w-4xl">
      <Link
        href="/courses/h2-safety-for-aviation"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
      >
        ← Back to Course Overview
      </Link>

      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-8"
        style={{ background: `linear-gradient(135deg, ${accent}25, ${accent}08)`, border: `1px solid ${accent}40` }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ backgroundColor: accent }} />
        <div className="relative">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: `${accent}25`, color: accentLight }}
          >
            🛡️ Safety Course
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">H2 Safety for Aviation</h1>
          <p className="text-white/50 text-sm">Course content coming soon</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="font-bold text-xl mb-3">Content Coming Soon</h2>
        <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
          Lecture recordings and materials for H2 Safety for Aviation are being prepared.
          You&apos;ll be notified by email when content is available.
        </p>
      </div>
    </div>
  )
}
