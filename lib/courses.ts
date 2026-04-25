export type Course = {
  slug: string
  title: string
  tagline: string
  about: string
  highlights: { icon: string; label: string; value: string }[]
  buyLink: string
}

export const courses: Course[] = [
  {
    slug: 'h2-aircraft-certification',
    title: 'H2 Aircraft Certification Course',
    tagline: 'Navigate the full regulatory pathway for hydrogen-powered aircraft certification.',
    about: 'About this course coming soon.',
    highlights: [
      { icon: '⏱️', label: 'Duration', value: 'TBD' },
      { icon: '📡', label: 'Format', value: 'Online' },
      { icon: '🎓', label: 'Level', value: 'Intermediate' },
      { icon: '📜', label: 'Certificate', value: 'Yes' },
    ],
    buyLink: '#',
  },
  {
    slug: 'h2-safety-for-aviation',
    title: 'H2 Safety for Aviation',
    tagline: 'Essential safety protocols and best practices for hydrogen aviation operations.',
    about: 'About this course coming soon.',
    highlights: [
      { icon: '⏱️', label: 'Duration', value: 'TBD' },
      { icon: '📡', label: 'Format', value: 'Online' },
      { icon: '🎓', label: 'Level', value: 'All levels' },
      { icon: '📜', label: 'Certificate', value: 'Yes' },
    ],
    buyLink: '#',
  },
]

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug)
}
