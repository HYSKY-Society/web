import { currentUser } from '@clerk/nextjs/server'
import { hasCourseAccess } from '@/lib/course-access'
import Link from 'next/link'

const accent = '#d97706'
const accentLight = '#fbbf24'

const lectures = [
  {
    id: '1',
    title: 'What Is Public Policy? (And How It Actually Shapes Industries)',
    videoUrl: 'https://www.youtube.com/embed/8KiEev5aPCs',
    slidesUrl: null,
  },
  {
    id: '2',
    title: 'Understanding Policy Gaps in Hydrogen Aviation',
    videoUrl: 'https://www.youtube.com/embed/dtKjB7VvKUc',
    slidesUrl: 'https://drive.google.com/file/d/1wxuBI50wPi7MNFmEnkbgRtyj8v8YBeg5/view?usp=sharing',
  },
  {
    id: '3',
    title: 'VFS Case Study & FAA Case Study',
    videoUrl: 'https://www.youtube.com/embed/F9comieSTpU',
    slidesUrl: null,
  },
  {
    id: '4',
    title: 'How and When to Engage with a Lobbying Firm',
    videoUrl: 'https://www.youtube.com/embed/mCLtuY71FTk',
    slidesUrl: null,
  },
  {
    id: '5',
    title: 'Capstone Launch: Contacting Your Members',
    videoUrl: 'https://www.youtube.com/embed/MfxBoAFEkjA',
    slidesUrl: null,
  },
  {
    id: '6',
    title: 'Lecture 6',
    videoUrl: null,
    slidesUrl: null,
  },
]

export default async function CourseContentPage() {
  const user = await currentUser()
  const hasAccess = user ? await hasCourseAccess(user.id, 'h2-aviation-policy') : false

  if (!hasAccess) {
    return (
      <div className="text-white max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Course Access Required</h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          This content is available to enrolled students. Purchase the course to access all lectures.
        </p>
        <a
          href="https://www.zeffy.com/embed/ticketing/h2-aviation-policy-and-power"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-sm"
          style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}
        >
          Enroll Now →
        </a>
        <div className="mt-4">
          <Link href="/courses/h2-aviation-policy" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Back to course overview
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-white max-w-4xl">
      <Link
        href="/courses/h2-aviation-policy"
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
            🏛️ Policy Course
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">H2 Aviation Policy &amp; Power</h1>
          <p className="text-white/50 text-sm">6 lectures · 12 classroom hours · Certificate of Completion</p>
        </div>
      </div>

      <div className="space-y-5">
        {lectures.map((lecture) => (
          <div key={lecture.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-4 p-6 pb-4">
              <div
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: lecture.videoUrl ? accent : '#ffffff15' }}
              >
                {lecture.id}
              </div>
              <h2 className={`font-semibold text-sm leading-snug ${lecture.videoUrl ? 'text-white' : 'text-white/35'}`}>
                {lecture.title}
                {!lecture.videoUrl && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-white/15 text-white/35">Upcoming</span>
                )}
              </h2>
            </div>

            {lecture.videoUrl ? (
              <div className="mx-6 mb-4 rounded-xl overflow-hidden aspect-video bg-black">
                <iframe
                  src={`${lecture.videoUrl}?rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="mx-6 mb-4 rounded-xl aspect-video bg-white/3 border border-white/8 flex items-center justify-center">
                <span className="text-white/20 text-sm">Video coming soon</span>
              </div>
            )}

            <div className="px-6 pb-5">
              {lecture.slidesUrl ? (
                <a
                  href={lecture.slidesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border transition-colors hover:bg-white/8"
                  style={{ borderColor: accentLight, color: accentLight }}
                >
                  ↓ Download Slides
                </a>
              ) : (
                lecture.videoUrl && <span className="text-white/20 text-xs">No slides for this lecture</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl p-6 text-center border border-white/10 bg-white/5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Upon Completion</div>
        <div className="text-white font-semibold text-sm">12 classroom hours · 1.2 CEU · 12 PDH · Certificate of Completion</div>
      </div>
    </div>
  )
}
