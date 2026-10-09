import { redirect } from 'next/navigation'
import { FLYING_HY_WIX_URL } from '@/lib/flying-hy-url'

export default function EventSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(params.slug === 'flying-hy-2026' ? FLYING_HY_WIX_URL : `/events/${params.slug}`)
}
