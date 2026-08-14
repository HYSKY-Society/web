import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { hasCourseAccess } from '@/lib/course-access'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ hasAccess: false }, { status: 401 })
  }

  const hasAccess = await hasCourseAccess(user.id, params.slug)
  return NextResponse.json(
    { hasAccess },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
