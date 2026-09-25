'use server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { feedPosts, feedPostLikes, feedPostReplies, notifications, userProfiles, users, pendingTiers } from '@/lib/schema'
import { createNotification, notifyNewPost, removeNotification } from '@/lib/notifications'
import { eq, and, inArray, sql, ne, or, notInArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isFeedModerator } from '@/lib/admin'
import { fetchLinkPreview } from '@/lib/link-preview'

async function canPublish(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): Promise<boolean> {
  const tier = await getUserTier(user.id)
  return hasVipCommunityAccess(tier)
}

function canModerate(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): boolean {
  const email = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  return isFeedModerator(email)
}

export async function createPost(formData: FormData) {
  const user = await currentUser()
  if (!user || !await canPublish(user)) return

  const content = (formData.get('content') as string | null)?.trim() ?? ''
  const imageUrls = (formData.get('imageUrls') as string | null) ?? '[]'

  // Parse file attachments (PDF, DOC, etc.)
  let attachments: { url: string; name: string; type: string }[] = []
  try {
    const parsed = JSON.parse((formData.get('attachmentUrls') as string | null) ?? '[]')
    if (Array.isArray(parsed)) {
      attachments = parsed
        .filter((a): a is { url: string; name: string; type: string } =>
          a && typeof a.url === 'string' && typeof a.name === 'string' && typeof a.type === 'string'
        )
        .slice(0, 5)
    }
  } catch {
    attachments = []
  }

  if (!content && imageUrls === '[]' && attachments.length === 0) return
  if (content.length > 3000) return

  let requestedMentionIds: string[] = []
  try {
    const parsed = JSON.parse((formData.get('mentionUserIds') as string | null) ?? '[]')
    if (Array.isArray(parsed)) {
      requestedMentionIds = [...new Set(parsed.filter((value): value is string => typeof value === 'string'))]
        .filter((id) => id !== user.id)
        .slice(0, 20)
    }
  } catch {
    requestedMentionIds = []
  }

  // Note: tagging is an explicit action distinct from directory visibility, so we
  // do NOT filter by isVisible here — doing so previously caused tagged members
  // who had hidden their profile from the directory to silently get no notification.
  const mentionCandidates = requestedMentionIds.length
    ? await db
        .select({ id: userProfiles.userId, name: userProfiles.displayName })
        .from(userProfiles)
        .where(inArray(userProfiles.userId, requestedMentionIds))
    : []

  const mentions = mentionCandidates.flatMap((member) =>
    member.name && content.includes(`@${member.name}`)
      ? [{ id: member.id, name: member.name }]
      : []
  )
  const linkPreview = await fetchLinkPreview(content)
  const metadata = [
    linkPreview ? `⁣hysky-link-preview:${encodeURIComponent(JSON.stringify(linkPreview))}` : null,
    mentions.length ? `⁣hysky-mentions:${encodeURIComponent(JSON.stringify(mentions))}` : null,
    attachments.length ? `⁣hysky-files:${encodeURIComponent(JSON.stringify(attachments))}` : null,
  ].filter(Boolean)
  const storedContent = metadata.length ? `${content}\n${metadata.join('\n')}` : content

  const [post] = await db.insert(feedPosts)
    .values({ authorId: user.id, content: storedContent, imageUrls })
    .returning({ id: feedPosts.id })

  await Promise.all(mentions.map((member) =>
    createNotification({
      userId: member.id,
      actorId: user.id,
      type: 'mention',
      entityId: post.id,
      href: `/feed#post-${post.id}`,
    }).catch(() => {})
  ))
  await notifyNewPost(user.id, post.id, mentions.map((member) => member.id)).catch(() => {})
  revalidatePath('/feed')
}

// Members submit these via the "Create event" button in the composer (VIP only).
// Stored as a feed post carrying hidden ⁣hysky-event: metadata so it needs no schema
// migration — it renders as a full event post in the main feed (via FeedPostCard) and
// also surfaces in the "Member Events" sidebar.
export async function createMemberEvent(input: {
  title: string
  date: string
  location: string
  link: string
  description: string
  imageUrl?: string
}): Promise<{ ok: true; id: string } | { error: string }> {
  const user = await currentUser()
  if (!user) return { error: 'You must be signed in to create an event' }
  if (!await canPublish(user)) return { error: 'VIP Connect is required to create an event' }

  const title = input.title.trim()
  const location = input.location.trim()
  const link = input.link.trim()
  const description = input.description.trim()
  const imageUrl = (input.imageUrl ?? '').trim()

  if (!title) return { error: 'Title is required' }
  if (title.length > 140) return { error: 'Title is too long' }
  if (!location) return { error: 'Location is required' }
  if (location.length > 140) return { error: 'Location is too long' }
  if (description.length > 500) return { error: 'Description is too long' }
  if (!link) return { error: 'Link is required' }
  if (!/^https?:\/\//i.test(link)) return { error: 'Link must start with http:// or https://' }
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) return { error: 'Image failed to upload — please try again' }

  const eventDate = new Date(input.date)
  if (Number.isNaN(eventDate.getTime())) return { error: 'Please choose a valid date' }

  const metadata = `⁣hysky-event:${encodeURIComponent(JSON.stringify({
    title,
    date: eventDate.toISOString(),
    location,
    link: link || null,
    image: imageUrl || null,
  }))}`
  const visibleText = description || title
  const storedContent = `${visibleText}\n${metadata}`

  const [post] = await db.insert(feedPosts)
    .values({ authorId: user.id, content: storedContent, imageUrls: imageUrl ? JSON.stringify([imageUrl]) : '[]' })
    .returning({ id: feedPosts.id })

  revalidatePath('/feed')
  return { ok: true, id: post.id }
}

export async function deletePost(postId: string): Promise<{ deleted: boolean }> {
  const user = await currentUser()
  if (!user || !canModerate(user)) return { deleted: false }

  const [post] = await db
    .select({ id: feedPosts.id, repostOfId: feedPosts.repostOfId })
    .from(feedPosts)
    .where(eq(feedPosts.id, postId))
    .limit(1)
  if (!post) return { deleted: false }

  const reposts = await db
    .select({ id: feedPosts.id })
    .from(feedPosts)
    .where(eq(feedPosts.repostOfId, postId))
  const removedPostIds = [postId, ...reposts.map((repost) => repost.id)]

  await db.delete(notifications).where(inArray(notifications.entityId, removedPostIds))
  if (reposts.length > 0) {
    await db.delete(feedPosts).where(inArray(feedPosts.id, reposts.map((repost) => repost.id)))
  }
  await db.delete(feedPosts).where(eq(feedPosts.id, postId))
  if (post.repostOfId) {
    await db.update(feedPosts)
      .set({ repostCount: sql`greatest(${feedPosts.repostCount} - 1, 0)` })
      .where(eq(feedPosts.id, post.repostOfId))
  }

  revalidatePath('/feed')
  return { deleted: true }
}

export async function deleteReply(replyId: string): Promise<{ deleted: boolean }> {
  const user = await currentUser()
  if (!user || !canModerate(user)) return { deleted: false }

  const [reply] = await db
    .select({ postId: feedPostReplies.postId, authorId: feedPostReplies.authorId })
    .from(feedPostReplies)
    .where(eq(feedPostReplies.id, replyId))
    .limit(1)
  if (!reply) return { deleted: false }

  await db.delete(feedPostReplies).where(eq(feedPostReplies.id, replyId))
  await db.update(feedPosts)
    .set({ replyCount: sql`greatest(${feedPosts.replyCount} - 1, 0)` })
    .where(eq(feedPostReplies.postId, reply.postId))
  await db.delete(notifications).where(and(
    eq(notifications.type, 'reply'),
    eq(notifications.entityId, reply.postId),
    eq(notifications.actorId, reply.authorId),
  ))
  await db.delete(notifications).where(and(
    eq(notifications.type, 'mention'),
    eq(notifications.entityId, replyId),
    eq(notifications.actorId, reply.authorId),
  ))

  revalidatePath('/feed')
  return { deleted: true }
}

export async function toggleLike(postId: string): Promise<{ liked: boolean }> {
  const user = await currentUser()
  if (!user) return { liked: false }

  const [post] = await db.select({ authorId: feedPosts.authorId })
    .from(feedPosts)
    .where(eq(feedPosts.id, postId))
    .limit(1)

  const existing = await db
    .select()
    .from(feedPostLikes)
    .where(and(eq(feedPostLikes.userId, user.id), eq(feedPostLikes.postId, postId)))
    .limit(1)

  if (existing.length > 0) {
    await db.delete(feedPostLikes)
      .where(and(eq(feedPostLikes.userId, user.id), eq(feedPostLikes.postId, postId)))
    await db.update(feedPosts)
      .set({ likeCount: sql`greatest(${feedPosts.likeCount} - 1, 0)` })
      .where(eq(feedPosts.id, postId))
    if (post) await removeNotification({ userId: post.authorId, actorId: user.id, type: 'like', entityId: postId }).catch(() => {})
    return { liked: false }
  } else {
    await db.insert(feedPostLikes).values({ userId: user.id, postId })
    await db.update(feedPosts)
      .set({ likeCount: sql`${feedPosts.likeCount} + 1` })
      .where(eq(feedPosts.id, postId))
    if (post) await createNotification({ userId: post.authorId, actorId: user.id, type: 'like', entityId: postId, href: `/feed#post-${postId}` }).catch(() => {})
    return { liked: true }
  }
}

export async function createReply(postId: string, content: string, requestedMentionIds: string[] = []) {
  const user = await currentUser()
  if (!user) return

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 1000) return

  // All logged-in members can tag anyone in replies
  const uniqueMentionIds = [...new Set(requestedMentionIds.filter((id): id is string => typeof id === 'string'))]
    .filter((id) => id !== user.id)
    .slice(0, 20)

  // Look up mention targets in userProfiles (signed-in members)
  const profileCandidates = uniqueMentionIds.length
    ? await db
        .select({ id: userProfiles.userId, name: userProfiles.displayName })
        .from(userProfiles)
        .where(inArray(userProfiles.userId, uniqueMentionIds))
    : []

  // Also look up pending members (by id stored as email in pendingTiers)
  const pendingCandidates = uniqueMentionIds.length
    ? await db
        .select({ email: pendingTiers.email, name: pendingTiers.name })
        .from(pendingTiers)
        .where(inArray(pendingTiers.email, uniqueMentionIds))
    : []

  const mentions = profileCandidates.flatMap((member) =>
    member.name && trimmed.includes(`@${member.name}`)
      ? [{ id: member.id, name: member.name }]
      : []
  )
  const pendingMentions = pendingCandidates.flatMap((member) =>
    member.name && trimmed.includes(`@${member.name}`)
      ? [{ id: member.email, name: member.name, email: member.email }]
      : []
  )

  const storedContent = mentions.length
    ? `${trimmed}\n⁣hysky-mentions:${encodeURIComponent(JSON.stringify(mentions))}`
    : trimmed

  const [post] = await db.select({ authorId: feedPosts.authorId, content: feedPosts.content })
    .from(feedPosts)
    .where(eq(feedPosts.id, postId))
    .limit(1)

  // Extract a short preview of the original post for email notifications
  const postPreview = post
    ? post.content.split('\n')[0].replace(/⁣hysky-[a-z-]+:[^\n]+/g, '').trim().split(/\s+/).slice(0, 5).join(' ')
    : ''

  const [reply] = await db.insert(feedPostReplies)
    .values({ postId, authorId: user.id, content: storedContent })
    .returning({ id: feedPostReplies.id })
  await db.update(feedPosts)
    .set({ replyCount: sql`${feedPosts.replyCount} + 1` })
    .where(eq(feedPosts.id, postId))

  // In-app notifications for signed-in members tagged in the reply
  await Promise.all(mentions.map((member) =>
    createNotification({
      userId: member.id,
      actorId: user.id,
      type: 'mention',
      entityId: reply.id,
      href: `/feed#post-${postId}`,
    }).catch(() => {})
  ))

  // Email notifications for pending members (haven't signed in yet)
  if (pendingMentions.length && process.env.RESEND_API_KEY) {
    const actorName = user.firstName ?? user.username ?? 'A member'
    await Promise.all(pendingMentions.map(async (member) => {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM ?? 'HySky Connect <noreply@hy-sky.net>',
            to: member.email,
            subject: `${actorName} tagged you in a post`,
            html: `<p>Hi ${member.name ?? 'there'},</p><p><strong>${actorName}</strong> tagged you in a reply on HySky Connect.</p>${postPreview ? `<p>Post: <em>"${postPreview}…"</em></p>` : ''}<p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hy-sky.net'}/feed#post-${postId}">View the conversation →</a></p>`,
          }),
        })
      } catch {
        // Non-critical — swallow email errors
      }
    }))
  }

  if (post && !mentions.some((member) => member.id === post.authorId)) {
    await createNotification({ userId: post.authorId, actorId: user.id, type: 'reply', entityId: postId, href: `/feed#post-${postId}` }).catch(() => {})
  }
  revalidatePath('/feed')
}
