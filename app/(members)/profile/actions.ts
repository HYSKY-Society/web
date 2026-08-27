'use server'

import { currentUser } from '@clerk/nextjs/server'
import { upsertProfile } from '@/lib/members'
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

  const canManageVisibility = isAdmin(email)

  const str = (key: string) => {
    const v = formData.get(key)
    return typeof v === 'string' && v.trim() ? v.trim() : null
  }
  const bool = (key: string) => formData.get(key) === 'true'
  const listValues = (key: string) => {
    const value = str(key)
    if (!value) return []
    return [...new Map(
      value
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => [item.toLowerCase(), item]),
    ).values()]
  }
  const additionalEmails = listValues('additionalEmails')
  const phoneNumbers = listValues('phoneNumbers')

  await upsertProfile(userId, {
    displayName: str('displayName'),
    headline:    str('headline'),
    bio:         str('bio'),
    location:    str('location'),
    company:     str('company'),
    jobTitle:    str('jobTitle'),
    avatarUrl:   str('avatarUrl'),
    isVisible:   canManageVisibility ? bool('isVisible') : true,
    website:     str('website'),
    linkedinUrl: str('linkedinUrl'),
    twitterUrl:  str('twitterUrl'),
  })

  await upsertProfileContacts(userId, {
    companyWebsite:  str('companyWebsite'),
    phoneNumber:     phoneNumbers[0] ?? null,
    additionalEmails: JSON.stringify(additionalEmails),
    phoneNumbers:     JSON.stringify(phoneNumbers),
    companyWhatWeDo:  str('companyWhatWeDo'),
    companyCity:      str('companyCity'),
    companyState:     str('companyState'),
    companyCountry:   str('companyCountry'),
    contactCity:      str('contactCity'),
    contactState:     str('contactState'),
    contactCountry:   str('contactCountry'),
  })

  revalidatePath('/members')
  revalidatePath(`/members/${userId}`)
  revalidatePath('/profile')
  revalidatePath('/companies')

  return { success: true }
}
