'use server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { feedPosts, feedPostLikes, feedPostReplies } from '@/lib/schema'
import { eq, and, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isAdmin } from '@/lib/admin'

async function canPublish(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): Promise<boolean> {
  const email = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  const tier = await getUserTier(user.id)
  return hasVipCommunityAccess(tier) || isAdmin(email)
}

export async function createPost(formData: FormData) {
  const user = await currentUser()
  if (!user || !await canPublish(user)) return

  const content = (formData.get('content') as string | null)?.trim() ?? ''
  const imageUrls = (formData.get('imageUrls') as string | null) ?? '[]'
  if (!content && imageUrls === '[]') return
  if (content.length > 3000) return

  await db.insert(feedPosts).values({ authorId: user.id, content, imageUrls })
  revalidatePath('/feed')
}

export async function toggleLike(postId: string): Promise<{ liked: boolean }> {
  const user = await currentUser()
  if (!user) return { liked: false }

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
    return { liked: false }
  } else {
    await db.insert(feedPostLikes).values({ userId: user.id, postId })
    await db.update(feedPosts)
      .set({ likeCount: sql`${feedPosts.likeCount} + 1` })
      .where(eq(feedPosts.id, postId))
    return { liked: true }
  }
}

export async function createReply(postId: string, content: string) {
  const user = await currentUser()
  if (!user) return

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 1000) return

  await db.insert(feedPostReplies).values({ postId, authorId: user.id, content: trimmed })
  await db.update(feedPosts)
    .set({ replyCount: sql`${feedPosts.replyCount} + 1` })
    .where(eq(feedPosts.id, postId))
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
