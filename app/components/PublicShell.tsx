import PublicShellClient from './PublicShellClient'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return <PublicShellClient isLoggedIn={false}>{children}</PublicShellClient>
}
