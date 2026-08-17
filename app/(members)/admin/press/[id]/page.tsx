import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { isAdmin } from '@/lib/admin'
import { cleanSlug, normalizeHySky } from '@/lib/news-automation'
import { postFeedTeaser } from '@/lib/feed-teaser'
import EditPostForm from './EditPostForm'

async function requireAdmin() {
  const user = await currentUser()
  const email = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  if (!user || !isAdmin(email)) redirect('/not-authorized')
  return user
}

export default async function EditPressPostPage({ params }: { params: { id: string } }) {
  await requireAdmin()
  const [post] = await db.select().from(pressPosts).where(eq(pressPosts.id, params.id)).limit(1)
  if (!post) notFound()

  async function save(formData: FormData): Promise<{ error?: string }> {
    'use server'
    const admin = await requireAdmin()
    const title = normalizeHySky(String(formData.get('title') || '').trim())
    const content = normalizeHySky(String(formData.get('content') || '').trim())
    const excerpt = normalizeHySky(String(formData.get('excerpt') || '').trim())
    const keywords = normalizeHySky(String(formData.get('keywords') || '').trim())
    const coverImageUrl = String(formData.get('coverImageUrl') || '').trim()
    const imageAltText = normalizeHySky(String(formData.get('imageAltText') || '').trim())
    const imageCredit = normalizeHySky(String(formData.get('imageCredit') || '').trim())
    const imageSourceUrl = String(formData.get('imageSourceUrl') || '').trim()
    const imageLicense = String(formData.get('imageLicense') || '').trim()
    const imageLicenseUrl = String(formData.get('imageLicenseUrl') || '').trim()
    const imageCaption = normalizeHySky(String(formData.get('imageCaption') || '').trim())
    const imageModified = formData.get('imageModified') === 'on'
    const seoDescription = normalizeHySky(String(formData.get('seoDescription') || '').trim())
    const publish = formData.get('isPublished') === 'on'
    if (!title || !content) return { error: 'Headline and article are required.' }
    if (publish) {
      const focus = keywords.split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
      const h2s = [...content.matchAll(/^##\s+(.+)$/gm)].map(match => match[1]).join(' ')
      const linkCount = (content.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || []).length
      if (excerpt.length < 70) return { error: 'Add a useful summary of at least 70 characters.' }
      if (!coverImageUrl || !imageAltText) return { error: 'Add a lawful cover image and descriptive alt text.' }
      if (seoDescription.length < 70) return { error: 'Add an SEO description of at least 70 characters.' }
      if (!focus.some(value => `${title} ${h2s}`.toLowerCase().includes(value))) return { error: 'Use a focus keyword in the headline or an H2.' }
      if (linkCount < 1) return { error: 'Add at least one authoritative link.' }
    }
    const slug = cleanSlug(String(formData.get('slug') || title))
    await db.update(pressPosts).set({
      slug, title,
      author: normalizeHySky(String(formData.get('author') || 'HySky News')),
      category: String(formData.get('category') || 'News Analysis'), excerpt, content,
      coverImageUrl: coverImageUrl || null, imageAltText: imageAltText || null,
      imageCredit: imageCredit || null, imageSourceUrl: imageSourceUrl || null,
      imageLicense: imageLicense || null, imageLicenseUrl: imageLicenseUrl || null,
      imageCaption: imageCaption || null, imageModified,
      seoTitle: normalizeHySky(String(formData.get('seoTitle') || title)), seoDescription,
      keywords, readTimeMinutes: Number(formData.get('readTimeMinutes')) || null,
      isPublished: publish, updatedAt: new Date(),
    }).where(eq(pressPosts.id, params.id))
    if (publish && !post.isPublished) {
      await postFeedTeaser(admin.id, { title, slug, coverImageUrl: coverImageUrl || null })
    }
    revalidatePath('/admin/press')
    revalidatePath('/news')
    revalidatePath(`/news/${post.slug}`)
    redirect('/admin/press')
  }

  return (
    <div className="max-w-4xl text-white">
      <Link href="/admin/press" className="text-sm text-white/50 hover:text-white">← Back to all articles</Link>
      <div className="my-6">
        <h1 className="text-3xl font-bold">Review article</h1>
        <p className="mt-1 text-sm text-white/45">Automated articles stay unpublished until you approve them here.</p>
      </div>
      <EditPostForm post={post} action={save} />
    </div>
  )
}
