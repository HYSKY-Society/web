import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { zeffyInvoices } from '@/lib/schema'
import { setUserTierByEmail, getUserByEmail, addCoursePurchase, addEventPurchase } from '@/lib/members'
import type { Tier } from '@/lib/members'
import { grantNewsSubscriptionByEmail } from '@/lib/news'

// Zeffy webhook payload: PaymentCompletedEvent
// { type: "payment.completed", data: { description, campaign_type, items[], buyer: { email } } }
// Zeffy does not currently document a webhook signature, so the endpoint uses
// a long, secret query parameter and fails closed when it is not configured.

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'invoices@hysky.org'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://connect.hysky.org'

function parseAmount(raw: unknown): string {
  if (!raw) return '0.00'
  const n = Number(raw)
  if (isNaN(n)) return '0.00'
  // Zeffy may send cents (e.g. 7500) or dollars (e.g. 75.00)
  return (n > 1000 && Number.isInteger(n) ? n / 100 : n).toFixed(2)
}

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

  // Extract buyer info.
  const firstName = (buyer?.first_name ?? buyer?.firstName ?? '') as string
  const lastName = (buyer?.last_name ?? buyer?.lastName ?? '') as string
  const name = `${firstName} ${lastName}`.trim() || ((buyer?.name as string) ?? email)
  const org = (buyer?.organization ?? buyer?.company ?? '') as string

  // Extract order info.
  const amount = parseAmount(data?.amount ?? data?.total)
  const currency = ((data?.currency as string) ?? 'USD').toUpperCase()
  const orderId = (data?.id ?? data?.order_id ?? data?.orderId ?? '') as string
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

  // Store invoice in DB.
  const [invoice] = await db
    .insert(zeffyInvoices)
    .values({
      email,
      name,
      org: org || null,
      amount,
      currency,
      eventName,
      paidAt,
      zeffyOrderId: orderId || null,
    })
    .returning()

  const invoiceUrl = `${APP_URL}/invoice/${invoice.token}`

  // Send invoice email.
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your HySky Society Invoice — ${eventName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#111827">
          <img src="${APP_URL}/logo-purple.png" alt="HySky Society" style="height:48px;margin-bottom:24px" />
          <h2 style="margin:0 0 8px;font-size:20px;color:#3f11fa">Your invoice is ready</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px">
            Hi ${firstName || name}, thank you for your purchase of <strong>${eventName}</strong>.
            Your formal invoice is attached below — click to view and save as PDF.
          </p>
          <a href="${invoiceUrl}"
             style="display:inline-block;background:#3f11fa;color:#fff;text-decoration:none;
                    padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
            View &amp; Download Invoice →
          </a>
          <p style="margin:32px 0 0;font-size:12px;color:#9ca3af">
            HySky Society · hysky@hysky.org · www.hysky.org<br/>
            This link is unique to your order and can be used any time.
          </p>
        </div>
      `,
    })
    console.log(`[zeffy-webhook] Invoice email sent to ${email}: ${invoiceUrl}`)
  } else {
    console.warn(`[zeffy-webhook] RESEND_API_KEY not set — skipping email. Invoice URL: ${invoiceUrl}`)
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
