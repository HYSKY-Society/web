import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { isEmailWhitelisted } from '@/lib/members'

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()

  let evt: WebhookEvent
  try {
    const wh = new Webhook(secret)
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // On new sign-up, log whether they're in the Google Sheet.
  // The actual access check happens in (members)/layout.tsx — this is informational only.
  if (evt.type === 'user.created') {
    const primaryEmail = evt.data.email_addresses?.find(
      (e) => e.id === evt.data.primary_email_address_id
    )?.email_address

    if (primaryEmail) {
      const allowed = await isEmailWhitelisted(primaryEmail)
      if (!allowed) {
        console.warn(`[webhook] Sign-up from non-member email: ${primaryEmail}`)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
