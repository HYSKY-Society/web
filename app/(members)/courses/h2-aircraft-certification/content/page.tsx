import { currentUser } from '@clerk/nextjs/server'
import { hasCourseAccess } from '@/lib/course-access'
import { getCompletedLessonIds } from '@/lib/course-progress'
import { H2_CERTIFICATION_COURSE_SLUG, h2CertificationLessons } from '@/lib/h2-certification-course'
import { SequentialCourse } from '@/components/SequentialCourse'
import Link from 'next/link'

const accent = '#5d00f5'
const accentLight = '#9b6dff'

export default async function CourseContentPage() {
  const user = await currentUser()
  const hasAccess = user ? await hasCourseAccess(user.id, H2_CERTIFICATION_COURSE_SLUG) : false

  if (!hasAccess) {
    return (
      <div className="text-white max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Course Access Required</h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          This content is available to enrolled HySky members. Purchase the course to access every lesson.
        </p>
        <a
          href="https://www.zeffy.com/en-US/ticketing/h2-aircraft-certification-course"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-sm"
          style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50`, color: '#fff' }}
        >
          Enroll Now →
        </a>
        <div className="mt-4">
          <Link href="/courses/h2-aircraft-certification" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Back to course overview
          </Link>
        </div>
      </div>
    )
  }

  const completedLessonIds = await getCompletedLessonIds(user!.id, H2_CERTIFICATION_COURSE_SLUG)

  return (
    <div className="text-white max-w-4xl">
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
      >
        ← Back to Courses
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
            ✈️ Certification Course
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">H2 Aircraft Certification Course</h1>
          <p className="text-white/50 text-sm">8 lessons · 12 classroom hours · Certificate of Completion</p>
        </div>
      </div>

      <SequentialCourse
        courseSlug={H2_CERTIFICATION_COURSE_SLUG}
        lessons={h2CertificationLessons}
        initialCompletedLessonIds={completedLessonIds}
      />

      <div className="mt-8 rounded-2xl p-6 text-center border border-white/10 bg-white/5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Upon Completion</div>
        <div className="text-white font-semibold text-sm">12 classroom hours · 1.2 CEU · 12 PDH · Certificate of Completion</div>
      </div>
    </div>
  )
}
