import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SidebarIcon from '@/app/components/SidebarIcon'
import MemberAvatar from '@/app/components/MemberAvatar'
import { companyLocation, companyWebsiteHref, getDirectoryCompany } from '@/lib/company-directory'
import { isAdmin } from '@/lib/admin'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'

export const dynamic = 'force-dynamic'

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const viewer = await currentUser()
  const viewerEmail = viewer?.emailAddresses.find((entry) => entry.id === viewer.primaryEmailAddressId)?.emailAddress ?? ''
  const viewerTier = viewer ? await getUserTier(viewer.id) : 'free'
  const canSeeContactDetails = hasVipCommunityAccess(viewerTier) || isAdmin(viewerEmail)
  const company = await getDirectoryCompany(params.slug, { includeContactDetails: canSeeContactDetails })
  if (!company) notFound()

  return (
    <div className="max-w-3xl text-white">
      <Link href="/companies" className="mb-7 inline-flex items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white">
        ← Back to Company Directory
      </Link>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#5d00f5] text-2xl font-black text-white">
            {company.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold sm:text-3xl">{company.name}</h1>
            </div>
            {company.category ? (
              <p className="font-medium text-[#9b6dff]">{company.category}</p>
            ) : null}
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/50 sm:flex-row sm:flex-wrap sm:gap-5">
              {companyLocation(company) && <span className="flex items-center gap-2"><SidebarIcon name="location" className="h-4 w-4" />{companyLocation(company)}</span>}
              {company.website && (
                <a href={companyWebsiteHref(company.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-[#9b6dff]">
                  <SidebarIcon name="globe" className="h-4 w-4" />{company.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {company.summary && (
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/45">What We Do</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/70">{company.summary}</p>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Associated Contacts</h2>
            <p className="mt-1 text-xs text-white/40">HySky Connect members associated with this company.</p>
          </div>
          <span className="rounded-full bg-[#13dce8]/10 px-2.5 py-1 text-xs font-semibold text-[#13dce8]">{company.contacts.length}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {company.contacts.map((contact) => (
              <Link key={contact.memberId} href={`/members/${contact.memberId}`} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3.5 transition-colors hover:border-[#5d00f5]/35 hover:bg-white/7">
                <MemberAvatar name={contact.name} url={contact.avatarUrl} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{contact.name}</p>
                  {contact.title && <p className="truncate text-xs text-white/45">{contact.title}</p>}
                  {canSeeContactDetails && contact.emails.map((email) => (
                    <p key={email} className="truncate text-[11px] text-[#9b6dff]">{email}</p>
                  ))}
                  {canSeeContactDetails && contact.phoneNumbers.map((phoneNumber) => (
                    <p key={phoneNumber} className="truncate text-[11px] text-white/45">{phoneNumber}</p>
                  ))}
                  {contact.location && <p className="truncate text-[11px] text-white/35">{contact.location}</p>}
                </div>
              </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
