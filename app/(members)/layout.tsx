import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isEmailWhitelisted } from '@/lib/members'
import Navbar from '@/components/navbar'

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress

  if (!primaryEmail || !(await isEmailWhitelisted(primaryEmail))) {
    redirect('/not-authorized')
  }

  return (
    <div className="min-h-screen bg-[#04080F]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">{children}</main>
    </div>
  )
}
