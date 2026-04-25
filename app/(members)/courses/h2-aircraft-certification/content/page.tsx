import { currentUser } from '@clerk/nextjs/server'
import { hasCourseAccess } from '@/lib/course-access'
import Link from 'next/link'

const TAB = 'H2 AC Cert'
const accent = '#5d00f5'
const accentLight = '#9b6dff'

const modules = [
  {
    number: 1,
    title: 'Intro to Regulations and Standards Developments (US Focus)',
    duration: '~2 hrs',
    lessons: [
      'Basics of aircraft certification',
      'Current hydrogen standards developments',
      'FAA rules on powered-lift, LSA, and UAS',
      'Comparing FAA, EASA, and CAA approaches',
      'Role of SAE and EuroCAE in standards development',
    ],
  },
  {
    number: 2,
    title: 'Certification of Electric and Fuel Cell Propulsion Systems',
    duration: '~2 hrs',
    lessons: [
      'Why electric and fuel cell propulsion?',
      'Regulatory challenges and approaches',
      'FAA vs. EASA comparison',
      'Examples in fixed-wing and rotorcraft',
    ],
  },
  {
    number: 3,
    title: 'Certification Foundations and Regulatory Framework (Canadian Focus)',
    duration: '~2 hrs',
    lessons: [
      'Airworthiness overview — history and purpose',
      'Type vs. product certification',
      'Canadian regulatory structure: Aeronautics Act, CARs, AWM',
      'Foreign validation and bilaterals',
      'Applying the framework to hydrogen systems',
    ],
  },
  {
    number: 4,
    title: 'Introduction to Hydrogen Storage and Fuel Supply on Aircraft',
    duration: '~2 hrs',
    lessons: [
      'Hydrogen storage and fuel supply (gas and liquid)',
      'Design parameters and failure modes',
      'FAA/EASA/CAA regulations on hydrogen storage',
    ],
  },
  {
    number: 5,
    title: 'Ground Handling and Operational Certification',
    duration: '~2 hrs',
    lessons: [
      'Hydrogen aircraft ground handling safety',
      'Fueling infrastructure and operational requirements',
      'Certification pathways and regulatory standards',
      'Staff training and competence requirements',
    ],
  },
  {
    number: 6,
    title: 'Continuing Airworthiness, MRO, and Licensing',
    duration: '~2 hrs',
    lessons: [
      'Continuous airworthiness for hydrogen propulsion',
      'Hydrogen-specific hazards and infrastructure',
      'MRO strategies for hydrogen systems',
      'Training and upskilling for personnel',
    ],
  },
  {
    number: 7,
    title: 'Standardization and Future Policy Directions',
    duration: '~2 hrs',
    lessons: [
      'Role of standardization in hydrogen aviation',
      'Key international organizations and regulators',
      'Policy influence on adoption and certification',
      'Harmonizing global standards',
      'Contribution to decarbonization goals',
    ],
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
      {/* Back */}
      <Link
        href="/courses/h2-aircraft-certification"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
      >
        ← Back to Course Overview
      </Link>

      {/* Header */}
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
          <p className="text-white/50 text-sm">7 modules · 12 classroom hours · Certificate of Completion</p>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((mod) => (
          <div key={mod.number} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {mod.number}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-white text-sm leading-snug mb-0.5">{mod.title}</h2>
                <span className="text-white/35 text-xs">{mod.duration}</span>
              </div>
            </div>
            <ul className="ml-12 space-y-1.5">
              {mod.lessons.map((lesson) => (
                <li key={lesson} className="text-white/45 text-sm flex gap-2">
                  <span className="opacity-40 mt-0.5">·</span>
                  {lesson}
                </li>
              ))}
            </ul>
            {/* Placeholder for future video/content links */}
            <div className="ml-12 mt-4 flex items-center gap-2 text-white/20 text-xs">
              <span>▶</span>
              <span>Content coming soon</span>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate note */}
      <div className="mt-8 rounded-2xl p-6 text-center border border-white/10 bg-white/5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Upon Completion</div>
        <div className="text-white font-semibold text-sm">12 classroom hours · 1.2 CEU · 12 PDH · Certificate of Completion</div>
      </div>
    </div>
  )
}
