import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'

export default function NotAuthorizedPage() {
  return (
    <main className="min-h-screen bg-[#04080F] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔒</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Membership Required</h1>
        <p className="text-white/50 leading-relaxed mb-8">
          Your email address is not on the HYSKY Society member list.
          Access requires an active paid membership through our registration portal.
        </p>

        <div className="space-y-3">
          <a
            href="https://www.zeffy.com/en-US/ticketing/hysky-societys-membership"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#5d00f5] hover:bg-[#4a00c4] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Join HYSKY Society →
          </a>

          <SignOutButton redirectUrl="/sign-in">
            <button className="w-full text-white/35 hover:text-white/60 text-sm transition-colors py-2.5">
              Sign out and try a different account
            </button>
          </SignOutButton>
        </div>

        <p className="text-white/25 text-xs mt-8">
          Already paid?{' '}
          <a
            href="mailto:admin@hysky.org"
            className="text-[#5d00f5]/70 hover:text-[#5d00f5] transition-colors"
          >
            Contact admin@hysky.org
          </a>{' '}
          for access.
        </p>
      </div>
    </main>
  )
}
