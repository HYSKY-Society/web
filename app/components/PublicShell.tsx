import { auth } from '@clerk/nextjs/server'
import PublicShellClient from './PublicShellClient'

export default async function PublicShell({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  return <PublicShellClient isLoggedIn={!!userId}>{children}</PublicShellClient>
}
