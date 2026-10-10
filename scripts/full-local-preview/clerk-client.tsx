'use client'

const user = { id: 'mock_owner', firstName: 'Danielle', lastName: 'McLean', imageUrl: null, primaryEmailAddressId: 'mock_owner_email', emailAddresses: [{ id: 'mock_owner_email', emailAddress: 'd@hy-sky.net' }] }
export function ClerkProvider({ children }: { children: React.ReactNode }) { return <>{children}</> }
export function useClerk() { return { openUserProfile: () => alert('Local preview: account settings are mocked.'), signOut: async () => alert('Local preview: signed in as Danielle.') } }
export function useUser() { return { user, isLoaded: true, isSignedIn: true } }
export function useAuth() { return { userId: user.id, isLoaded: true, isSignedIn: true, getToken: async () => 'local-preview' } }
export function SignedIn({ children }: { children: React.ReactNode }) { return <>{children}</> }
export function SignedOut() { return null }
export function UserButton() { return <span>DM</span> }
export function SignInButton({ children }: { children?: React.ReactNode }) { return <>{children ?? 'Local sign-in'}</> }
export function SignOutButton({ children }: { children?: React.ReactNode }) { return <>{children ?? 'Local sign-out'}</> }
export function SignIn() { return <p>Local preview is signed in as d@hy-sky.net. <a href="/admin">Open Admin</a></p> }
export function SignUp() { return <SignIn /> }
