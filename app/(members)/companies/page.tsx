import CompanyDirectoryPreview from './CompanyDirectoryPreview'
import { getCompanyDirectory } from '@/lib/company-directory'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const companies = await getCompanyDirectory()
  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Company Directory</h1>
        <p className="mt-1.5 text-white/45">Explore organizations connected to the HySky community.</p>
      </div>
      <CompanyDirectoryPreview companies={companies} />
    </div>
  )
}
