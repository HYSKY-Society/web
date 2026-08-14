import { currentUser } from '@clerk/nextjs/server'
import { hasCourseAccess } from '@/lib/course-access'
import { getCompletedLessonIds } from '@/lib/course-progress'
import { H2_POLICY_COURSE_SLUG, h2PolicyGuidebook, h2PolicyLessons } from '@/lib/h2-policy-course'
import { SequentialCourse } from '@/components/SequentialCourse'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const accent = '#2563eb'
const accentLight = '#60a5fa'

export default async function CourseContentPage() {
  const user = await currentUser()
  const hasAccess = user ? await hasCourseAccess(user.id, H2_POLICY_COURSE_SLUG) : false
  if (!hasAccess) redirect('/courses/h2-aviation-policy')

  const completedLessonIds = await getCompletedLessonIds(user!.id, H2_POLICY_COURSE_SLUG)
  return <div className="text-white max-w-4xl">
    <Link href="/courses" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">← Back to Courses</Link>
    <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-8" style={{ background: `linear-gradient(135deg, ${accent}25, ${accent}08)`, border: `1px solid ${accent}40` }}><div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ backgroundColor: accent }} /><div className="relative"><div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4" style={{ backgroundColor: `${accent}25`, color: '#000' }}>🏛️ Policy Course</div><h1 className="text-2xl sm:text-3xl font-bold mb-2">H2 Aviation Policy &amp; Power</h1><p className="text-white/50 text-sm">6 lectures · 12 classroom hours · Certificate of Completion</p></div></div>
    <SequentialCourse courseSlug={H2_POLICY_COURSE_SLUG} lessons={h2PolicyLessons} initialCompletedLessonIds={completedLessonIds} guidebook={h2PolicyGuidebook} theme={{ accent, accentHover: '#1d4ed8', complete: accentLight }} />
    <div className="mt-8 rounded-2xl p-6 text-center border border-white/10 bg-white/5"><div className="text-white/40 text-xs uppercase tracking-wider mb-1">Upon Completion</div><div className="text-white font-semibold text-sm">12 classroom hours · 1.2 CEU · 12 PDH · Certificate of Completion</div></div>
  </div>
}
