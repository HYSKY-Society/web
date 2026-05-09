import { db } from '@/lib/db'
import { sponsors } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import SmartNav from '@/app/components/SmartNav'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'

export const revalidate = 3600

const TIERS = [
  { id: 'vip_platinum', label: 'Platinum', color: '#e8e8e8', glow: 'rgba(232,232,232,.15)' },
  { id: 'vip_gold',     label: 'Gold',     color: '#FFD700', glow: 'rgba(255,215,0,.15)' },
  { id: 'vip_silver',   label: 'Silver',   color: '#C0C0C0', glow: 'rgba(192,192,192,.12)' },
  { id: 'vip_bronze',   label: 'Bronze',   color: '#CD7F32', glow: 'rgba(205,127,50,.15)' },
  { id: 'vip_copper',   label: 'Copper',   color: '#B87333', glow: 'rgba(184,115,51,.12)' },
  { id: 'vip_startup',  label: 'Startup',  color: '#9b6dff', glow: 'rgba(93,0,245,.15)' },
  { id: 'vip_early_bird', label: 'Early Bird VIP', color: '#13dce8', glow: 'rgba(19,220,232,.12)' },
  { id: 'vip_free',     label: 'Community Partner', color: '#ffffff', glow: 'rgba(255,255,255,.06)' },
]

export default async function SponsorsPage() {
  const { userId } = auth()
  const activeSponsors = await db
    .select()
    .from(sponsors)
    .where(eq(sponsors.isActive, true))

  const byTier = Object.fromEntries(TIERS.map((t) => [t.id, activeSponsors.filter((s) => s.tier === t.id)]))
  const hasAny = activeSponsors.length > 0

  return (
    <div className="min-h-screen text-white" style={{ background: '#04030a' }}>
      <SmartNav />

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(93,0,245,.18), transparent)`,
        }}
      />

      <main className={`relative z-10 max-w-5xl mx-auto px-6 pb-20 ${userId ? 'pt-8' : 'pt-[100px]'}`}>
        {/* Hero */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(93,0,245,.2)', color: '#9b6dff' }}
          >
            VIP Members
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight">Our Sponsors</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Organizations powering the hydrogen aviation ecosystem through HYSKY Society.
          </p>
        </div>

        {!hasAny && (
          <div className="text-center py-20 text-white/25">
            <p>Sponsor listings coming soon.</p>
            <a
              href="mailto:admin@hysky.org"
              className="inline-block mt-3 text-[#5d00f5]/60 hover:text-[#5d00f5] transition-colors text-sm"
            >
              Become a VIP member →
            </a>
          </div>
        )}

        {hasAny &&
          TIERS.map(({ id, label, color, glow }) => {
            const group = byTier[id]
            if (!group?.length) return null
            return (
              <section key={id} className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                  />
                  <h2 className="text-lg font-bold" style={{ color }}>
                    {label}
                  </h2>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.07)' }} />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.map((s) => (
                    <a
                      key={s.id}
                      href={s.website ?? '#'}
                      target={s.website ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="group flex flex-col rounded-2xl p-6 transition-all hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${glow}, rgba(4,8,15,.9))`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {s.logoUrl && (
                        <div className="mb-4 h-12 relative">
                          <Image
                            src={s.logoUrl}
                            alt={s.name}
                            fill
                            className="object-contain object-left"
                          />
                        </div>
                      )}
                      <h3 className="font-bold text-white mb-1 group-hover:text-white/90">{s.name}</h3>
                      {s.description && (
                        <p className="text-white/40 text-sm leading-relaxed line-clamp-3 flex-1">{s.description}</p>
                      )}
                      {s.website && (
                        <p className="text-xs mt-3 truncate" style={{ color: `${color}99` }}>
                          {s.website.replace(/^https?:\/\//, '')}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )
          })}

        {/* Become a sponsor CTA */}
        <div
          className="rounded-3xl p-8 sm:p-10 text-center mt-16"
          style={{
            background: 'linear-gradient(135deg, rgba(93,0,245,.15), rgba(4,8,15,.9))',
            border: '1px solid rgba(93,0,245,.3)',
          }}
        >
          <h2 className="text-2xl font-bold mb-3">Become a VIP Member</h2>
          <p className="text-white/45 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Join organizations shaping the hydrogen aviation future. VIP membership starts at $250/year
            and includes listing in our directory, event access, and visibility across the HYSKY ecosystem.
          </p>
          <a
            href="mailto:admin@hysky.org?subject=VIP Membership Inquiry"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
            style={{ background: '#5d00f5', boxShadow: '0 0 30px rgba(93,0,245,.35)' }}
          >
            Contact Us →
          </a>
        </div>
      </main>
    </div>
  )
}
