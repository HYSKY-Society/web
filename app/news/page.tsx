import Link from 'next/link'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import PublicShell from '@/app/components/PublicShell'

export const revalidate = 3600

export default async function NewsPage() {
  let posts: typeof pressPosts.$inferSelect[] = []
  try {
    posts = await db.select().from(pressPosts)
      .where(eq(pressPosts.isPublished, true))
      .orderBy(desc(pressPosts.publishedAt))
  } catch { /* table not yet migrated */ }

  return (
    <PublicShell>
      <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111111' }}>

        {/* Ticker */}
        <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e0e0e0', padding: '12px 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '60px', animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
            {[
              'Electric Aviation', 'eVTOL Updates', 'Advanced Air Mobility', 'Hydrogen Propulsion',
              'Air Taxi News', 'Sustainable Flight', 'Urban Air Mobility', 'Electric Aircraft',
              'Electric Aviation', 'eVTOL Updates', 'Advanced Air Mobility', 'Hydrogen Propulsion',
              'Air Taxi News', 'Sustainable Flight', 'Urban Air Mobility', 'Electric Aircraft',
            ].map((label, i) => (
              <span key={i} style={{ fontSize: '0.75rem', color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
                <span style={{ color: '#5D00F5', marginRight: '60px' }}>•</span>{label}
              </span>
            ))}
          </div>
        </div>

        <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>

        {/* Hero */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 40px 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(93,0,245,0.08)', border: '1px solid rgba(93,0,245,0.25)', color: '#5D00F5', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: '5px 14px', borderRadius: '100px', marginBottom: '16px' }}>
            Community-Supported Publication
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.02em', color: '#111' }}>
            Electric Aviation News<br />
            You Won&apos;t Find <span style={{ color: '#5D00F5' }}>Anywhere Else</span>
          </h1>
          <p style={{ fontSize: '1rem', color: '#666', maxWidth: '580px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            HYSKY News covers <strong style={{ color: '#111' }}>electric aircraft, eVTOL, hydrogen propulsion, and advanced air mobility.</strong> Written for the people building and flying the future.
          </p>
        </div>

        {/* Posts */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 40px 60px' }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
              <p style={{ fontSize: '1.1rem' }}>News posts coming soon.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  style={{ display: 'block', background: '#f5f5f7', border: '1px solid #e0e0e0', borderRadius: '14px', padding: '24px', textDecoration: 'none', color: '#111', transition: 'border-color 0.2s' }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    {post.readTimeMinutes && <><span>·</span><span>{post.readTimeMinutes} min read</span></>}
                  </div>
                  <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: '#111' }}>{post.title}</h2>
                  {post.excerpt && (
                    <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>{post.excerpt}</p>
                  )}
                  <div style={{ marginTop: '12px', fontSize: '0.875rem', fontWeight: 600, color: '#5D00F5' }}>Read more →</div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </PublicShell>
  )
}
