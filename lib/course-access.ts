import { hasCourseMembership, hasEventMembership, hasIndividualCourseAccess, hasIndividualEventAccess } from './members'

export async function hasCourseAccess(clerkId: string, courseSlug: string): Promise<boolean> {
  if (await hasCourseMembership(clerkId)) return true
  return hasIndividualCourseAccess(clerkId, courseSlug)
}

export async function hasEventAccess(clerkId: string, eventSlug: string): Promise<boolean> {
  if (await hasEventMembership(clerkId)) return true
  return hasIndividualEventAccess(clerkId, eventSlug)
}

// Kept for backward compat — true if user has any paid membership
export async function hasPaidAccess(clerkId: string): Promise<boolean> {
  return hasCourseMembership(clerkId)
}
