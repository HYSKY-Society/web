import { currentUser } from '@clerk/nextjs/server'
import { getProfile } from '@/lib/members'
import { getProfileContacts } from '@/lib/profile-contacts'
import ProfileForm from './ProfileForm'
import { isAdmin } from '@/lib/admin'
import { getZohoProfileDetails } from '@/lib/zoho-crm'

function parseList(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : []
  } catch {
    return []
  }
}

function meaningfulTitle(value: string | null | undefined) {
  const cleaned = value?.trim() ?? ''
  return /^(x|n\/?a|none|-|unknown)$/i.test(cleaned) ? '' : cleaned
}

export default async function ProfilePage() {
  const user = await currentUser()
  const clerkEmail = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  const [profile, contacts, zohoDetails] = await Promise.all([
    getProfile(user!.id),
    getProfileContacts(user!.id),
    getZohoProfileDetails(user!.id, clerkEmail),
  ])

  const clerkName  = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const savedEmails = parseList(contacts?.additionalEmails)
  const savedPhones = parseList(contacts?.phoneNumbers)
  const zohoEmails = (zohoDetails?.emails ?? []).filter((email) => email.toLowerCase() !== clerkEmail.toLowerCase())

  return (
    <div className="text-white max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>
      <ProfileForm
        profile={profile ?? null}
        contacts={contacts}
        importedDefaults={{
          company: zohoDetails?.accountName ?? '',
          jobTitle: meaningfulTitle(zohoDetails?.jobTitle),
          companyWebsite: zohoDetails?.companyWebsite ?? '',
          companyWhatWeDo: zohoDetails?.companyWhatWeDo ?? '',
          companyCity: zohoDetails?.accountCity ?? '',
          companyState: zohoDetails?.accountState ?? '',
          companyCountry: zohoDetails?.accountCountry ?? '',
          contactCity: zohoDetails?.contactCity ?? '',
          contactState: zohoDetails?.contactState ?? '',
          contactCountry: zohoDetails?.contactCountry ?? '',
          additionalEmails: (contacts?.additionalEmails !== null && contacts?.additionalEmails !== undefined ? savedEmails : zohoEmails).join('\n'),
          phoneNumbers: (contacts?.phoneNumbers !== null && contacts?.phoneNumbers !== undefined ? savedPhones : [contacts?.phoneNumber, ...(zohoDetails?.phoneNumbers ?? [])].filter((value): value is string => Boolean(value))).join('\n'),
        }}
        clerkName={clerkName}
        clerkEmail={clerkEmail}
        canManageVisibility={isAdmin(clerkEmail)}
      />
    </div>
  )
}
