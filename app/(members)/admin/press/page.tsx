import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import AddPostForm from './AddPostForm'
import AutomationControls from './AutomationControls'
import DeleteButton from './DeleteButton'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ADMIN_NAV, isAdmin } from '@/lib/admin'
import { postFeedTeaser } from '@/lib/feed-teaser'

async function requireAdmin() {
  const user = await currentUser()
  const email = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  if (!user || !isAdmin(email)) redirect('/not-authorized')
  return user
}

async function deletePost(id: string) {
  'use server'
  await requireAdmin()
  await db.delete(pressPosts).where(eq(pressPosts.id, id))
  revalidatePath('/admin/press')
  revalidatePath('/press')
}

async function togglePublished(id: string, current: boolean) {
  'use server'
  const admin = await requireAdmin()
  await db.update(pressPosts).set({ isPublished: !current }).where(eq(pressPosts.id, id))
  if (!current) {
    const [post] = await db.select().from(pressPosts).where(eq(pressPosts.id, id)).limit(1)
    if (post) await postFeedTeaser(admin.id, post)
  }
  revalidatePath('/admin/press')
  revalidatePath('/press')
}

export default async function AdminPressPage() {
  await requireAdmin()
  let posts: typeof pressPosts.$inferSelect[] = []
  try {
    posts = await db.select().from(pressPosts).orderBy(desc(pressPosts.publishedAt))
  } catch { /* table not yet migrated */ }

  return (
    <div className="text-white max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1.5">Manage Press</h1>
        <p className="text-white/40">Add and manage press posts and news articles.</p>
      </div>

      <div className="flex gap-1 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 w-fit flex-wrap">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              item.href === '/admin/press' ? 'bg-[#5d00f5] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <AutomationControls />

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">All Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="text-white/30 text-sm">No posts yet.</p>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="flex items-start gap-4 rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white text-sm truncate">{post.title}</p>
                    {!post.isPublished && (
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Draft</span>
                    )}
                  </div>
                  <p className="text-white/35 text-xs">
                    {post.author} · {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {post.readTimeMinutes ? ` · ${post.readTimeMinutes} min` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/press/${post.id}`}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1">
                    Review / edit
                  </Link>
                  <form action={togglePublished.bind(null, post.id, post.isPublished)}>
                    <button type="submit"
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.5)' }}>
                      {post.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </form>
                  <DeleteButton isPublished={post.isPublished} action={deletePost.bind(null, post.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <AddPostForm />
      </div>
    </div>
  )
}
