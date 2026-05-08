export type Event = {
  slug: string
  title: string
  subtitle?: string
  tagline: string
  date: string
  time: string
  format: string
  description: string
  isFree: boolean
  attendeeEmbedSlug?: string
  sponsorshipEmbedSlug?: string
  zoomLink?: string
}

export const events: Event[] = [
  {
    slug: 'flying-hy-2026',
    title: 'FLYING HY 2026',
    subtitle: 'The 4th Global Hydrogen Aviation Conference',
    tagline: "The world's largest annual hydrogen aviation event.",
    date: 'November 4, 2026',
    time: '9:00 AM – 5:00 PM CT',
    format: 'Virtual (Zoom)',
    description: "Bringing together innovators, researchers, regulators, and industry leaders from across air and aerospace to advance the future of hydrogen aviation.",
    isFree: false,
    attendeeEmbedSlug: 'flying-hy--2026',
    sponsorshipEmbedSlug: 'flying-hy-2026-new',
  },
]

export function getEvent(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug)
}
