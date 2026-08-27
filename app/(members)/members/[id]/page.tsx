import { currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMemberProfile, getUserTier, hasVipCommunityAccess, TIER_LABELS, Tier } from '@/lib/members'
import MessageMemberButton from './MessageMemberButton'
import ProfileAccessTease from './ProfileAccessTease'
import { getProfileContacts } from '@/lib/profile-contacts'
import { isAdmin } from '@/lib/admin'
import ContactEmailAction from './ContactEmailAction'
import { getZohoProfileDetails } from '@/lib/zoho-crm'
import MemberAvatar from '@/app/components/MemberAvatar'

function uniqueContactValues(values: Array<string | null | undefined>) {
  return [...new Map(
    values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => [value.toLowerCase(), value]),
  ).values()]
}

function parseContactValues(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function meaningfulTitle(value: string | null | undefined) {
  const cleaned = value?.trim() ?? ''
  return /^(x|n\/?a|none|-|unknown)$/i.test(cleaned) ? null : (cleaned || null)
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    free:                  'bg-white/8 text-white/50',
    instructor:            'bg-amber-500/20 text-amber-300',
    member_courses:        'bg-[#5d00f5]/20 text-[#9b6dff]',
    member_courses_events: 'bg-[#5d00f5]/25 text-[#b38fff]',
    member_full:           'vip-tier-badge bg-[#13dce8]/15 text-[#13dce8]',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[tier] ?? 'bg-white/8 text-white/50'}`}>
      {TIER_LABELS[tier as Tier] ?? tier}
    </span>
  )
}

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const user = await currentUser()
  const userId = user!.id
  const viewerEmail = user!.emailAddresses.find((entry) => entry.id === user!.primaryEmailAddressId)?.emailAddress ?? ''
  const [viewerTier, member] = await Promise.all([
    getUserTier(userId),
    getMemberProfile(params.id),
  ])

  if (!member) notFound()
  const [contacts, zohoDetails] = await Promise.all([
    member.isPending ? Promise.resolve(null) : getProfileContacts(params.id),
    getZohoProfileDetails(params.id, member.email),
  ])
  const canUseVipCommunity = hasVipCommunityAccess(viewerTier) || isAdmin(viewerEmail)

  const name        = member.displayName || 'HySky Member'
  const isOwnProfile = userId === member.id
  const canSeePrivateDetails = canUseVipCommunity || isOwnProfile
  const contactEmails = uniqueContactValues([member.email, ...parseContactValues(contacts?.additionalEmails), ...(zohoDetails?.emails ?? [])])
  const contactPhones = uniqueContactValues([contacts?.phoneNumber, ...parseContactValues(contacts?.phoneNumbers), ...(zohoDetails?.phoneNumbers ?? [])])
  const companyWebsites = uniqueContactValues([contacts?.companyWebsite, zohoDetails?.companyWebsite])
  const professionalTitle = meaningfulTitle(member.jobTitle) ?? meaningfulTitle(zohoDetails?.jobTitle)
  const professionalCompany = member.company ?? zohoDetails?.accountName
  const professionalLocation = [
    contacts?.contactCity ?? zohoDetails?.contactCity,
    contacts?.contactState ?? zohoDetails?.contactState,
    contacts?.contactCountry ?? zohoDetails?.contactCountry,
  ].filter(Boolean).join(', ')
  const companyWhatWeDo = contacts?.companyWhatWeDo ?? zohoDetails?.companyWhatWeDo

  return (
    <div className="text-white max-w-3xl">
      {/* Back */}
      <Link href="/members" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
        ← Back to Directory
      </Link>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <MemberAvatar name={name} url={member.avatarUrl} size={96} className="border-2 border-white/10" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{name}</h1>
              <TierBadge tier={member.tier} />
            </div>
            {member.headline && (
              <p className="text-white/60 text-base mb-3">{member.headline}</p>
            )}
            {member.location && (
              <div className="flex flex-wrap gap-4 text-sm text-white/40">
                <span className="flex items-center gap-1.5">
                  <span>📍</span> {member.location}
                </span>
              </div>
            )}
          </div>
          {isOwnProfile ? (
            <Link
              href="/profile"
              className="shrink-0 text-sm text-[#9b6dff] hover:text-white border border-[#5d00f5]/40 hover:border-[#5d00f5] px-4 py-2 rounded-lg transition-colors"
            >
              Edit Profile
            </Link>
          ) : (
            <MessageMemberButton
              memberId={member.id}
              name={name}
              avatarUrl={member.avatarUrl}
              canMessage={canUseVipCommunity}
            />
          )}
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">About</h2>
          <p className="text-white/75 leading-relaxed whitespace-pre-wrap">{member.bio}</p>
        </div>
      )}

      {/* Member-entered professional details take priority over the Zoho import. */}
      {(professionalCompany || professionalTitle || professionalLocation || companyWhatWeDo) && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Professional Details</h2>
          <div className="space-y-2">
            {professionalCompany && <p className="text-lg font-semibold text-white">{professionalCompany}</p>}
            {professionalTitle && <p className="text-sm text-white/60">{professionalTitle}</p>}
            {professionalLocation && <p className="text-sm text-white/50">{professionalLocation}</p>}
            {companyWhatWeDo && (
              <div className="pt-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/35">What We Do</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/65">{companyWhatWeDo}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!canUseVipCommunity && !isOwnProfile && <ProfileAccessTease name={name} />}

      {/* Contact / Links */}
      {canSeePrivateDetails && (member.linkedinUrl || member.twitterUrl || member.website || contactEmails.length > 0 || contactPhones.length > 0 || companyWebsites.length > 0) && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Contact & Links</h2>
          <div className="flex flex-col gap-3">
            {contactEmails.map((email) => <ContactEmailAction key={email} email={email} />)}
            {contactPhones.map((phoneNumber) => (
              <a key={phoneNumber} href={`tel:${phoneNumber}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-base group-hover:bg-[#5d00f5]/20 transition-colors">📞</span>
                <span>{phoneNumber}</span>
              </a>
            ))}
            {companyWebsites.map((companyWebsite) => (
              <a key={companyWebsite} href={companyWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-base group-hover:bg-[#5d00f5]/20 transition-colors">🌐</span>
                <span className="truncate">{companyWebsite.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            ))}
            {member.linkedinUrl && (
              <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-base group-hover:bg-[#5d00f5]/20 transition-colors">in</span>
                <span className="truncate">{member.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
              </a>
            )}
            {member.twitterUrl && (
              <a href={member.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center font-bold text-xs group-hover:bg-[#5d00f5]/20 transition-colors">𝕏</span>
                <span className="truncate">{member.twitterUrl.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '@')}</span>
              </a>
            )}
            {member.website && (
              <a href={member.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-base group-hover:bg-[#5d00f5]/20 transition-colors">🌐</span>
                <span className="truncate">{member.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Member since */}
      <p className="text-white/20 text-xs text-center">
        Member since {new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
      </p>
    </div>
  )
}
