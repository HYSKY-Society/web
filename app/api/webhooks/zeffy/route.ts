import { NextRequest, NextResponse } from 'next/server'
import { setUserTierByEmail } from '@/lib/members'

// Zeffy webhook payload structure (payment.completed event):
// { type: "payment.completed", data: { buyer: { email, first_name, last_name }, ... } }
// Zeffy has no built-in signing — authenticate via ?secret= query param instead.

export async function POST(req: NextRequest) {
  const secret = process.env.ZEFFY_WEBHOOK_SECRET

  if (secret) {
    const providedToken = req.nextUrl.searchParams.get('secret')
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

  const data = body.data as Record<string, unknown> | undefined
  const buyer = data?.buyer as Record<string, unknown> | undefined
  const email = buyer?.email as string | undefined

  if (!email) {
    console.warn('[zeffy-webhook] No email found in payload:', JSON.stringify(body, null, 2))
    return NextResponse.json({ error: 'Email not found in payload' }, { status: 422 })
  }

  await setUserTierByEmail(email, 'paid')
  console.log(`[zeffy-webhook] Upgraded ${email} to paid tier`)

  return NextResponse.json({ ok: true })
}
