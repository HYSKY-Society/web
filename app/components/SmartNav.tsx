import { auth } from '@clerk/nextjs/server'
import PublicNav from './PublicNav'
import Navbar from '@/components/navbar'

// Shows the member Navbar when logged in, PublicNav when logged out.
export default async function SmartNav() {
  const { userId } = auth()
  return userId ? <Navbar /> : <PublicNav />
}
