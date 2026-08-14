'use server'

import { currentUser } from '@clerk/nextjs/server'
import { getUserTier, hasVipCommunityAccess, upsertProfile } from '@/lib/members'
import { revalidatePath } from 'next/cache'
import { upsertProfileContacts } from '@/lib/profile-contacts'
import { isAdmin } from '@/lib/admin'

export async function saveProfile(
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await currentUser()
  if (!user) return { error: 'Not authenticated' }
  const userId = user.id
  const email = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? ''

  const tier = await getUserTier(userId)
  const canEditLinks = hasVipCommunityAccess(tier)
  const canManageVisibility = isAdmin(email)

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
    isVisible:   canManageVisibility ? bool('isVisible') : true,
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
