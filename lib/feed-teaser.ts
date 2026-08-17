import { db } from './db'
import { feedPosts } from './schema'

const NEWS_ORIGIN = 'https://news.hysky.org'

export async function postFeedTeaser(
  authorId: string,
  post: { title: string; slug: string; coverImageUrl: string | null },
) {
  await db.insert(feedPosts).values({
    authorId,
    content: `New on HySky News: ${post.title}\n\n${NEWS_ORIGIN}/${post.slug}`,
    imageUrls: post.coverImageUrl ? JSON.stringify([post.coverImageUrl]) : '[]',
  })
}
