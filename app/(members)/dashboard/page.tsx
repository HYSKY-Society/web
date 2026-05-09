import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { courses } from '@/lib/courses'
import {
  getUserTier, getMemberStats, getUserCourseSlugs, getUserEventSlugs,
  TIER_LABELS, TIERS_WITH_COURSES, TIERS_WITH_EVENTS, Tier,
} from '@/lib/members'

// Minimum tier needed to access all courses / all events
const COURSE_TIER: Tier = 'member_courses'
const EVENT_TIER:  Tier = 'member_courses_events'

function TierBadge({ tier }: { tier: Tier }) {
  const colours: Record<Tier, string> = {
    free:                  'bg-white/10 text-white/50',
    instructor:            'bg-amber-500/20 text-amber-300',
    member_courses:        'bg-[#5d00f5]/20 text-[#9b6dff]',
    member_courses_events: 'bg-[#5d00f5]/25 text-[#b38fff]',
    member_full:           'bg-[#13dce8]/15 text-[#13dce8]',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colours[tier]}`}>
      {TIER_LABELS[tier]}
    </span>
  )
}

function LibraryPill({ owned }: { owned: boolean }) {
  if (owned) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
        ✓ In My Library
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/8 text-white/35">
      Not in library
    </span>
  )
}

function GatePill({ requiredTier }: { requiredTier: Tier }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300/80">
      Available on {TIER_LABELS[requiredTier]}
    </span>
  )
}

export default async function DashboardPage() {
  const user = await currentUser()
  const firstName = user?.firstName || 'Member'

  const [tier, stats, ownedCourses, ownedEvents] = await Promise.all([
    getUserTier(user!.id),
    getMemberStats(),
    getUserCourseSlugs(user!.id),
    getUserEventSlugs(user!.id),
  ])

  const hasCourseAccess = (TIERS_WITH_COURSES as Tier[]).includes(tier)
  const hasEventAccess  = (TIERS_WITH_EVENTS  as Tier[]).includes(tier)

  const statCards = [
    { label: 'Members',         value: stats.totalMembers.toLocaleString() },
    { label: 'Podcast Episodes', value: stats.podcastEpisodes > 0 ? String(stats.podcastEpisodes) : '—' },
    { label: 'Courses',          value: String(courses.length) },
    { label: 'Your Tier',        value: <TierBadge tier={tier} /> },
  ]

  return (
    <div className="text-white">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1.5">Welcome back, {firstName}</h1>
        <p className="text-white/40">Here&apos;s what&apos;s happening in hydrogen aviation.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-2xl font-bold text-[#5d00f5]">{s.value}</div>
            <div className="text-white/45 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div className="mb-10">
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5d00f5]" />
          Courses
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((course, i) => {
            const owned = hasCourseAccess || ownedCourses.includes(course.slug)
            return (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-[#5d00f5]/50 rounded-2xl p-6 transition-all hover:bg-white/8 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#5d00f5]/10"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${i === 0 ? 'bg-[#5d00f5]' : 'bg-[#00D4D4]'}`} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${i === 0 ? 'bg-[#5d00f5]/20 text-[#9b6dff]' : 'bg-[#00D4D4]/15 text-[#00D4D4]'}`}>
                      {i === 0 ? '✈️ Certification' : '🛡️ Safety'}
                    </div>
                    <LibraryPill owned={owned} />
                  </div>
                  <h3 className="font-bold text-base text-white mb-2 leading-snug group-hover:text-[#c4a0ff] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-3">
                    {course.tagline}
                  </p>
                  {!owned && <GatePill requiredTier={COURSE_TIER} />}
                  <div className="flex items-center gap-1 text-[#5d00f5] group-hover:text-[#9b6dff] text-sm font-medium transition-colors mt-3">
                    View course <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Events */}
      <div className="mb-10">
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#13dce8]" />
          Events
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[{ slug: 'flying-hy-2025', title: 'FLYING HY 2025', desc: 'The 3rd Global Hydrogen Aviation Conference', date: 'Mar 2025' }, { slug: 'flying-hy-2026', title: 'FLYING HY 2026', desc: 'The 4th Global Hydrogen Aviation Conference', date: 'Nov 4, 2026' }].map((event) => {
            const owned = hasEventAccess || ownedEvents.includes(event.slug)
            return (
              <div key={event.slug} className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 bg-[#13dce8]" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#13dce8]/15 text-[#13dce8]">
                      🌐 Conference
                    </div>
                    <LibraryPill owned={owned} />
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">{event.title}</h3>
                  <p className="text-white/45 text-sm mb-3">{event.desc}</p>
                  <p className="text-white/30 text-xs mb-3">{event.date}</p>
                  {!owned && <GatePill requiredTier={EVENT_TIER} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upgrade CTA for free members */}
      {tier === 'free' && (
        <div className="mb-10 rounded-2xl p-6 border border-[#5d00f5]/30 bg-[#5d00f5]/8">
          <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-widest mb-2">Unlock Full Access</div>
          <h3 className="font-bold text-lg mb-2">Upgrade your membership</h3>
          <p className="text-white/50 text-sm mb-4">
            Get access to all courses, events, the full member directory, and more with a paid membership.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-[#5d00f5] hover:bg-[#7c2fff] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            View Membership Options →
          </Link>
        </div>
      )}

      {/* Next event sidebar card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" />
        <div className="bg-[#00D4D4]/5 border border-[#00D4D4]/20 rounded-2xl p-6">
          <div className="text-[#00D4D4] text-xs font-semibold uppercase tracking-wider mb-2">Next Event</div>
          <div className="text-white/60 text-xs mb-0.5">The 4th Global</div>
          <div className="text-white font-bold text-sm mb-1">FLYING HY 2026 Conference</div>
          <div className="text-white/40 text-xs mb-4">Nov 4, 2026 · Zoom · 9:00 AM – 5:00 PM CT</div>
          <a
            href="https://www.zeffy.com/en-US/ticketing/flying-hy--2026"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-teal-glow block w-full text-white text-sm py-2.5 rounded-lg font-medium text-center"
          >
            Register Now
          </a>
        </div>
      </div>
    </div>
  )
}
