'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { saveProfile } from './actions'
import type { UserProfile } from '@/lib/schema'

function Field({
  label, name, value, placeholder, type = 'text', hint,
}: {
  label: string; name: string; value?: string | null; placeholder?: string; type?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          defaultValue={value ?? ''}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5]/50 resize-none transition-colors"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={value ?? ''}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5]/50 transition-colors"
        />
      )}
      {hint && <p className="text-white/30 text-xs mt-1">{hint}</p>}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[#5d00f5] hover:bg-[#7c2fff] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
    >
      {pending ? 'Saving…' : 'Save Profile'}
    </button>
  )
}

export default function ProfileForm({ profile, clerkName, clerkEmail }: {
  profile: UserProfile | null
  clerkName: string
  clerkEmail: string
}) {
  const [state, action] = useFormState(saveProfile, {} as { error?: string; success?: boolean })

  return (
    <form action={action} className="space-y-6">
      {state.success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl px-4 py-3">
          Profile saved successfully.
        </div>
      )}
      {state.error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm rounded-xl px-4 py-3">
          {state.error}
        </div>
      )}

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
        <p className="text-white/25 text-xs">To update your name, photo, or email, use the account button in the top-right corner.</p>
      </div>

      {/* Identity */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Identity</p>
        <Field label="Display Name" name="displayName" value={profile?.displayName ?? clerkName} placeholder="How you appear in the directory" hint="Defaults to your Clerk name if left blank." />
        <Field label="Professional Headline" name="headline" value={profile?.headline} placeholder="e.g. Hydrogen Aircraft Engineer · Airbus" />
        <Field label="About / Bio" name="bio" value={profile?.bio} placeholder="Tell the community about yourself and your work in hydrogen aviation…" type="textarea" />
      </div>

      {/* Professional */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Professional</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company / Organization" name="company" value={profile?.company} placeholder="e.g. Airbus" />
          <Field label="Job Title / Role" name="jobTitle" value={profile?.jobTitle} placeholder="e.g. Chief Engineer" />
        </div>
        <Field label="Location" name="location" value={profile?.location} placeholder="e.g. Toulouse, France" />
      </div>

      {/* Links */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Links</p>
        <Field label="LinkedIn" name="linkedinUrl" value={profile?.linkedinUrl} placeholder="https://linkedin.com/in/yourhandle" />
        <Field label="X / Twitter" name="twitterUrl" value={profile?.twitterUrl} placeholder="https://x.com/yourhandle" />
        <Field label="Website" name="website" value={profile?.website} placeholder="https://yoursite.com" />
      </div>

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
        {/* Hidden field so unchecked sends false */}
        <input type="hidden" name="isVisible" value="false" />
      </div>

      <div className="flex items-center gap-4">
        <SubmitButton />
        <a href={`/members`} className="text-sm text-white/40 hover:text-white transition-colors">View in directory →</a>
      </div>
    </form>
  )
}
