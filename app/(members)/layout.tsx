import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureUser } from '@/lib/members'
import Navbar from '@/components/navbar'

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress

  if (!primaryEmail) {
    redirect('/sign-in')
  }

  // Ensure the user exists in the DB. Creates them with free tier if not found
  // (handles pre-existing Clerk accounts created before the DB was introduced).
  await ensureUser(user.id, primaryEmail)

  return (
    <div className="min-h-screen bg-[#04080F]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">{children}</main>
    </div>
  )
}
