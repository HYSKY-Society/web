import { NextRequest, NextResponse } from 'next/server'
import { setUserTierByEmail, getUserByEmail, addCoursePurchase, addEventPurchase } from '@/lib/members'
import type { Tier } from '@/lib/members'

// Zeffy webhook payload: PaymentCompletedEvent
// { type: "payment.completed", data: { description, campaign_type, items[], buyer: { email } } }
// No built-in signing — authenticate via ?secret= query param.

export async function POST(req: NextRequest) {
  const secret = process.env.ZEFFY_WEBHOOK_SECRET
  if (secret) {
    const provided = req.nextUrl.searchParams.get('secret')
    if (provided !== secret) {
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
    console.warn('[zeffy-webhook] No email in payload:', JSON.stringify(body, null, 2))
    return NextResponse.json({ error: 'Email not found' }, { status: 422 })
  }

  const description = ((data?.description as string) ?? '').toLowerCase()
  const items = (data?.items as Array<Record<string, unknown>>) ?? []
  const firstItemDesc = ((items[0]?.description as string) ?? '').toLowerCase()

  // Route by campaign description
  if (description.includes('membership')) {
    // Determine tier from the purchased ticket type
    let tier: Tier = 'member_courses'
    if (firstItemDesc.includes('full') || firstItemDesc.includes('visibility') || firstItemDesc.includes('sponsor')) {
      tier = 'member_full'
    } else if (firstItemDesc.includes('event')) {
      tier = 'member_courses_events'
    }
    await setUserTierByEmail(email, tier)
    console.log(`[zeffy-webhook] Membership: upgraded ${email} to ${tier}`)

  } else if (description.includes('h2 aircraft') || description.includes('certification')) {
    const user = await getUserByEmail(email)
    if (user) {
      await addCoursePurchase(user.id, 'h2-aircraft-certification')
      console.log(`[zeffy-webhook] Course purchase: h2-aircraft-certification for ${email}`)
    } else {
      console.warn(`[zeffy-webhook] Course purchase for unknown user ${email} — they must sign up first`)
    }

  } else if (description.includes('flying hy') || description.includes('flying-hy')) {
    const user = await getUserByEmail(email)
    if (user) {
      await addEventPurchase(user.id, 'flying-hy-2026')
      console.log(`[zeffy-webhook] Event purchase: flying-hy-2026 for ${email}`)
    } else {
      console.warn(`[zeffy-webhook] Event purchase for unknown user ${email} — they must sign up first`)
    }

  } else {
    // Fallback: unknown campaign — log full payload for debugging
    console.warn('[zeffy-webhook] Unknown campaign — full payload:', JSON.stringify(body, null, 2))
    // Still upgrade to basic membership rather than silently failing
    await setUserTierByEmail(email, 'member_courses')
    console.log(`[zeffy-webhook] Unknown campaign fallback: upgraded ${email} to member_courses`)
  }

  return NextResponse.json({ ok: true })
}
