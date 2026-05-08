import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { discountCodes, users } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { getUserByClerkId } from '@/lib/members'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const { code } = await req.json() as { code?: string }
  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  }

  const normalized = code.trim().toUpperCase()

  const discount = await db.query.discountCodes.findFirst({
    where: eq(discountCodes.code, normalized),
  })

  if (!discount) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 404 })
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Code has expired' }, { status: 410 })
  }

  if (discount.usesRemaining !== null && discount.usesRemaining <= 0) {
    return NextResponse.json({ error: 'Code has no uses remaining' }, { status: 410 })
  }

  const member = await getUserByClerkId(userId)
  if (!member) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (member.tier === 'member_full') {
    return NextResponse.json({ message: 'Already a full member' }, { status: 200 })
  }

  // Discount codes grant full membership — upgrade and decrement in one transaction
  await db.transaction(async (tx) => {
    await tx.update(users).set({ tier: 'member_full' }).where(eq(users.id, userId))

    if (discount.usesRemaining !== null) {
      await tx
        .update(discountCodes)
        .set({ usesRemaining: sql`${discountCodes.usesRemaining} - 1` })
        .where(eq(discountCodes.id, discount.id))
    }
  })

  return NextResponse.json({ ok: true })
}
