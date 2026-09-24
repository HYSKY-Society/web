import { currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isDirectoryAdmin } from '@/lib/admin'
import { getCompanyDirectory } from '@/lib/company-directory'
import { db } from '@/lib/db'
import { ensureProfileContactsTable } from '@/lib/profile-contacts'
import {
  pendingTiers,
  profileContacts,
  userProfiles,
  users,
  zohoPendingProfileDetails,
  zohoProfileDetails,
} from '@/lib/schema'
import { ensureZohoProfileDetailsTable } from '@/lib/zoho-crm'
import ConfirmDeleteButton from './ConfirmDeleteButton'
import { deleteCompany, deletePerson, saveCompany, savePerson } from './actions'

export const dynamic = 'force-dynamic'

const fieldClass = 'w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#13dce8]/60'
const labelClass = 'space-y-1 text-xs font-semibold text-white/55'

function parseList(serialized: string | null | undefined) {
  try {
    const parsed = JSON.parse(serialized ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string').join('\n') : ''
  } catch {
    return ''
  }
}

function clean(value: string | null | undefined) {
  return value?.trim() || ''
}

function Field({ label, name, defaultValue = '', type = 'text', placeholder = '' }: {
  label: string
  name: string
  defaultValue?: string | null
  type?: string
  placeholder?: string
}) {
  return (
    <label className={labelClass}>
      <span>{label}</span>
      <input className={fieldClass} type={type} name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder} />
    </label>
  )
}

function Area({ label, name, defaultValue = '', rows = 3, placeholder = '' }: {
  label: string
  name: string
  defaultValue?: string | null
  rows?: number
  placeholder?: string
}) {
  return (
    <label className={`${labelClass} block`}>
      <span>{label}</span>
      <textarea className={fieldClass} name={name} defaultValue={defaultValue ?? ''} rows={rows} placeholder={placeholder} />
    </label>
  )
}

export default async function DirectoryAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; person?: string }>
}) {
  const viewer = await currentUser()
  if (!viewer) redirect('/sign-in')
  const viewerEmail = viewer.emailAddresses.find((entry) => entry.id === viewer.primaryEmailAddressId)?.emailAddress ?? ''
  if (!isDirectoryAdmin(viewerEmail)) redirect('/admin')

  await Promise.all([ensureZohoProfileDetailsTable(), ensureProfileContactsTable()])
  const [companies, activeRows, pendingRows] = await Promise.all([
    getCompanyDirectory({ includeContactDetails: true }),
    db.select({
      id: users.id,
      email: users.email,
      tier: users.tier,
      createdAt: users.createdAt,
      displayName: userProfiles.displayName,
      headline: userProfiles.headline,
      bio: userProfiles.bio,
      location: userProfiles.location,
      manualCompany: userProfiles.company,
      manualJobTitle: userProfiles.jobTitle,
      website: userProfiles.website,
      linkedinUrl: userProfiles.linkedinUrl,
      twitterUrl: userProfiles.twitterUrl,
      avatarUrl: userProfiles.avatarUrl,
      isVisible: userProfiles.isVisible,
      accountId: zohoProfileDetails.accountId,
      accountName: zohoProfileDetails.accountName,
      contactName: zohoProfileDetails.contactName,
      zohoJobTitle: zohoProfileDetails.jobTitle,
      zohoEmails: zohoProfileDetails.emails,
      zohoPhones: zohoProfileDetails.phoneNumbers,
      manualEmails: profileContacts.additionalEmails,
      manualPhones: profileContacts.phoneNumbers,
      contactCity: profileContacts.contactCity,
      contactState: profileContacts.contactState,
      contactCountry: profileContacts.contactCountry,
      zohoContactCity: zohoProfileDetails.contactCity,
      zohoContactState: zohoProfileDetails.contactState,
      zohoContactCountry: zohoProfileDetails.contactCountry,
    })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(profileContacts, eq(users.id, profileContacts.userId))
      .leftJoin(zohoProfileDetails, eq(users.id, zohoProfileDetails.userId)),
    db.select({
      email: pendingTiers.email,
      tier: pendingTiers.tier,
      createdAt: pendingTiers.createdAt,
      displayName: pendingTiers.name,
      avatarUrl: pendingTiers.avatarUrl,
      accountId: zohoPendingProfileDetails.accountId,
      accountName: zohoPendingProfileDetails.accountName,
      jobTitle: zohoPendingProfileDetails.jobTitle,
      emails: zohoPendingProfileDetails.emails,
      phoneNumbers: zohoPendingProfileDetails.phoneNumbers,
      contactCity: zohoPendingProfileDetails.contactCity,
      contactState: zohoPendingProfileDetails.contactState,
      contactCountry: zohoPendingProfileDetails.contactCountry,
    })
      .from(pendingTiers)
      .leftJoin(zohoPendingProfileDetails, eq(pendingTiers.email, zohoPendingProfileDetails.email)),
  ])

  const params = await searchParams
  const view = params.view === 'companies' ? 'companies' : 'people'
  const query = params.q?.trim().toLowerCase() ?? ''
  const selectedPerson = params.person?.trim() ?? ''
  const companyIdFor = (accountId: string | null, accountName: string | null) =>
    accountId ?? companies.find((company) => company.name.toLowerCase() === clean(accountName).toLowerCase())?.id ?? ''

  const people = [
    ...activeRows.map((person) => ({
      kind: 'active' as const,
      id: person.id,
      email: person.email,
      tier: person.tier,
      createdAt: person.createdAt,
      displayName: clean(person.displayName) || clean(person.contactName),
      headline: clean(person.headline),
      bio: clean(person.bio),
      location: clean(person.location),
      jobTitle: clean(person.manualJobTitle) || clean(person.zohoJobTitle),
      companyId: companyIdFor(person.accountId, person.manualCompany || person.accountName),
      companyName: clean(person.manualCompany) || clean(person.accountName),
      website: clean(person.website),
      linkedinUrl: clean(person.linkedinUrl),
      twitterUrl: clean(person.twitterUrl),
      avatarUrl: clean(person.avatarUrl),
      isVisible: person.isVisible !== false,
      emails: parseList(person.manualEmails ?? person.zohoEmails),
      phoneNumbers: parseList(person.manualPhones ?? person.zohoPhones),
      contactCity: clean(person.contactCity) || clean(person.zohoContactCity),
      contactState: clean(person.contactState) || clean(person.zohoContactState),
      contactCountry: clean(person.contactCountry) || clean(person.zohoContactCountry),
    })),
    ...pendingRows.map((person) => ({
      kind: 'pending' as const,
      id: person.email,
      email: person.email,
      tier: person.tier,
      createdAt: person.createdAt,
      displayName: clean(person.displayName),
      headline: '',
      bio: '',
      location: '',
      jobTitle: clean(person.jobTitle),
      companyId: companyIdFor(person.accountId, person.accountName),
      companyName: clean(person.accountName),
      website: '',
      linkedinUrl: '',
      twitterUrl: '',
      avatarUrl: clean(person.avatarUrl),
      isVisible: true,
      emails: parseList(person.emails),
      phoneNumbers: parseList(person.phoneNumbers),
      contactCity: clean(person.contactCity),
      contactState: clean(person.contactState),
      contactCountry: clean(person.contactCountry),
    })),
  ].sort((a, b) => (a.displayName || a.email).localeCompare(b.displayName || b.email))

  const visiblePeople = query
    ? people.filter((person) => [person.displayName, person.email, person.companyName, person.jobTitle].some((entry) => entry.toLowerCase().includes(query)))
    : people
  const visibleCompanies = query
    ? companies.filter((company) => [company.name, company.category, company.city, company.state, company.country].some((entry) => clean(entry).toLowerCase().includes(query)))
    : companies

  const tabHref = (nextView: 'people' | 'companies') => `/admin/directory?view=${nextView}${query ? `&q=${encodeURIComponent(query)}` : ''}`

  return (
    <div className="max-w-5xl text-white">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="mb-3 inline-block text-sm text-white/45 hover:text-white">← Back to Admin</Link>
          <h1 className="text-3xl font-bold">Directory Management</h1>
          <p className="mt-1 text-sm text-white/45">Danielle-only controls for people, companies, and company associations.</p>
        </div>
        <div className="rounded-xl border border-[#13dce8]/20 bg-[#13dce8]/8 px-4 py-3 text-xs text-[#8ff7ff]">
          {people.length} people · {companies.length} companies
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          <Link href={tabHref('people')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === 'people' ? 'bg-[#5d00f5] text-white' : 'text-white/45 hover:text-white'}`}>People</Link>
          <Link href={tabHref('companies')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === 'companies' ? 'bg-[#5d00f5] text-white' : 'text-white/45 hover:text-white'}`}>Companies</Link>
        </div>
        <form className="min-w-[260px] flex-1" method="get">
          <input type="hidden" name="view" value={view} />
          <input className={fieldClass} type="search" name="q" defaultValue={query} placeholder={`Search ${view}…`} />
        </form>
      </div>

      {view === 'people' ? (
        <div className="space-y-3">
          {visiblePeople.map((person) => (
            <details
              key={`${person.kind}:${person.id}`}
              id={`${person.kind}:${person.id}` === selectedPerson ? 'selected-person' : undefined}
              open={`${person.kind}:${person.id}` === selectedPerson}
              className="group scroll-mt-6 rounded-2xl border border-white/10 bg-white/5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{person.displayName || 'Unnamed member'}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${person.kind === 'pending' ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'}`}>
                      {person.kind === 'pending' ? 'Has not signed in' : 'Active'}
                    </span>
                  </div>
                  <p className="truncate text-xs text-white/40">{person.email}{person.companyName ? ` · ${person.companyName}` : ''}</p>
                </div>
                <span className="text-xs text-white/35 group-open:rotate-180">▼</span>
              </summary>
              <div className="border-t border-white/8 p-5">
                <form action={savePerson} className="space-y-5">
                  <input type="hidden" name="kind" value={person.kind} />
                  <input type="hidden" name="personId" value={person.id} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Display name" name="displayName" defaultValue={person.displayName} />
                    <Field label="Job title" name="jobTitle" defaultValue={person.jobTitle} />
                    <label className={labelClass}>
                      <span>Membership</span>
                      <select className={fieldClass} name="tier" defaultValue={person.tier}>
                        <option value="free">Free</option>
                        <option value="member_courses">Courses member</option>
                        <option value="member_courses_events">Courses + events</option>
                        <option value="member_full">VIP member</option>
                      </select>
                    </label>
                  </div>
                  <label className={`${labelClass} block`}>
                    <span>Company association</span>
                    <select className={fieldClass} name="companyId" defaultValue={person.companyId}>
                      <option value="">No company</option>
                      {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                    </select>
                    <span className="block font-normal text-white/30">Changing this moves the person to the selected company and removes empty duplicate companies automatically.</span>
                  </label>

                  {person.kind === 'active' && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Headline" name="headline" defaultValue={person.headline} />
                        <Field label="Public location" name="location" defaultValue={person.location} />
                      </div>
                      <Area label="Bio" name="bio" defaultValue={person.bio} />
                    </>
                  )}

                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="City" name="contactCity" defaultValue={person.contactCity} />
                    <Field label="State / province" name="contactState" defaultValue={person.contactState} />
                    <Field label="Country" name="contactCountry" defaultValue={person.contactCountry} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Area label="Additional email addresses" name="emails" defaultValue={person.emails} rows={3} placeholder="One per line" />
                    <Area label="Phone numbers" name="phoneNumbers" defaultValue={person.phoneNumbers} rows={3} placeholder="One per line" />
                  </div>

                  {person.kind === 'active' && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Website" name="website" defaultValue={person.website} type="url" />
                      <Field label="LinkedIn" name="linkedinUrl" defaultValue={person.linkedinUrl} type="url" />
                      <Field label="X / Twitter" name="twitterUrl" defaultValue={person.twitterUrl} type="url" />
                      <Field label="Avatar URL" name="avatarUrl" defaultValue={person.avatarUrl} type="url" />
                    </div>
                  )}
                  {person.kind === 'pending' && <Field label="Avatar URL" name="avatarUrl" defaultValue={person.avatarUrl} type="url" />}

                  {person.kind === 'active' && (
                    <label className="flex items-center gap-2 text-sm text-white/65">
                      <input type="checkbox" name="isVisible" defaultChecked={person.isVisible} /> Visible in directory
                    </label>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
                    <p className="text-xs text-white/30">Primary email: {person.email} {person.kind === 'active' ? '(managed by Clerk)' : ''}</p>
                    <button type="submit" className="rounded-lg bg-[#5d00f5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7020ff]">Save person</button>
                  </div>
                </form>
                <form action={deletePerson} className="mt-3 flex justify-end">
                  <input type="hidden" name="kind" value={person.kind} />
                  <input type="hidden" name="personId" value={person.id} />
                  <ConfirmDeleteButton confirmation={`Delete ${person.displayName || person.email}? This permanently removes ${person.kind === 'active' ? 'their Connect and Clerk account plus all related content' : 'their pending profile and pending messages'}.`}>
                    Delete person
                  </ConfirmDeleteButton>
                </form>
              </div>
            </details>
          ))}
          {visiblePeople.length === 0 && <p className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/40">No people match that search.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleCompanies.map((company) => (
            <details key={company.id} className="group rounded-2xl border border-white/10 bg-white/5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold">{company.name}</p>
                  <p className="text-xs text-white/40">{company.contacts.length} associated contact{company.contacts.length === 1 ? '' : 's'}</p>
                </div>
                <span className="text-xs text-white/35 group-open:rotate-180">▼</span>
              </summary>
              <div className="border-t border-white/8 p-5">
                <form action={saveCompany} className="space-y-4">
                  <input type="hidden" name="companyId" value={company.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Company name" name="name" defaultValue={company.name} />
                    <Field label="Industry / category" name="category" defaultValue={company.category} />
                    <Field label="Website" name="website" defaultValue={company.website} />
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="City" name="city" defaultValue={company.city} />
                      <Field label="State" name="state" defaultValue={company.state} />
                      <Field label="Country" name="country" defaultValue={company.country} />
                    </div>
                  </div>
                  <Area label="What we do" name="summary" defaultValue={company.summary} rows={4} />
                  <div>
                    <p className="mb-2 text-xs font-semibold text-white/45">Associated people</p>
                    <div className="flex flex-wrap gap-2">
                      {company.contacts.map((contact) => (
                        <Link
                          key={contact.memberId}
                          href={`/admin/directory?view=people&person=${encodeURIComponent(`${contact.isPending ? 'pending' : 'active'}:${contact.isPending ? contact.emails[0] : contact.memberId}`)}#selected-person`}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 transition-colors hover:border-[#13dce8]/40 hover:bg-[#13dce8]/10 hover:text-[#8ff7ff]"
                          title={`Edit ${contact.name}`}
                        >
                          {contact.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-white/8 pt-4">
                    <button type="submit" className="rounded-lg bg-[#5d00f5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7020ff]">Save company</button>
                  </div>
                </form>
                <form action={deleteCompany} className="mt-3 flex justify-end">
                  <input type="hidden" name="companyId" value={company.id} />
                  <ConfirmDeleteButton confirmation={`Delete ${company.name}? Its ${company.contacts.length} associated contact${company.contacts.length === 1 ? '' : 's'} will be detached but not deleted.`}>
                    Delete company
                  </ConfirmDeleteButton>
                </form>
              </div>
            </details>
          ))}
          {visibleCompanies.length === 0 && <p className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/40">No companies match that search.</p>}
        </div>
      )}
    </div>
  )
}
