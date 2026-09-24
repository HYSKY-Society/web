import { revalidatePath } from 'next/cache'
import { syncZohoDirectory } from '@/lib/zoho-live-sync'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  console.log('[cron/zoho-sync] started')
  try {
    const result = await syncZohoDirectory()
    revalidatePath('/members')
    revalidatePath('/companies')
    revalidatePath('/admin/directory')
    console.log('[cron/zoho-sync] completed', result)
    return Response.json({ ok: true, result })
  } catch (error) {
    console.error('[cron/zoho-sync] failed', { error: String(error), stack: (error as Error).stack })
    return Response.json({ ok: false, error: 'Zoho synchronization failed.' }, { status: 500 })
  }
}
