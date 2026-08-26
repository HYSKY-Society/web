import CompanyDirectoryPreview from './CompanyDirectoryPreview'
import { previewCompanies } from '@/lib/company-directory-preview'

export default function CompaniesPage() {
  return (
    <div className="text-white">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full border border-[#5d00f5]/25 bg-[#5d00f5]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9b6dff]">
          Layout preview · fictional data
        </div>
        <h1 className="text-3xl font-bold">Company Directory</h1>
        <p className="mt-1.5 text-white/45">Explore organizations connected to the HySky community.</p>
      </div>
      <CompanyDirectoryPreview companies={previewCompanies} />
    </div>
  )
}
