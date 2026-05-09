import Link from 'next/link'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import PublicShell from '@/app/components/PublicShell'

export const revalidate = 3600

export default async function PressPage() {
  let posts: typeof pressPosts.$inferSelect[] = []
  try {
    posts = await db.select().from(pressPosts)
      .where(eq(pressPosts.isPublished, true))
      .orderBy(desc(pressPosts.publishedAt))
  } catch { /* table not yet migrated */ }

  return (
    <PublicShell>
      <div className="relative">
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(93,0,245,.18), transparent)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 pb-20 pt-10">
          <div className="mb-12">
            <div className="text-[#9b6dff] text-xs font-bold uppercase tracking-[2.5px] mb-3">News & Updates</div>
            <h1 className="font-black uppercase leading-[.92] tracking-[-2px] mb-4"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              Hydrogen<br /><span style={{ color: '#5d00f5' }}>Aviation News</span>
            </h1>
            <p className="text-white/45 text-lg max-w-xl leading-relaxed">
              The latest from HYSKY Society — announcements, research, events, and insights from across the hydrogen aviation ecosystem.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 text-white/25">
              <p className="text-lg">News posts coming soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/press/${post.slug}`}
                  className="group block rounded-2xl p-6 transition-all hover:scale-[1.005]"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  <div className="flex items-center gap-3 mb-3 text-xs text-white/35">
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
                  <h2 className="font-bold text-white text-xl leading-snug mb-2 group-hover:text-[#c4a0ff] transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-white/45 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="mt-4 text-sm font-semibold text-[#9b6dff] group-hover:text-[#c4a0ff] transition-colors">
                    Read more →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  )
}
