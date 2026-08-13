'use client'

import { useState, useRef } from 'react'
import { useClerk } from '@clerk/nextjs'
import { saveProfile } from './actions'
import type { ProfileContact, UserProfile } from '@/lib/schema'
import { ZeffyModal } from '@/components/ZeffyModal'
import { ZEFFY } from '@/lib/zeffy'

function Field({
  label, name, defaultValue, placeholder, type = 'text', hint,
}: {
  label: string; name: string; defaultValue?: string | null; placeholder?: string; type?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ''}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5]/50 resize-none transition-colors"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue ?? ''}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5]/50 transition-colors"
        />
      )}
      {hint && <p className="text-white/30 text-xs mt-1">{hint}</p>}
    </div>
  )
}

export default function ProfileForm({ profile, contacts, clerkName, clerkEmail, canEditLinks }: {
  profile: UserProfile | null
  contacts: ProfileContact | null
  clerkName: string
  clerkEmail: string
  canEditLinks: boolean
}) {
  const { openUserProfile } = useClerk()
  const [status,      setStatus]      = useState<{ error?: string; success?: boolean }>({})
  const [pending,     setPending]     = useState(false)
  const [avatarUrl,   setAvatarUrl]   = useState<string>(profile?.avatarUrl ?? '')
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [membershipOpen, setMembershipOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = (clerkName || clerkEmail || 'M')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/feed/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setAvatarUrl(data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleAction(formData: FormData) {
    setPending(true)
    formData.set('avatarUrl', avatarUrl)
    try {
      const result = await saveProfile({}, formData)
      setStatus(result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={handleAction} className="space-y-6">
      {status.success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl px-4 py-3">
          Profile saved successfully.
        </div>
      )}
      {status.error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm rounded-xl px-4 py-3">
          {status.error}
        </div>
      )}

      {/* Avatar upload */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-4">Profile Photo</p>
        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-black text-2xl text-white select-none"
            style={{ background: avatarUrl ? undefined : '#5d00f520', border: '2px solid #5d00f540' }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              : initials
            }
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-white/15 text-white/70 hover:text-white hover:border-[#5d00f5]/60 hover:bg-[#5d00f5]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading…' : 'Upload Photo'}
            </button>
            {avatarUrl && !uploading && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-white/8 text-white/35 hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                Remove Photo
              </button>
            )}
            {uploadError && (
              <p className="text-xs text-red-400">{uploadError}</p>
            )}
            {!uploadError && (
              <p className="text-xs text-white/25">JPG, PNG, WebP — max 4 MB</p>
            )}
          </div>
        </div>
      </div>

      {/* Read-only Clerk fields */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-2">Account (managed by Clerk)</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/40 mb-1.5">Name</label>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white/50">{clerkName || '—'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/40 mb-1.5">Email</label>
            <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white/50">{clerkEmail}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-white/25 text-xs">To update your name, email, password, or security settings, open your Clerk account.</p>
          <button
            type="button"
            onClick={() => openUserProfile()}
            className="rounded-lg border border-white/12 px-3 py-1.5 text-xs font-medium text-white/55 transition-colors hover:border-[#5d00f5]/50 hover:bg-[#5d00f5]/10 hover:text-white"
          >
            Manage Account
          </button>
        </div>
      </div>

      {/* Identity */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Identity</p>
        <Field label="Display Name" name="displayName" defaultValue={profile?.displayName ?? clerkName} placeholder="How you appear in the directory" hint="Defaults to your Clerk name if left blank." />
        <Field label="Professional Headline" name="headline" defaultValue={profile?.headline} placeholder="e.g. Hydrogen Aircraft Engineer · Airbus" />
        <Field label="About / Bio" name="bio" defaultValue={profile?.bio} placeholder="Tell the community about yourself and your work in hydrogen aviation…" type="textarea" />
      </div>

      {/* Professional */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Professional</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company / Organization" name="company" defaultValue={profile?.company} placeholder="e.g. Airbus" />
          <Field label="Job Title / Role" name="jobTitle" defaultValue={profile?.jobTitle} placeholder="e.g. Chief Engineer" />
        </div>
        <Field label="Location" name="location" defaultValue={profile?.location} placeholder="e.g. Toulouse, France" />
      </div>

      {/* Contact links are a VIP profile feature. Existing values stay stored. */}
      {canEditLinks ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Contact & Links</p>
          <Field label="Company Website" name="companyWebsite" defaultValue={contacts?.companyWebsite} placeholder="https://company.com" />
          <Field label="Phone Number" name="phoneNumber" defaultValue={contacts?.phoneNumber} placeholder="+1 555 123 4567" type="tel" hint="Optional. Visible only to VIP members." />
          <Field label="LinkedIn" name="linkedinUrl" defaultValue={profile?.linkedinUrl} placeholder="https://linkedin.com/in/yourhandle" />
          <Field label="X / Twitter" name="twitterUrl" defaultValue={profile?.twitterUrl} placeholder="https://x.com/yourhandle" />
          <Field label="Website" name="website" defaultValue={profile?.website} placeholder="https://yoursite.com" />
        </div>
      ) : (
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(93,0,245,.16), rgba(255,255,255,.03))', border: '1px solid rgba(93,0,245,.35)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-[#9b6dff] uppercase tracking-wider font-semibold mb-1">VIP Profile Feature</p>
              <h2 className="text-base font-semibold text-white">Contact & Links</h2>
              <p className="text-sm text-white/45 mt-1">Upgrade to add or edit company contact information, phone number, LinkedIn, X/Twitter, and website links.</p>
            </div>
            <button
              type="button"
              onClick={() => setMembershipOpen(true)}
              className="shrink-0 bg-[#5d00f5] hover:bg-[#7c2fff] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Upgrade to VIP
            </button>
          </div>
        </div>
      )}

      {!canEditLinks && (
        <ZeffyModal
          isOpen={membershipOpen}
          onClose={() => {
            setMembershipOpen(false)
            window.dispatchEvent(new Event('vip-access:check'))
          }}
          title="Upgrade to HySky VIP"
          options={[{ label: 'VIP Membership', icon: '👥', embedUrl: ZEFFY.membership }]}
        />
      )}

      {/* Privacy */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-4">Privacy</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isVisible"
            value="true"
            defaultChecked={profile?.isVisible ?? true}
            className="w-4 h-4 accent-[#5d00f5]"
          />
          <div>
            <div className="text-sm font-medium text-white">Show me in the member directory</div>
            <div className="text-white/35 text-xs mt-0.5">If unchecked, your profile won't appear to other members.</div>
          </div>
        </label>
        <input type="hidden" name="isVisible" value="false" />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending || uploading}
          className="bg-[#5d00f5] hover:bg-[#7c2fff] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
        >
          {pending ? 'Saving…' : 'Save Profile'}
        </button>
        <a href="/members" className="text-sm text-white/40 hover:text-white transition-colors">View in directory →</a>
      </div>
    </form>
  )
}
