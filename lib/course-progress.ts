import { and, eq, sql } from 'drizzle-orm'
import { db } from './db'
import { courseLessonProgress } from './schema'

let tableReady: Promise<unknown> | null = null

async function ensureCourseProgressTable() {
  tableReady ??= db.execute(sql`
    CREATE TABLE IF NOT EXISTS course_lesson_progress (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_slug TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, course_slug, lesson_id)
    )
  `)
  await tableReady
}

export async function getCompletedLessonIds(userId: string, courseSlug: string): Promise<string[]> {
  await ensureCourseProgressTable()
  const rows = await db
    .select({ lessonId: courseLessonProgress.lessonId })
    .from(courseLessonProgress)
    .where(and(
      eq(courseLessonProgress.userId, userId),
      eq(courseLessonProgress.courseSlug, courseSlug),
    ))
  return rows.map((row) => row.lessonId)
}

export async function markLessonComplete(userId: string, courseSlug: string, lessonId: string) {
  await ensureCourseProgressTable()
  await db
    .insert(courseLessonProgress)
    .values({ userId, courseSlug, lessonId })
    .onConflictDoNothing()
}
