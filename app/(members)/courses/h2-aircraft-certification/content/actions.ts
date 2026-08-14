'use server'

import { currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { hasCourseAccess } from '@/lib/course-access'
import { getCompletedLessonIds, markLessonComplete } from '@/lib/course-progress'
import { H2_CERTIFICATION_COURSE_SLUG, h2CertificationLessons } from '@/lib/h2-certification-course'

export async function completeCertificationLesson(lessonId: string) {
  const user = await currentUser()
  if (!user) throw new Error('You must be signed in to save course progress.')

  const hasAccess = await hasCourseAccess(user.id, H2_CERTIFICATION_COURSE_SLUG)
  if (!hasAccess) throw new Error('Course access is required.')

  const lessonIndex = h2CertificationLessons.findIndex((lesson) => lesson.id === lessonId)
  if (lessonIndex < 0) throw new Error('Unknown lesson.')

  const completed = await getCompletedLessonIds(user.id, H2_CERTIFICATION_COURSE_SLUG)
  const completedSet = new Set(completed)
  const missingPrerequisite = h2CertificationLessons
    .slice(0, lessonIndex)
    .some((lesson) => !completedSet.has(lesson.id))

  if (missingPrerequisite) throw new Error('Finish the previous lesson before continuing.')

  await markLessonComplete(user.id, H2_CERTIFICATION_COURSE_SLUG, lessonId)
  const completedLessonIds = [...new Set([...completed, lessonId])]

  revalidatePath('/courses/h2-aircraft-certification/content')
  return { completedLessonIds }
}
