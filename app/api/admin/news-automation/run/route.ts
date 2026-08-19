import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  if (!isAdmin(email)) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const url = process.env.NEWS_AUTOMATION_RUN_URL
  const secret = process.env.NEWS_AUTOMATION_SECRET
  if (!url) return Response.json({ error: 'Manual-run connection is not configured.' }, { status: 503 })
  if (!secret) return Response.json({ error: 'Manual-run authentication is not configured.' }, { status: 503 })
  try {
    const body = await request.json().catch(() => ({}))
    const topic = typeof body?.topic === 'string' ? body.topic.trim().slice(0, 1000) : ''
    const action = typeof body?.action === 'string' ? body.action.trim().slice(0, 40) : 'run'
    const sourceUrl = typeof body?.source_url === 'string' ? body.source_url.trim().slice(0, 2000) : ''
    const companyId = typeof body?.company_id === 'string' ? body.company_id.trim().slice(0, 100) : ''
    const excludedCompanyIds = Array.isArray(body?.excluded_company_ids)
      ? body.excluded_company_ids
          .filter((value: unknown): value is string => typeof value === 'string')
          .map((value: string) => value.trim().slice(0, 100))
          .filter(Boolean)
          .slice(0, 200)
      : []
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'x-hysky-automation-secret': secret, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        action,
        source_url: sourceUrl,
        company_id: companyId,
        excluded_company_ids: excludedCompanyIds,
      }),
    })
    const text = await response.text()
    let payload: unknown = text
    try { payload = JSON.parse(text) } catch { /* keep Azure plain-text errors */ }
    if (!response.ok) return Response.json({ error: 'Azure run failed.', details: payload }, { status: 502 })
    return Response.json(payload)
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Could not reach Azure.' }, { status: 502 })
  }
}

