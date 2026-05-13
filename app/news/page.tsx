import Link from 'next/link'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import NewsShell from '@/app/components/NewsShell'

export const revalidate = 3600

export default async function NewsPage() {
  let posts: typeof pressPosts.$inferSelect[] = []
  try {
    posts = await db.select().from(pressPosts)
      .where(eq(pressPosts.isPublished, true))
      .orderBy(desc(pressPosts.publishedAt))
  } catch { /* table not yet migrated */ }

  return (
    <NewsShell>

      {/* Ticker */}
      <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e8e8e8', padding: '10px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '60px', animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[
            'Electric Aviation', 'eVTOL Updates', 'Advanced Air Mobility', 'Hydrogen Propulsion',
            'Air Taxi News', 'Sustainable Flight', 'Urban Air Mobility', 'Electric Aircraft',
            'Electric Aviation', 'eVTOL Updates', 'Advanced Air Mobility', 'Hydrogen Propulsion',
            'Air Taxi News', 'Sustainable Flight', 'Urban Air Mobility', 'Electric Aircraft',
          ].map((label, i) => (
            <span key={i} style={{ fontSize: '0.72rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
              <span style={{ color: '#5D00F5', marginRight: '60px' }}>•</span>{label}
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 40px 24px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(93,0,245,0.07)',
          border: '1px solid rgba(93,0,245,0.2)', color: '#5D00F5',
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase' as const, padding: '5px 14px',
          borderRadius: 100, marginBottom: 20,
        }}>
          Community-Supported Publication
        </div>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800,
          lineHeight: 1.18, marginBottom: 14, letterSpacing: '-0.025em', color: '#111',
        }}>
          Electric Aviation News<br />
          You Won&apos;t Find <span style={{ color: '#5D00F5' }}>Anywhere Else</span>
        </h1>
        <p style={{ fontSize: '1rem', color: '#666', maxWidth: '560px', margin: '0 auto 0', lineHeight: 1.65 }}>
          HYSKY News covers <strong style={{ color: '#111' }}>hydrogen propulsion, eVTOL, and advanced air mobility</strong> — written for the people building and flying the future.
        </p>
      </div>

      {/* Article list */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 40px 80px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            <p style={{ fontSize: '1.1rem' }}>News posts coming soon.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderTop: '1px solid #e8e8e8' }}>
            {posts.map((post, idx) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                style={{
                  display: 'flex', gap: '20px', alignItems: 'flex-start',
                  padding: '24px 0', borderBottom: '1px solid #e8e8e8',
                  textDecoration: 'none', color: '#111',
                }}
              >
                {/* Date column */}
                <div style={{ flexShrink: 0, minWidth: 56, textAlign: 'center', paddingTop: 3 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#5D00F5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>
                    {new Date(post.publishedAt).getDate()}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: 6, display: 'flex', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: '#888' }}>{post.author}</span>
                    {post.readTimeMinutes && <><span>·</span><span>{post.readTimeMinutes} min read</span></>}
                  </div>
                  <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111', marginBottom: 6, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{ color: '#777', fontSize: '0.875rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </NewsShell>
  )
}
