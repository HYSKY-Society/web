import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import PublicShell from '@/app/components/PublicShell'

export const revalidate = 3600

export default async function PressPostPage({ params }: { params: { slug: string } }) {
  const [post] = await db.select().from(pressPosts)
    .where(and(eq(pressPosts.slug, params.slug), eq(pressPosts.isPublished, true)))

  if (!post) notFound()

  const body = post.content || post.excerpt || ''

  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-20 pt-10">
        <Link href="/press" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition-colors">
          ← Back to News
        </Link>

        <div className="flex items-center gap-3 mb-4 text-xs text-white/35">
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

        <h1 className="font-black text-3xl sm:text-4xl text-white leading-tight mb-8">{post.title}</h1>

        {post.coverImageUrl && (
          <img src={post.coverImageUrl} alt={post.title} className="w-full rounded-2xl object-cover mb-8 max-h-80" />
        )}

        <div className="prose prose-invert prose-sm max-w-none text-white/65 leading-relaxed space-y-4">
          {body.split('\n\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/8">
          <Link href="/press" className="text-[#9b6dff] hover:text-white text-sm font-semibold transition-colors">
            ← More from HYSKY Society
          </Link>
        </div>
      </div>
    </PublicShell>
  )
}
