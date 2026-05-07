import { NextRequest, NextResponse } from 'next/server'
import { setUserTierByEmail } from '@/lib/members'

// Zeffy sends a webhook on payment completion.
// Payload structure (log and verify in your Zeffy dashboard → Settings → Integrations):
//   { email, firstName, lastName, amount, currency, formId, ... }
// The exact field path may vary — check the raw log below if upgrade isn't triggering.

export async function POST(req: NextRequest) {
  const secret = process.env.ZEFFY_WEBHOOK_SECRET

  // Verify shared secret if configured (Zeffy passes it as a header or query param).
  // Until Zeffy confirms their verification method, we accept a token in the header.
  if (secret) {
    const providedToken =
      req.headers.get('x-zeffy-secret') ??
      req.nextUrl.searchParams.get('secret')

    if (providedToken !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Log the raw payload so you can verify the field structure in Vercel logs.
  console.log('[zeffy-webhook] payload:', JSON.stringify(body, null, 2))

  // Try the most common email field paths from Zeffy's unified data structure.
  const email =
    (body.email as string | undefined) ??
    ((body.registrant as Record<string, unknown> | undefined)?.email as string | undefined) ??
    ((body.donor as Record<string, unknown> | undefined)?.email as string | undefined) ??
    ((body.data as Record<string, unknown> | undefined)?.email as string | undefined)

  if (!email) {
    console.warn('[zeffy-webhook] No email found in payload — check the log above and update field path')
    return NextResponse.json({ error: 'Email not found in payload' }, { status: 422 })
  }

  await setUserTierByEmail(email, 'paid')
  console.log(`[zeffy-webhook] Upgraded ${email} to paid tier`)

  return NextResponse.json({ ok: true })
}
