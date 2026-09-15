import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'

export default function SignInPage() {
  return (
    <main className="section-dark min-h-screen bg-[#04080F] flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 text-center group flex flex-col items-center">
        <Image src="/logo-white.png" alt="HySky Society" height={44} width={150} className="object-contain" />
        <p className="text-[#aaa6c2] text-sm mt-2 group-hover:text-[#d8d5e6] transition-colors">
          Member Portal
        </p>
      </Link>
      <SignIn
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
            headerTitle: 'text-[#f8f7ff]',
            headerSubtitle: 'text-[#bbb7cf]',
            socialButtonsBlockButton: 'border-white/20 bg-white/[0.03] text-[#f8f7ff] hover:bg-white/10',
            socialButtonsBlockButtonText: 'text-[#f8f7ff]',
            dividerLine: 'bg-white/10',
            dividerText: 'text-[#aaa6c2]',
            formButtonPrimary: 'bg-[#5d00f5] text-white hover:bg-[#4a00c4]',
            footerActionText: 'text-[#bbb7cf]',
            footerActionLink: 'text-[#00D4D4] hover:text-[#33FFFF]',
            identityPreviewText: 'text-[#e4e1ee]',
            formFieldLabel: 'text-[#ddd9e8]',
            formFieldInput: 'text-[#f8f7ff] placeholder:text-[#9893bd]',
            formFieldInputShowPasswordButton: 'text-[#bbb7cf]',
            formFieldAction: 'text-[#00D4D4] hover:text-[#33FFFF]',
            formResendCodeLink: 'text-[#00D4D4] hover:text-[#33FFFF]',
            alternativeMethodsBlockButton: 'border-white/20 text-[#f8f7ff] hover:bg-white/10',
          },
        }}
      />
    </main>
  )
}
