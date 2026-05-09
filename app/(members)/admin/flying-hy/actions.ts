'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { flyingHySpeakers, flyingHyAgenda } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function addSpeaker(data: {
  eventYear: number
  name: string
  title: string | null
  organization: string | null
  bio: string | null
  avatarUrl: string | null
  sessionTitle: string | null
  displayOrder: number
}) {
  await db.insert(flyingHySpeakers).values({ ...data, isPublished: true })
  revalidatePath('/flying-hy')
  revalidatePath('/admin/flying-hy')
}

export async function deleteSpeaker(id: string) {
  await db.delete(flyingHySpeakers).where(eq(flyingHySpeakers.id, id))
  revalidatePath('/flying-hy')
  revalidatePath('/admin/flying-hy')
}

export async function addAgendaItem(data: {
  eventYear: number
  timeSlot: string | null
  title: string
  description: string | null
  speakerName: string | null
  sessionType: string
  displayOrder: number
}) {
  await db.insert(flyingHyAgenda).values(data)
  revalidatePath('/flying-hy')
  revalidatePath('/admin/flying-hy')
}

export async function deleteAgendaItem(id: string) {
  await db.delete(flyingHyAgenda).where(eq(flyingHyAgenda.id, id))
  revalidatePath('/flying-hy')
  revalidatePath('/admin/flying-hy')
}
