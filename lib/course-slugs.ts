const COURSE_SLUG_ALIASES: Record<string, string> = {
  'hydrogen-safety-aviation': 'h2-safety-for-aviation',
  'h2-aviation-policy-power': 'h2-aviation-policy',
}

export function normalizeCourseSlug(courseSlug: string): string {
  return COURSE_SLUG_ALIASES[courseSlug] ?? courseSlug
}

export function getCourseSlugVariants(courseSlug: string): string[] {
  const canonicalSlug = normalizeCourseSlug(courseSlug)
  const aliases = Object.entries(COURSE_SLUG_ALIASES)
    .filter(([, canonical]) => canonical === canonicalSlug)
    .map(([alias]) => alias)

  return [canonicalSlug, ...aliases]
}


