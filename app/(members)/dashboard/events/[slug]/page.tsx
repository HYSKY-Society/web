import { redirect } from 'next/navigation'

export default function EventSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/events/${params.slug}`)
}
