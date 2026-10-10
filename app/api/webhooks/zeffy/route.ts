import { NextRequest, NextResponse } from 'next/server'

import { setUserTierByEmail, getUserByEmail, addCoursePurchase, addEventPurchase } from '@/lib/members'
import type { Tier } from '@/lib/members'
import { grantNewsSubscriptionByEmail } from '@/lib/news'

// Zeffy webhook payload: PaymentCompletedEvent
// { type: "payment.completed", data: { description, campaign_type, items[], buyer: { email } } }
// Zeffy does not currently document a webhook signature, so the endpoint uses
// a long, secret query parameter and fails closed when it is not configured.

function identifyCourseSlug(purchaseText: string): string | null {
  if (purchaseText.includes('h2 aircraft') || purchaseText.includes('certification')) {
    return 'h2-aircraft-certification'
  }
  if (purchaseText.includes('safety')) {
    return 'h2-safety-for-aviation'
  }
  if (purchaseText.includes('policy')) {
    return 'h2-aviation-policy'
  }
  return null
}

export async function POST(req: NextRequest) {
  const secret = process.env.ZEFFY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[zeffy-webhook] ZEFFY_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook unavailable' }, { status: 503 })
  }

  const provided = req.nextUrl.searchParams.get('secret')
  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.type !== 'payment.completed') {
    return NextResponse.json({ ok: true, ignored: true })
  }

  // Log the payload so field-name changes from Zeffy are visible in Vercel logs.
  console.log('[zeffy-webhook] payload:', JSON.stringify(body, null, 2))

  const data = body.data as Record<string, unknown> | undefined
  const buyer = data?.buyer as Record<string, unknown> | undefined
  const rawEmail = buyer?.email as string | undefined
  const email = rawEmail?.toLowerCase().trim()

  if (!email) {
    console.warn('[zeffy-webhook] No buyer email in payload')
    return NextResponse.json({ error: 'Buyer email not found' }, { status: 422 })
  }

  // Extract order info.
  const eventName = (data?.description as string) ?? 'HySky Society Purchase'
  const paidAt = data?.created_at ? new Date(data.created_at as string) : new Date()
  const description = eventName.toLowerCase()
  const items = (data?.items as Array<Record<string, unknown>>) ?? []
  const itemText = items
    .map(item => `${String(item.name ?? '')} ${String(item.title ?? '')} ${String(item.description ?? '')}`)
    .join(' ')
    .toLowerCase()
  const firstItemDesc = ((items[0]?.description as string) ?? '').toLowerCase()
  const purchaseText = `${description} ${itemText}`
  const courseSlug = identifyCourseSlug(purchaseText)

  // A course can only be purchased for an existing HySky account. Zeffy must
  // use the same email address as Clerk/Connect, otherwise no access is granted.
  const courseBuyer = courseSlug ? await getUserByEmail(email) : null
  if (courseSlug && !courseBuyer) {
    console.error(`[zeffy-webhook] Course purchase has no matching HySky account: ${email}`)
    return NextResponse.json(
      { error: 'No HySky account matches the checkout email' },
      { status: 409 },
    )
  }

  // Route the successful purchase.
  const isNewsPurchase =
    purchaseText.includes('hysky news') ||
    purchaseText.includes('hysky subscription')
  const newsTier =
    purchaseText.includes('annual') || purchaseText.includes('yearly')
      ? 'annual'
      : purchaseText.includes('monthly')
        ? 'monthly'
        : null

  if (isNewsPurchase && newsTier) {
    await grantNewsSubscriptionByEmail(email, newsTier, paidAt)
    console.log(`[zeffy-webhook] News: granted ${email} ${newsTier} access`)

  } else if (description.includes('membership')) {
    let tier: Tier = 'member_courses'
    if (firstItemDesc.includes('full') || firstItemDesc.includes('visibility') || firstItemDesc.includes('sponsor')) {
      tier = 'member_full'
    } else if (firstItemDesc.includes('event')) {
      tier = 'member_courses_events'
    }
    await setUserTierByEmail(email, tier)
    console.log(`[zeffy-webhook] Membership: upgraded ${email} to ${tier}`)

  } else if (courseSlug && courseBuyer) {
    await addCoursePurchase(courseBuyer.id, courseSlug)
    console.log(`[zeffy-webhook] Course: granted ${email} access to ${courseSlug}`)

  } else if (purchaseText.includes('flying hy') || purchaseText.includes('flying-hy')) {
    const user = await getUserByEmail(email)
    if (user) await addEventPurchase(user.id, 'flying-hy-2026')

  } else {
    console.warn('[zeffy-webhook] Unknown campaign:', purchaseText)
  }

  return NextResponse.json({ ok: true })
}
