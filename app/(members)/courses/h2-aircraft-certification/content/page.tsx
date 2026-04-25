import { currentUser } from '@clerk/nextjs/server'
import { hasCourseAccess } from '@/lib/course-access'
import Link from 'next/link'

const TAB = 'H2 AC Cert'
const accent = '#5d00f5'
const accentLight = '#9b6dff'

const lectures = [
  {
    id: '1a',
    title: 'Overview of the H2 Aircraft Certification Course',
    videoUrl: 'https://www.youtube.com/embed/myMWfHsr39k',
    slidesUrl: 'https://drive.google.com/file/d/1aje70g7daQQEeFTsNe2_RLHQCmBpUjRb/view',
  },
  {
    id: '1b',
    title: 'Intro to Regulations and Standards Developments (Focus on US Regulations)',
    videoUrl: 'https://www.youtube.com/embed/YnIu2NHQK-s',
    slidesUrl: 'https://drive.google.com/file/d/1YZLAtexpB98RDyE8LgQLDgYrIZmtqTMR/view',
  },
  {
    id: '2',
    title: 'Certification of Electric and Fuel Cell Propulsion Systems',
    videoUrl: 'https://www.youtube.com/embed/Gbca7qfNKtc',
    slidesUrl: 'https://drive.google.com/file/d/1oXEC0SuT2uXNqOXx0CkSWdfA3FyGdUQZ/view',
  },
  {
    id: '3a',
    title: 'Certification Foundations & Regulatory Framework (Focus on Canadian Regulations)',
    videoUrl: 'https://www.youtube.com/embed/5ct466ooJKw',
    slidesUrl: 'https://drive.google.com/file/d/1YksbvU6LrbdrKxi58hu_W3I-E59wo2Mw/view',
  },
  {
    id: '3b',
    title: 'Introduction to Hydrogen Storage and Fuel Supply on Aircraft',
    videoUrl: 'https://www.youtube.com/embed/6rN7USthQtI',
    slidesUrl: 'https://drive.google.com/file/d/1iG4nhn-YkTgHq8wWWGkRsxib4A0jmcWg/view',
  },
  {
    id: '4',
    title: 'Ground Handling and Operational Certification Requirements for Hydrogen Aircraft – EASA and FAA Perspectives',
    videoUrl: 'https://www.youtube.com/embed/9iOxDcd-u78',
    slidesUrl: 'https://drive.google.com/file/d/1HSVeNDp1ZzUVmzctiWh6yx8Sz_xXb8cl/view',
  },
  {
    id: '5',
    title: 'Policy, Continuous Airworthiness, and MRO Challenges for Hydrogen Aviation Fuel: Building a Safe and Sustainable Hydrogen Future',
    videoUrl: 'https://www.youtube.com/embed/wdaA59iiA08',
    slidesUrl: 'https://drive.google.com/file/d/1RQijkd95FY2ZfufYHK6WKOKT9UI6HFzf/view',
  },
  {
    id: '6',
    title: 'Standardization & Future Policy Directions for Hydrogen in Aviation',
    videoUrl: 'https://www.youtube.com/embed/AlQKadS8I04',
    slidesUrl: 'https://drive.google.com/file/d/1g_xjpFn4UMi6rbKUNdEvQ2BKxas5QOt8/view',
  },
]

export default async function CourseContentPage() {
  const user = await currentUser()
  const primaryEmail = user?.emailAddresses?.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress

  const hasAccess = primaryEmail ? await hasCourseAccess(primaryEmail, TAB) : false

  if (!hasAccess) {
    return (
      <div className="text-white max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Course Access Required</h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          Your account <span className="text-white/70">{primaryEmail}</span> hasn&apos;t been enrolled in the H2 Aircraft Certification Course yet.
          If you&apos;ve already purchased, please allow a few minutes and refresh the page.
        </p>
        <a
          href="https://www.zeffy.com/en-US/ticketing/h2-aircraft-certification-course"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.03] hover:shadow-2xl text-sm"
          style={{ backgroundColor: accent, boxShadow: `0 8px 32px ${accent}50` }}
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

  return (
    <div className="text-white max-w-4xl">
      <Link
        href="/courses/h2-aircraft-certification"
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
            ✈️ Certification Course
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">H2 Aircraft Certification Course</h1>
          <p className="text-white/50 text-sm">8 lectures · 12 classroom hours · Certificate of Completion</p>
        </div>
      </div>

      <div className="space-y-5">
        {lectures.map((lecture) => (
          <div key={lecture.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Lecture header */}
            <div className="flex items-center gap-4 p-6 pb-4">
              <div
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {lecture.id}
              </div>
              <h2 className="font-semibold text-white text-sm leading-snug">{lecture.title}</h2>
            </div>

            {/* Video */}
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

            {/* Slides */}
            <div className="px-6 pb-5">
              {lecture.slidesUrl ? (
                <a
                  href={lecture.slidesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border transition-colors hover:bg-white/8"
                  style={{ borderColor: '#00D4D4', color: '#00D4D4' }}
                >
                  ↓ Download Slides
                </a>
              ) : (
                <span className="text-white/20 text-xs">Slides coming soon</span>
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
