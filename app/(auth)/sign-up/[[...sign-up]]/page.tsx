import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#04080F] flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 text-center group flex flex-col items-center">
        <Image src="/logo-white.png" alt="HYSKY Society" height={44} width={150} className="object-contain" />
        <p className="text-white/35 text-sm mt-2 group-hover:text-white/50 transition-colors">
          Create Your Member Account
        </p>
      </Link>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#5d00f5',
            colorBackground: '#0D0818',
            colorText: '#E8F4FD',
            colorTextSecondary: '#8B90C0',
            colorInputBackground: '#160F33',
            colorInputText: '#E8F4FD',
            borderRadius: '0.75rem',
          },
          elements: {
            card: 'shadow-2xl shadow-black/50 border border-white/10',
            headerTitle: 'text-white',
            headerSubtitle: 'text-white/50',
            socialButtonsBlockButton: 'border-white/20 text-white hover:bg-white/10',
            socialButtonsBlockButtonText: 'text-white/80',
            dividerLine: 'bg-white/10',
            dividerText: 'text-white/30',
            formButtonPrimary: 'bg-[#5d00f5] hover:bg-[#4a00c4]',
            footerActionLink: 'text-[#00D4D4] hover:text-[#33FFFF]',
            formFieldLabel: 'text-white/60',
          },
        }}
      />
    </main>
  )
}
