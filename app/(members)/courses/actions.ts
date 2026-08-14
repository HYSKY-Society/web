'use server'

import { currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { hasCourseAccess } from '@/lib/course-access'
import { getCompletedLessonIds, markLessonComplete } from '@/lib/course-progress'
import { H2_CERTIFICATION_COURSE_SLUG, h2CertificationLessons } from '@/lib/h2-certification-course'
import { H2_POLICY_COURSE_SLUG, h2PolicyLessons } from '@/lib/h2-policy-course'
import type { CourseLesson } from '@/lib/course-lesson'

const courseLessons: Record<string, CourseLesson[]> = {
  [H2_CERTIFICATION_COURSE_SLUG]: h2CertificationLessons,
  [H2_POLICY_COURSE_SLUG]: h2PolicyLessons,
}

export async function completeCourseLesson(courseSlug: string, lessonId: string) {
  const lessons = courseLessons[courseSlug]
  if (!lessons) throw new Error('Unknown course.')
  const user = await currentUser()
  if (!user) throw new Error('You must be signed in to save course progress.')
  if (!(await hasCourseAccess(user.id, courseSlug))) throw new Error('Course access is required.')
  const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId)
  if (lessonIndex < 0) throw new Error('Unknown lesson.')
  const completed = await getCompletedLessonIds(user.id, courseSlug)
  const completedSet = new Set(completed)
  if (lessons.slice(0, lessonIndex).some((lesson) => !completedSet.has(lesson.id))) throw new Error('Finish the previous lesson before continuing.')
  await markLessonComplete(user.id, courseSlug, lessonId)
  const completedLessonIds = [...new Set([...completed, lessonId])]
  revalidatePath(`/courses/${courseSlug}/content`)
  return { completedLessonIds }
}
