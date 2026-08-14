'use server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { feedPosts, feedPostLikes, feedPostReplies, userProfiles } from '@/lib/schema'
import { createNotification, notifyNewPost, removeNotification } from '@/lib/notifications'
import { eq, and, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'

async function canPublish(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): Promise<boolean> {
  const tier = await getUserTier(user.id)
  return hasVipCommunityAccess(tier)
}

export async function createPost(formData: FormData) {
  const user = await currentUser()
  if (!user || !await canPublish(user)) return

  const content = (formData.get('content') as string | null)?.trim() ?? ''
  const imageUrls = (formData.get('imageUrls') as string | null) ?? '[]'
  if (!content && imageUrls === '[]') return
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

  const mentionCandidates = requestedMentionIds.length
    ? await db
        .select({ id: userProfiles.userId, name: userProfiles.displayName })
        .from(userProfiles)
        .where(and(
          inArray(userProfiles.userId, requestedMentionIds),
          eq(userProfiles.isVisible, true),
        ))
    : []

  const mentions = mentionCandidates.flatMap((member) =>
    member.name && content.includes(`@${member.name}`)
      ? [{ id: member.id, name: member.name }]
      : []
  )
  const storedContent = mentions.length
    ? `${content}\n⁣hysky-mentions:${encodeURIComponent(JSON.stringify(mentions))}`
    : content

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

export async function createReply(postId: string, content: string) {
  const user = await currentUser()
  if (!user) return

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 1000) return

  const [post] = await db.select({ authorId: feedPosts.authorId })
    .from(feedPosts)
    .where(eq(feedPosts.id, postId))
    .limit(1)

  await db.insert(feedPostReplies).values({ postId, authorId: user.id, content: trimmed })
  await db.update(feedPosts)
    .set({ replyCount: sql`${feedPosts.replyCount} + 1` })
    .where(eq(feedPosts.id, postId))
  if (post) await createNotification({ userId: post.authorId, actorId: user.id, type: 'reply', entityId: postId, href: `/feed#post-${postId}` }).catch(() => {})
  revalidatePath('/feed')
}

export async function repostPost(originalPostId: string) {
  const user = await currentUser()
  if (!user || !await canPublish(user)) return

  await db.insert(feedPosts).values({ authorId: user.id, content: '', repostOfId: originalPostId })
  await db.update(feedPosts)
    .set({ repostCount: sql`${feedPosts.repostCount} + 1` })
    .where(eq(feedPosts.id, originalPostId))
  revalidatePath('/feed')
}
