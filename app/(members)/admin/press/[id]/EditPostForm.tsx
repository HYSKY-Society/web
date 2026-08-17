'use client'

import { useState, useTransition } from 'react'

type Post = {
  title: string
  slug: string
  author: string
  category: string
  readTimeMinutes: number | null
  excerpt: string | null
  coverImageUrl: string | null
  imageAltText: string | null
  imageCredit: string | null
  imageSourceUrl: string | null
  imageLicense: string | null
  imageLicenseUrl: string | null
  imageCaption: string | null
  imageModified: boolean
  seoTitle: string | null
  keywords: string | null
  seoDescription: string | null
  content: string | null
  isPublished: boolean
}

export default function EditPostForm({
  post,
  action,
}: {
  post: Post
  action: (formData: FormData) => Promise<{ error?: string }>
}) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) setError(result.error)
    })
  }

  const field = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#5D00F5] focus:outline-none'
  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[.04] p-6">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400" aria-live="polite">
          {error}
        </p>
      )}
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
      <button disabled={pending} className="rounded-lg bg-[#5D00F5] px-6 py-2.5 text-sm font-bold disabled:opacity-50">
        {pending ? 'Saving…' : 'Save article'}
      </button>
    </form>
  )
}
