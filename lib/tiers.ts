// Client-safe tier constants — no server imports

export type Tier = 'free' | 'instructor' | 'member_courses' | 'member_courses_events' | 'member_full'

export const TIER_LABELS: Record<Tier, string> = {
  free:                  'Free',
  instructor:            'Instructor',
  member_courses:        'Courses Member',
  member_courses_events: 'Courses + Events Member',
  member_full:           'Full Member',
}

export const PAID_TIERS: Tier[]         = ['instructor', 'member_courses', 'member_courses_events', 'member_full']
export const TIERS_WITH_COURSES: Tier[] = ['member_courses', 'member_courses_events', 'member_full']
export const TIERS_WITH_EVENTS: Tier[]  = ['member_courses_events', 'member_full']

export function isPaidTier(tier: Tier): boolean {
  return PAID_TIERS.includes(tier)
}

// Safe to use in client components — no server deps
export type MemberListItem = {
  id:          string
  tier:        string
  displayName: string | null
  headline:    string | null
  company:     string | null
  jobTitle:    string | null
  location:    string | null
  avatarUrl:   string | null
  isVisible:   boolean | null
}
