'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ZeffyModal } from './ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'

export default function UpgradeGate({ feature }: { feature: string }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [membershipOpen, setMembershipOpen] = useState(false)

  async function applyCode() {
    if (!code.trim()) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (res.ok) {
        setStatus('success')
        setTimeout(() => router.refresh(), 800)
      } else {
        const data = await res.json() as { error?: string }
        setErrorMsg(data.error ?? 'Invalid code')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <>
      <ZeffyModal
        isOpen={membershipOpen}
        onClose={() => setMembershipOpen(false)}
        title="HYSKY Membership"
        options={[{ label: 'Membership', icon: '👥', embedUrl: ZEFFY.membership }]}
      />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-full max-w-md rounded-3xl p-8 sm:p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(93,0,245,.18), rgba(4,8,15,.9))',
            border: '1px solid rgba(93,0,245,.35)',
          }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(93,0,245,.2)', border: '1px solid rgba(93,0,245,.4)' }}>
            <span className="text-3xl">🔒</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Paid Membership Required</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            {feature} is available to paid HYSKY members. Upgrade to unlock full access to Courses, Events, and more.
          </p>

          <button
            onClick={() => setMembershipOpen(true)}
            className="flex items-center justify-center gap-2 w-full font-bold px-6 py-3.5 rounded-xl text-white transition-all hover:scale-[1.02] mb-6"
            style={{ background: '#5d00f5', boxShadow: '0 0 30px rgba(93,0,245,.4)' }}
          >
            Upgrade Membership →
          </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,.1)' }} />
          <span className="text-white/30 text-xs">or enter a discount code</span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,.1)' }} />
        </div>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm py-3">
            <span>✓</span> Access granted — loading…
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); setErrorMsg('') }}
              onKeyDown={(e) => e.key === 'Enter' && applyCode()}
              placeholder="DISCOUNT CODE"
              disabled={status === 'loading'}
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-white/25 focus:outline-none focus:border-[#5d00f5]/60 transition-colors disabled:opacity-50"
            />
            <button
              onClick={applyCode}
              disabled={status === 'loading' || !code.trim()}
              className="px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#5d00f5' }}
            >
              {status === 'loading' ? '…' : 'Apply'}
            </button>
          </div>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-xs mt-2 text-left">{errorMsg}</p>
        )}

          <p className="text-white/20 text-xs mt-6">
            Questions?{' '}
            <a href="mailto:admin@hysky.org" className="text-[#5d00f5]/60 hover:text-[#5d00f5] transition-colors">
              admin@hysky.org
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
