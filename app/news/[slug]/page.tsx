import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import NewsShell from '@/app/components/NewsShell'
import { canReadArticle, recordArticleView, TIER_LABELS, TIER_DESCRIPTIONS } from '@/lib/news'

export default async function NewsPostPage({ params }: { params: { slug: string } }) {
  let post: typeof pressPosts.$inferSelect | undefined
  try {
    ;[post] = await db.select().from(pressPosts)
      .where(and(eq(pressPosts.slug, params.slug), eq(pressPosts.isPublished, true)))
  } catch { /* table not yet migrated */ }

  if (!post) notFound()

  const { userId } = auth()
  const body = post.content || post.excerpt || ''
  const paragraphs = body.split('\n\n').filter(Boolean)

  // Gate check
  let gated = false
  let tierInfo: { tier: string; viewsThisMonth: number; limit: number | null } | null = null

  if (!userId) {
    // Not logged in — show preview only
    gated = true
  } else {
    const result = await canReadArticle(userId, post.id)
    tierInfo = { tier: result.tier, viewsThisMonth: result.viewsThisMonth, limit: result.limit }
    if (result.allowed) {
      await recordArticleView(userId, post.id)
    } else {
      gated = true
    }
  }

  // How many paragraphs to show before the gate
  const previewCount = gated ? Math.min(2, paragraphs.length) : paragraphs.length

  return (
    <NewsShell>
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '40px 32px 80px' }}>

        <Link href="/news" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: '#5D00F5', fontSize: '0.85rem', fontWeight: 600,
          textDecoration: 'none', marginBottom: 36,
        }}>
          ← HYSKY News
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16, fontSize: '0.75rem', color: '#aaa' }}>
          <span style={{ fontWeight: 600, color: '#666' }}>{post.author}</span>
          <span>·</span>
          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          {post.readTimeMinutes && <><span>·</span><span>{post.readTimeMinutes} min read</span></>}
        </div>

        {/* Title */}
        <h1 style={{
          fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 2.6rem)',
          color: '#111', lineHeight: 1.12, marginBottom: 32,
          letterSpacing: '-0.03em',
        }}>
          {post.title}
        </h1>

        {/* Cover image */}
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            style={{ width: '100%', borderRadius: 14, objectFit: 'cover', marginBottom: 32, maxHeight: 380 }}
          />
        )}

        {/* Body — full or preview */}
        <div style={{ fontSize: '1.05rem', color: '#333', lineHeight: 1.82, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {paragraphs.slice(0, previewCount).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Paywall */}
        {gated && (
          <div style={{ marginTop: 0, position: 'relative' }}>
            {/* Fade-out over the last visible paragraph */}
            <div style={{
              height: 120,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))',
              marginBottom: -60,
              position: 'relative', zIndex: 1,
            }} />

            {/* Gate card */}
            <div style={{
              position: 'relative', zIndex: 2,
              border: '1.5px solid #e0e0e0', borderRadius: 20,
              padding: '36px 32px', textAlign: 'center',
              background: '#fff',
              boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
            }}>
              {!userId ? (
                <>
                  <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>🔒</div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111', marginBottom: 8 }}>
                    Sign in to keep reading
                  </h2>
                  <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 28, lineHeight: 1.6 }}>
                    HYSKY members get 5 free articles per month. New to HYSKY News? Start with 1 free article.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/sign-in" style={{
                      padding: '10px 24px', border: '1.5px solid #ddd', borderRadius: 10,
                      fontWeight: 600, fontSize: '0.9rem', color: '#333', textDecoration: 'none',
                    }}>Log In</Link>
                    <Link href="/news/subscribe" style={{
                      padding: '10px 24px', background: '#5D00F5', borderRadius: 10,
                      fontWeight: 700, fontSize: '0.9rem', color: '#fff', textDecoration: 'none',
                    }}>Subscribe</Link>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>📰</div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111', marginBottom: 8 }}>
                    You've used all {tierInfo?.limit} article{tierInfo?.limit === 1 ? '' : 's'} this month
                  </h2>
                  <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 8, lineHeight: 1.6 }}>
                    Your <strong>{tierInfo ? TIER_LABELS[tierInfo.tier as keyof typeof TIER_LABELS] : ''}</strong> plan
                    includes {tierInfo ? TIER_DESCRIPTIONS[tierInfo.tier as keyof typeof TIER_DESCRIPTIONS] : ''}.
                  </p>
                  <p style={{ color: '#aaa', fontSize: '0.82rem', marginBottom: 28 }}>
                    Your quota resets on the 1st of next month.
                  </p>
                  <Link href="/news/subscribe" style={{
                    display: 'inline-block', padding: '11px 28px',
                    background: '#5D00F5', borderRadius: 10,
                    fontWeight: 700, fontSize: '0.95rem', color: '#fff', textDecoration: 'none',
                  }}>
                    Upgrade for unlimited access
                  </Link>
                </>
              )}

              {/* Tier comparison mini-table */}
              <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {([
                  { tier: 'Free', limit: '1 article/mo', price: 'Free', highlight: false },
                  { tier: 'Complimentary', limit: '5 articles/mo', price: 'Free for members', highlight: false },
                  { tier: 'Monthly', limit: 'Unlimited', price: '$15/mo', highlight: true },
                  { tier: 'Annual', limit: 'Unlimited', price: '$149/yr', highlight: true },
                ] as const).map(t => (
                  <div key={t.tier} style={{
                    border: t.highlight ? '1.5px solid #5D00F5' : '1px solid #eee',
                    borderRadius: 12, padding: '12px 8px', textAlign: 'center',
                    background: t.highlight ? 'rgba(93,0,245,0.04)' : '#fafafa',
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.highlight ? '#5D00F5' : '#555', marginBottom: 4 }}>{t.tier}</div>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: 6 }}>{t.limit}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111' }}>{t.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer nav (full-access only) */}
        {!gated && (
          <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid #e8e8e8' }}>
            <Link href="/news" style={{ color: '#5D00F5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              ← More from HYSKY News
            </Link>
          </div>
        )}

      </div>
    </NewsShell>
  )
}
