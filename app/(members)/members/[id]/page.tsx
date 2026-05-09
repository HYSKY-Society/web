import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getMemberProfile, getUserTier, isPaidTier, TIER_LABELS, Tier } from '@/lib/members'

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  const initials = (name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['bg-[#5d00f5]', 'bg-[#13dce8]/70', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500']
  const idx = (name ?? '?').charCodeAt(0) % colors.length
  if (url) {
    return <img src={url} alt={name ?? ''} width={96} height={96} className="w-24 h-24 rounded-full object-cover border-2 border-white/10" />
  }
  return (
    <div className={`${colors[idx]} w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white border-2 border-white/10`}>
      {initials}
    </div>
  )
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    free:                  'bg-white/8 text-white/50',
    instructor:            'bg-amber-500/20 text-amber-300',
    member_courses:        'bg-[#5d00f5]/20 text-[#9b6dff]',
    member_courses_events: 'bg-[#5d00f5]/25 text-[#b38fff]',
    member_full:           'bg-[#13dce8]/15 text-[#13dce8]',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[tier] ?? 'bg-white/8 text-white/50'}`}>
      {TIER_LABELS[tier as Tier] ?? tier}
    </span>
  )
}

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const { userId } = auth()
  const viewerTier = await getUserTier(userId!)

  if (!isPaidTier(viewerTier)) {
    redirect('/members')
  }

  const member = await getMemberProfile(params.id)
  if (!member) notFound()

  const name        = member.displayName || 'HYSKY Member'
  const isOwnProfile = userId === member.id

  return (
    <div className="text-white max-w-3xl">
      {/* Back */}
      <Link href="/members" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
        ← Back to Directory
      </Link>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar name={name} url={member.avatarUrl} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{name}</h1>
              <TierBadge tier={member.tier} />
            </div>
            {member.headline && (
              <p className="text-white/60 text-base mb-3">{member.headline}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-white/40">
              {member.company && (
                <span className="flex items-center gap-1.5">
                  <span>🏢</span> {member.company}
                </span>
              )}
              {member.jobTitle && (
                <span className="flex items-center gap-1.5">
                  <span>💼</span> {member.jobTitle}
                </span>
              )}
              {member.location && (
                <span className="flex items-center gap-1.5">
                  <span>📍</span> {member.location}
                </span>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <Link
              href="/profile"
              className="shrink-0 text-sm text-[#9b6dff] hover:text-white border border-[#5d00f5]/40 hover:border-[#5d00f5] px-4 py-2 rounded-lg transition-colors"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">About</h2>
          <p className="text-white/75 leading-relaxed whitespace-pre-wrap">{member.bio}</p>
        </div>
      )}

      {/* Contact / Links */}
      {(member.linkedinUrl || member.twitterUrl || member.website || member.email) && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Contact & Links</h2>
          <div className="flex flex-col gap-3">
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-base group-hover:bg-[#5d00f5]/20 transition-colors">✉️</span>
                <span>{member.email}</span>
              </a>
            )}
            {member.linkedinUrl && (
              <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-base group-hover:bg-[#5d00f5]/20 transition-colors">in</span>
                <span className="truncate">{member.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
              </a>
            )}
            {member.twitterUrl && (
              <a href={member.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center font-bold text-xs group-hover:bg-[#5d00f5]/20 transition-colors">𝕏</span>
                <span className="truncate">{member.twitterUrl.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '@')}</span>
              </a>
            )}
            {member.website && (
              <a href={member.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-base group-hover:bg-[#5d00f5]/20 transition-colors">🌐</span>
                <span className="truncate">{member.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Member since */}
      <p className="text-white/20 text-xs text-center">
        Member since {new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
      </p>
    </div>
  )
}
