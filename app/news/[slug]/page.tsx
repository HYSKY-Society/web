import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import PublicShell from '@/app/components/PublicShell'

export const revalidate = 3600

export default async function NewsPostPage({ params }: { params: { slug: string } }) {
  let post: typeof pressPosts.$inferSelect | undefined
  try {
    ;[post] = await db.select().from(pressPosts)
      .where(and(eq(pressPosts.slug, params.slug), eq(pressPosts.isPublished, true)))
  } catch { /* table not yet migrated */ }

  if (!post) notFound()

  const body = post.content || post.excerpt || ''

  return (
    <PublicShell>
      <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111111' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 40px 80px' }}>

          <Link href="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#5D00F5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', marginBottom: '40px' }}>
            ← Back to HYSKY News
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '0.75rem', color: '#888' }}>
            <span>{post.author}</span>
            <span>·</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            {post.readTimeMinutes && (
              <>
                <span>·</span>
                <span>{post.readTimeMinutes} min read</span>
              </>
            )}
          </div>

          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#111', lineHeight: 1.15, marginBottom: '32px', letterSpacing: '-0.02em' }}>
            {post.title}
          </h1>

          {post.coverImageUrl && (
            <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', borderRadius: '14px', objectFit: 'cover', marginBottom: '32px', maxHeight: '360px' }} />
          )}

          <div style={{ fontSize: '1rem', color: '#444', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {body.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid #e0e0e0' }}>
            <Link href="/news" style={{ color: '#5D00F5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              ← More from HYSKY News
            </Link>
          </div>

        </div>
      </div>
    </PublicShell>
  )
}
