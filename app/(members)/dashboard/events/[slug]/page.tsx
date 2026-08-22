import { redirect } from 'next/navigation'

export default function EventSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(params.slug === 'flying-hy-2026' ? '/flying-hy' : `/events/${params.slug}`)
}
