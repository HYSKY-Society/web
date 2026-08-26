'use client'

import { useState } from 'react'
import Link from 'next/link'
import SidebarIcon from '@/app/components/SidebarIcon'
import { companyLocation, type PreviewCompany } from '@/lib/company-directory-preview'

export default function CompanyDirectoryPreview({ companies }: { companies: PreviewCompany[] }) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('All countries')
  const countries = ['All countries', ...Array.from(new Set(companies.map((company) => company.country))).sort()]
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = companies.filter((company) => {
    const matchesCountry = country === 'All countries' || company.country === country
    const matchesQuery = !normalizedQuery || [company.name, company.category, companyLocation(company)]
      .some((value) => value.toLowerCase().includes(normalizedQuery))
    return matchesCountry && matchesQuery
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search companies</span>
          <SidebarIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by company, specialty, or location…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#5d00f5]/50"
          />
        </label>
        <label>
          <span className="sr-only">Filter by country</span>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="h-full min-h-11 rounded-xl border border-white/10 bg-[var(--bg-card)] px-4 text-sm text-white outline-none focus:border-[#5d00f5]/50"
          >
            {countries.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <p className="mb-5 text-xs text-white/35">{filtered.length} compan{filtered.length === 1 ? 'y' : 'ies'}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((company, index) => (
          <Link
            key={company.slug}
            href={`/companies/${company.slug}`}
            className="group flex min-h-64 flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-0.5 hover:border-[#5d00f5]/40 hover:bg-white/8"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${index % 2 === 0 ? 'bg-[#5d00f5]' : 'bg-[#13dce8]'}`}
                style={index % 2 === 0 ? undefined : { color: '#071018' }}
              >
                {company.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold leading-tight text-white">{company.name}</h2>
                <p className="mt-1 text-xs font-medium text-[#9b6dff]">{company.category}</p>
              </div>
            </div>

            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/55">{company.summary}</p>

            <div className="mt-4 space-y-2 text-xs text-white/45">
              <div className="flex items-start gap-2">
                <SidebarIcon name="location" className="h-4 w-4" />
                <span>{companyLocation(company)}</span>
              </div>
              <div className="flex items-center gap-2">
                <SidebarIcon name="globe" className="h-4 w-4" />
                <span className="truncate">{company.website}</span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-4 text-xs">
              <span className="text-white/40">{company.contacts.length} Connect contact{company.contacts.length === 1 ? '' : 's'}</span>
              <span className="font-medium text-[#9b6dff] group-hover:underline">View company →</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center text-sm text-white/40">
          No companies match this search.
        </div>
      )}
    </div>
  )
}
