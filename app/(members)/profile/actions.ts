'use server'

import { auth } from '@clerk/nextjs/server'
import { getUserTier, hasVipCommunityAccess, upsertProfile } from '@/lib/members'
import { revalidatePath } from 'next/cache'
import { upsertProfileContacts } from '@/lib/profile-contacts'

export async function saveProfile(
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const { userId } = auth()
  if (!userId) return { error: 'Not authenticated' }

  const tier = await getUserTier(userId)
  const canEditLinks = hasVipCommunityAccess(tier)

  const str = (key: string) => {
    const v = formData.get(key)
    return typeof v === 'string' && v.trim() ? v.trim() : null
  }
  const bool = (key: string) => formData.get(key) === 'true'

  await upsertProfile(userId, {
    displayName: str('displayName'),
    headline:    str('headline'),
    bio:         str('bio'),
    location:    str('location'),
    company:     str('company'),
    jobTitle:    str('jobTitle'),
    avatarUrl:   str('avatarUrl'),
    isVisible:   bool('isVisible'),
    ...(canEditLinks ? {
      website:     str('website'),
      linkedinUrl: str('linkedinUrl'),
      twitterUrl:  str('twitterUrl'),
    } : {}),
  })

  if (canEditLinks) {
    await upsertProfileContacts(userId, {
      companyWebsite: str('companyWebsite'),
      phoneNumber: str('phoneNumber'),
    })
  }

  revalidatePath('/members')
  revalidatePath(`/members/${userId}`)
  revalidatePath('/profile')

  return { success: true }
}
