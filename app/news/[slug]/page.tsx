import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Space_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'
import { db } from '@/lib/db'
import { pressPosts } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import NewsShell from '@/app/components/NewsShell'
import { canReadArticle, recordArticleView, TIER_LABELS, TIER_DESCRIPTIONS } from '@/lib/news'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })
const NEWS_ORIGIN = 'https://news.hysky.org'

async function getPost(slug: string) {
  try {
    const [post] = await db.select().from(pressPosts)
      .where(and(eq(pressPosts.slug, slug), eq(pressPosts.isPublished, true)))
    return post
  } catch {
    return undefined
  }
}

function absoluteImageUrl(src: string | null) {
  if (!src) return undefined
  return src.startsWith('http') ? src : `${NEWS_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}
  const canonical = `${NEWS_ORIGIN}/${post.slug}`
  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt || undefined
  const image = absoluteImageUrl(post.coverImageUrl)
  return {
    title,
    description,
    keywords: post.keywords?.split(',').map(keyword => keyword.trim()).filter(Boolean),
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: { type: 'article', url: canonical, title, description, publishedTime: post.publishedAt.toISOString(), modifiedTime: post.updatedAt.toISOString(), authors: [post.author], images: image ? [{ url: image, alt: post.imageAltText || post.title }] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  }
}

function inlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\))/g)
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
    if (!match) return part
    const internal = match[2].startsWith(NEWS_ORIGIN)
    return <a key={index} href={match[2]} target={internal ? undefined : '_blank'} rel={internal ? undefined : 'noopener noreferrer'} style={{ color: '#5D00F5', fontWeight: 650, textDecorationThickness: 1, textUnderlineOffset: 3 }}>{match[1]}</a>
  })
}

function articleBlocks(body: string): ReactNode[] {
  return body.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean).map((block, index) => {
    if (block.startsWith('### ')) return <h3 key={index} style={{ color: '#17131f', fontSize: '1.12rem', fontWeight: 750, lineHeight: 1.35, marginTop: 12 }}>{inlineMarkdown(block.slice(4))}</h3>
    if (block.startsWith('## ')) return <h2 key={index} style={{ color: '#17131f', fontSize: 'clamp(1.3rem, 3vw, 1.65rem)', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginTop: 22 }}>{inlineMarkdown(block.slice(3))}</h2>
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
    if (lines.length && lines.every(line => line.startsWith('- '))) return <ul key={index} style={{ margin: 0, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>{lines.map((line, itemIndex) => <li key={itemIndex}>{inlineMarkdown(line.slice(2))}</li>)}</ul>
    if (block.startsWith('> ')) return <blockquote key={index} style={{ margin: '10px 0', padding: '4px 0 4px 22px', borderLeft: '4px solid #5D00F5', color: '#4c3d5f', fontSize: '1.08rem', fontWeight: 600 }}>{inlineMarkdown(block.replace(/^> /, '').replace(/\n> /g, ' '))}</blockquote>
    return <p key={index} style={{ margin: 0 }}>{inlineMarkdown(lines.join(' '))}</p>
  })
}

export default async function NewsPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const { userId } = auth()
  const blocks = articleBlocks(post.content || post.excerpt || '')
  let gated = false
  let tierInfo: { tier: string; viewsThisMonth: number; limit: number | null } | null = null
  if (!userId) gated = true
  else {
    const result = await canReadArticle(userId, post.id)
    tierInfo = { tier: result.tier, viewsThisMonth: result.viewsThisMonth, limit: result.limit }
    if (result.allowed) await recordArticleView(userId, post.id)
    else gated = true
  }
  const previewCount = gated ? Math.min(3, blocks.length) : blocks.length
  const canonical = `${NEWS_ORIGIN}/${post.slug}`
  const image = absoluteImageUrl(post.coverImageUrl)
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', mainEntityOfPage: canonical,
    headline: post.title, description: post.seoDescription || post.excerpt, image: image ? [image] : undefined,
    datePublished: post.publishedAt.toISOString(), dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'HySky Society', url: 'https://hysky.org', logo: { '@type': 'ImageObject', url: `${NEWS_ORIGIN}/logo-purple.png` } },
    keywords: post.keywords || undefined,
    isAccessibleForFree: false,
    hasPart: { '@type': 'WebPageElement', isAccessibleForFree: false, cssSelector: '.paywall' },
  }

  return (
    <NewsShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <article className={spaceGrotesk.className} style={{ maxWidth: 780, margin: '0 auto', padding: '42px 28px 88px' }}>
        <Link href={NEWS_ORIGIN} style={{ display: 'inline-flex', color: '#5D00F5', fontSize: '0.86rem', fontWeight: 700, textDecoration: 'none', marginBottom: 34 }}><span aria-hidden="true">&larr;&nbsp;</span>HySky News</Link>
        <div style={{ color: '#5D00F5', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 13 }}>{post.category}</div>
        <h1 style={{ fontWeight: 850, fontSize: 'clamp(2rem, 5vw, 3.45rem)', color: '#17131f', lineHeight: 1.04, margin: '0 0 22px', letterSpacing: '-0.045em' }}>{post.title}</h1>
        {post.excerpt && <p style={{ color: '#5e5866', fontSize: 'clamp(1.05rem, 2.4vw, 1.22rem)', lineHeight: 1.58, margin: '0 0 24px', maxWidth: 720 }}>{post.excerpt}</p>}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingBottom: 25, marginBottom: 34, borderBottom: '1px solid #ece8f1', fontSize: '0.78rem', color: '#8c8593' }}><span style={{ fontWeight: 700, color: '#4a4450' }}>{post.author}</span><span>Â·</span><span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>{post.readTimeMinutes && <><span>Â·</span><span>{post.readTimeMinutes} min read</span></>}</div>
        {post.coverImageUrl && <Image src={post.coverImageUrl} alt={post.imageAltText || post.title} width={1672} height={939} priority unoptimized={post.coverImageUrl.startsWith('http')} style={{ width: '100%', height: 'auto', borderRadius: 18, objectFit: 'cover', marginBottom: 38, maxHeight: 430 }} />}
        <div className={gated ? 'paywall' : undefined} style={{ fontSize: '1.04rem', color: '#332e38', lineHeight: 1.82, display: 'flex', flexDirection: 'column', gap: 22 }}>{blocks.slice(0, previewCount)}</div>
        {gated && <div style={{ marginTop: 0, position: 'relative' }}><div style={{ height: 130, background: 'linear-gradient(to bottom, rgba(255,255,255,0), #fff)', marginBottom: -62, position: 'relative', zIndex: 1 }} /><div style={{ position: 'relative', zIndex: 2, border: '1px solid #e6dff0', borderRadius: 22, padding: '38px 30px', textAlign: 'center', background: '#fff', boxShadow: '0 16px 50px rgba(61,20,105,.09)' }}>
          {!userId ? <><div aria-hidden style={{ fontSize: '1.45rem', marginBottom: 12 }}>ðŸ”’</div><h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#17131f', margin: '0 0 8px' }}>Sign in to keep reading</h2><p style={{ color: '#756d7d', fontSize: '0.92rem', margin: '0 auto 26px', lineHeight: 1.6, maxWidth: 520 }}>A free HySky account includes one article each month. VIP Connect members and HySky News subscribers get unlimited access.</p><div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}><Link href="/sign-in" style={{ padding: '11px 25px', border: '1.5px solid #ded7e5', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', color: '#332e38', textDecoration: 'none' }}>Log in or create account</Link><Link href="/news/subscribe" style={{ padding: '11px 25px', background: '#5D00F5', borderRadius: 10, fontWeight: 750, fontSize: '0.9rem', color: '#fff', textDecoration: 'none' }}>See subscription options</Link></div></> : <><div aria-hidden style={{ fontSize: '1.45rem', marginBottom: 12 }}>ðŸ“°</div><h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#17131f', margin: '0 0 8px' }}>You&apos;ve read your {tierInfo?.limit} free article{tierInfo?.limit === 1 ? '' : 's'} this month</h2><p style={{ color: '#756d7d', fontSize: '0.92rem', margin: '0 auto 8px', lineHeight: 1.6, maxWidth: 520 }}>Your <strong>{tierInfo ? TIER_LABELS[tierInfo.tier as keyof typeof TIER_LABELS] : ''}</strong> plan includes {tierInfo ? TIER_DESCRIPTIONS[tierInfo.tier as keyof typeof TIER_DESCRIPTIONS] : ''}.</p><p style={{ color: '#a39ca8', fontSize: '0.82rem', marginBottom: 26 }}>Your quota resets on the first of next month.</p><Link href="/news/subscribe" style={{ display: 'inline-block', padding: '11px 28px', background: '#5D00F5', borderRadius: 10, fontWeight: 750, fontSize: '0.95rem', color: '#fff', textDecoration: 'none' }}>Upgrade for unlimited access</Link></>}
          <div style={{ marginTop: 30, paddingTop: 22, borderTop: '1px solid #eee9f3', color: '#8c8593', fontSize: '0.78rem' }}>Free: 1 article/month Â· VIP Connect, Monthly & Annual: unlimited</div></div></div>}
        {!gated && <div style={{ marginTop: 60, paddingTop: 30, borderTop: '1px solid #ece8f1' }}><Link href={NEWS_ORIGIN} style={{ color: '#5D00F5', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}><span aria-hidden="true">&larr;&nbsp;</span>More from HySky News</Link></div>}
      </article>
    </NewsShell>
  )
}

