import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import NewsShell from '@/app/components/NewsShell'
import { ensureNewsUser, TIER_LABELS, TIER_DESCRIPTIONS } from '@/lib/news'

// TODO: replace with real Zeffy embed slugs once created
const ZEFFY_MONTHLY_SLUG = ''
const ZEFFY_ANNUAL_SLUG  = ''

export default async function NewsSubscribePage() {
  const { userId } = auth()
  const currentTier = userId ? await ensureNewsUser(userId) : null

  const tiers = [
    {
      key:         'free' as const,
      label:       'Free',
      price:       '$0',
      per:         '',
      description: '1 article per month. No credit card required.',
      cta:         'Current plan',
      ctaHref:     null,
      highlight:   false,
    },
    {
      key:         'complimentary' as const,
      label:       'Complimentary',
      price:       '$0',
      per:         '',
      description: '5 articles per month. Automatically granted to all HYSKY Society members.',
      cta:         currentTier === 'complimentary' ? 'Your current plan' : 'Sign in with HYSKY account',
      ctaHref:     currentTier === 'complimentary' ? null : '/sign-in',
      highlight:   false,
    },
    {
      key:         'monthly' as const,
      label:       'Monthly',
      price:       '$15',
      per:         '/ month',
      description: 'Unlimited articles + full archive access. Cancel any time.',
      cta:         currentTier === 'monthly' ? 'Your current plan' : 'Subscribe monthly',
      ctaHref:     currentTier === 'monthly' ? null : (ZEFFY_MONTHLY_SLUG ? `/events/news-monthly` : null),
      highlight:   true,
    },
    {
      key:         'annual' as const,
      label:       'Annual',
      price:       '$149',
      per:         '/ year',
      description: 'Unlimited articles + full archive. Best value — save $31 vs monthly.',
      cta:         currentTier === 'annual' ? 'Your current plan' : 'Subscribe annually',
      ctaHref:     currentTier === 'annual' ? null : (ZEFFY_ANNUAL_SLUG ? `/events/news-annual` : null),
      highlight:   false,
    },
  ]

  return (
    <NewsShell>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '56px 32px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(93,0,245,0.07)',
            border: '1px solid rgba(93,0,245,0.2)', color: '#5D00F5',
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase' as const, padding: '5px 14px',
            borderRadius: 100, marginBottom: 18,
          }}>
            HYSKY News
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#111', letterSpacing: '-0.03em', marginBottom: 14 }}>
            Choose your plan
          </h1>
          <p style={{ color: '#777', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            Independent hydrogen aviation journalism. Support the reporting that moves the industry forward.
          </p>
        </div>

        {/* Tier grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {tiers.map(tier => {
            const isCurrent = currentTier === tier.key
            return (
              <div
                key={tier.key}
                style={{
                  border: tier.highlight ? '2px solid #5D00F5' : '1.5px solid #e0e0e0',
                  borderRadius: 18, padding: '28px 24px',
                  background: tier.highlight ? 'rgba(93,0,245,0.03)' : '#fff',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {tier.highlight && (
                  <div style={{
                    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                    background: '#5D00F5', color: '#fff',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100,
                    whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: tier.highlight ? '#5D00F5' : '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    {tier.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#111', letterSpacing: '-0.03em' }}>{tier.price}</span>
                    {tier.per && <span style={{ fontSize: '0.85rem', color: '#888' }}>{tier.per}</span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>{tier.description}</p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  {isCurrent ? (
                    <div style={{
                      textAlign: 'center', padding: '10px',
                      border: '1px solid #e0e0e0', borderRadius: 10,
                      fontSize: '0.85rem', fontWeight: 600, color: '#aaa',
                    }}>
                      ✓ Current plan
                    </div>
                  ) : tier.ctaHref ? (
                    <Link href={tier.ctaHref} style={{
                      display: 'block', textAlign: 'center',
                      padding: '11px 0',
                      background: tier.highlight ? '#5D00F5' : 'transparent',
                      border: tier.highlight ? 'none' : '1.5px solid #5D00F5',
                      borderRadius: 10,
                      fontWeight: 700, fontSize: '0.9rem',
                      color: tier.highlight ? '#fff' : '#5D00F5',
                      textDecoration: 'none',
                    }}>
                      {tier.cta}
                    </Link>
                  ) : (
                    <div style={{
                      textAlign: 'center', padding: '10px',
                      border: '1px solid #e8e8e8', borderRadius: 10,
                      fontSize: '0.82rem', color: '#aaa',
                    }}>
                      {tier.key === 'complimentary'
                        ? 'Auto-granted to HYSKY members'
                        : 'Coming soon'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 64, maxWidth: 600, margin: '64px auto 0' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111', marginBottom: 24 }}>
            Frequently asked questions
          </h2>
          {[
            {
              q: 'What is the Complimentary tier?',
              a: 'Any existing HYSKY Society member (free or paid) automatically receives 5 free articles per month on HYSKY News — no additional payment needed.',
            },
            {
              q: 'Does my HYSKY web login work here?',
              a: 'Yes. If you sign in with the same email or OAuth account you use on hysky.org, we\'ll recognize you as a HYSKY member and apply the Complimentary tier.',
            },
            {
              q: 'What counts as an "article"?',
              a: 'Each unique article you read in a calendar month counts as one. Re-reading the same article does not count again.',
            },
            {
              q: 'When does my monthly quota reset?',
              a: 'On the 1st of every calendar month.',
            },
          ].map((item, i) => (
            <div key={i} style={{ borderTop: '1px solid #e8e8e8', padding: '20px 0' }}>
              <p style={{ fontWeight: 700, color: '#111', marginBottom: 8, fontSize: '0.95rem' }}>{item.q}</p>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.65 }}>{item.a}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/news" style={{ color: '#5D00F5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to HYSKY News
          </Link>
        </div>

      </div>
    </NewsShell>
  )
}
