import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { isAdmin } from '@/lib/admin'
import { cleanSlug, normalizeHySky } from '@/lib/news-automation'

async function requireAdmin() {
  const user = await currentUser()
  const email = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  if (!user || !isAdmin(email)) redirect('/not-authorized')
}

export default async function EditPressPostPage({ params }: { params: { id: string } }) {
  await requireAdmin()
  const [post] = await db.select().from(pressPosts).where(eq(pressPosts.id, params.id)).limit(1)
  if (!post) notFound()

  async function save(formData: FormData) {
    'use server'
    await requireAdmin()
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
    if (!title || !content) throw new Error('Headline and article are required.')
    if (publish) {
      const focus = keywords.split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
      const h2s = [...content.matchAll(/^##\s+(.+)$/gm)].map(match => match[1]).join(' ')
      const linkCount = (content.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g) || []).length
      if (excerpt.length < 70) throw new Error('Add a useful summary of at least 70 characters.')
      if (!coverImageUrl || !imageAltText) throw new Error('Add a lawful cover image and descriptive alt text.')
      if (seoDescription.length < 70) throw new Error('Add an SEO description of at least 70 characters.')
      if (!focus.some(value => `${title} ${h2s}`.toLowerCase().includes(value))) throw new Error('Use a focus keyword in the headline or an H2.')
      if (linkCount < 2) throw new Error('Add at least two authoritative links.')
    }
    await db.update(pressPosts).set({
      slug: cleanSlug(String(formData.get('slug') || title)), title,
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
    revalidatePath('/admin/press')
    revalidatePath('/news')
    revalidatePath(`/news/${post.slug}`)
    redirect('/admin/press')
  }

  const field = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#5D00F5] focus:outline-none'
  return (
    <div className="max-w-4xl text-white">
      <Link href="/admin/press" className="text-sm text-white/50 hover:text-white">← Back to all articles</Link>
      <div className="my-6">
        <h1 className="text-3xl font-bold">Review article</h1>
        <p className="mt-1 text-sm text-white/45">Automated articles stay unpublished until you approve them here.</p>
      </div>
      <form action={save} className="space-y-4 rounded-2xl border border-white/10 bg-white/[.04] p-6">
        <label className="block text-xs text-white/55">Headline<input name="title" defaultValue={post.title} className={`${field} mt-1.5`} required /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-white/55">Slug<input name="slug" defaultValue={post.slug} className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55">Author<input name="author" defaultValue={post.author} className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55">Category<input name="category" defaultValue={post.category} className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55">Read time<input name="readTimeMinutes" type="number" min="1" defaultValue={post.readTimeMinutes ?? ''} className={`${field} mt-1.5`} /></label>
        </div>
        <label className="block text-xs text-white/55">Deck / summary<textarea name="excerpt" defaultValue={post.excerpt ?? ''} rows={3} className={`${field} mt-1.5`} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-white/55">Cover image URL<input name="coverImageUrl" defaultValue={post.coverImageUrl ?? ''} className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55">Image alt text<input name="imageAltText" defaultValue={post.imageAltText ?? ''} className={`${field} mt-1.5`} /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-white/10 p-4">
          <label className="text-xs text-white/55">Photo credit<input name="imageCredit" defaultValue={post.imageCredit ?? ''} placeholder="e.g. Jane Doe / Wikimedia Commons" className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55">Image source page URL<input name="imageSourceUrl" defaultValue={post.imageSourceUrl ?? ''} className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55">License<input name="imageLicense" defaultValue={post.imageLicense ?? ''} placeholder="e.g. CC BY-SA 4.0" className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55">License URL<input name="imageLicenseUrl" defaultValue={post.imageLicenseUrl ?? ''} className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55 sm:col-span-2">Image caption<input name="imageCaption" defaultValue={post.imageCaption ?? ''} className={`${field} mt-1.5`} /></label>
          <label className="flex items-center gap-2 text-xs text-white/55"><input name="imageModified" type="checkbox" defaultChecked={post.imageModified} className="h-4 w-4 accent-[#5D00F5]" /> Image was cropped or modified</label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-white/55">SEO title<input name="seoTitle" defaultValue={post.seoTitle ?? ''} className={`${field} mt-1.5`} /></label>
          <label className="text-xs text-white/55">Keywords<input name="keywords" defaultValue={post.keywords ?? ''} className={`${field} mt-1.5`} /></label>
        </div>
        <label className="block text-xs text-white/55">SEO description<textarea name="seoDescription" defaultValue={post.seoDescription ?? ''} rows={2} className={`${field} mt-1.5`} /></label>
        <label className="block text-xs text-white/55">Article<textarea name="content" defaultValue={post.content ?? ''} rows={24} className={`${field} mt-1.5 font-mono leading-6`} required /></label>
        <label className="flex items-center gap-3 text-sm text-white/70"><input name="isPublished" type="checkbox" defaultChecked={post.isPublished} className="h-4 w-4 accent-[#5D00F5]" /> Publish after saving</label>
        <button className="rounded-lg bg-[#5D00F5] px-6 py-2.5 text-sm font-bold">Save article</button>
      </form>
    </div>
  )
}
