import { createHash, timingSafeEqual } from 'crypto'
import { revalidatePath } from 'next/cache'
import { syncZohoDirectory, syncZohoRecord } from '@/lib/zoho-live-sync'

export const runtime = 'nodejs'
export const maxDuration = 300

function authorized(supplied: string | null) {
  const expected = process.env.ZOHO_WEBHOOK_SECRET
  if (!expected || !supplied) return false
  return timingSafeEqual(createHash('sha256').update(supplied).digest(), createHash('sha256').update(expected).digest())
}

async function payload(request: Request) {
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) return await request.json() as Record<string, unknown>
  const form = await request.formData()
  return Object.fromEntries(form.entries())
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  if (!authorized(request.headers.get('x-hysky-webhook-secret'))) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const body = await payload(request)
    const moduleName = text(body.module || body.moduleName || body.module_api_name)
    const recordId = text(body.recordId || body.record_id || body.id)
    console.log('[zoho/webhook] received', { moduleName, recordId, targeted: Boolean(moduleName && recordId) })

    const result = moduleName && recordId
      ? await syncZohoRecord(moduleName, recordId)
      : await syncZohoDirectory()
    revalidatePath('/members')
    revalidatePath('/companies')
    revalidatePath('/admin/directory')
    console.log('[zoho/webhook] completed', result)
    return Response.json({ ok: true, result })
  } catch (error) {
    console.error('[zoho/webhook] failed', { error: String(error), stack: (error as Error).stack })
    return Response.json({ ok: false, error: 'Zoho webhook synchronization failed.' }, { status: 500 })
  }
}
