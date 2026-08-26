import Link from 'next/link'
import { notFound } from 'next/navigation'
import SidebarIcon from '@/app/components/SidebarIcon'
import { companyLocation, getPreviewCompany, previewCompanies } from '@/lib/company-directory-preview'

export function generateStaticParams() {
  return previewCompanies.map((company) => ({ slug: company.slug }))
}

export default function CompanyPreviewPage({ params }: { params: { slug: string } }) {
  const company = getPreviewCompany(params.slug)
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
              <span className="rounded-full bg-[#5d00f5]/15 px-2.5 py-1 text-[10px] font-semibold text-[#9b6dff]">Preview company</span>
            </div>
            <p className="font-medium text-[#9b6dff]">{company.category}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/50 sm:flex-row sm:flex-wrap sm:gap-5">
              <span className="flex items-center gap-2"><SidebarIcon name="location" className="h-4 w-4" />{companyLocation(company)}</span>
              <span className="flex items-center gap-2"><SidebarIcon name="globe" className="h-4 w-4" />{company.website}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/45">What We Do</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{company.summary}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Associated Contacts</h2>
            <p className="mt-1 text-xs text-white/40">HySky Connect members associated with this company.</p>
          </div>
          <span className="rounded-full bg-[#13dce8]/10 px-2.5 py-1 text-xs font-semibold text-[#13dce8]">{company.contacts.length}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {company.contacts.map((contact, index) => {
            const initials = contact.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
            return (
              <div key={contact.name} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3.5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${index % 2 === 0 ? 'bg-[#5d00f5]' : 'bg-emerald-500'}`}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{contact.name}</p>
                  <p className="truncate text-xs text-white/45">{contact.title}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
