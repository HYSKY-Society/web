'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CertificationLesson } from '@/lib/h2-certification-course'
import { completeCertificationLesson } from '@/app/(members)/courses/h2-aircraft-certification/content/actions'

type YouTubePlayer = { destroy: () => void }
type YouTubePlayerEvent = { data: number }
type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      playerVars: Record<string, number>
      events: { onStateChange: (event: YouTubePlayerEvent) => void }
    },
  ) => YouTubePlayer
  PlayerState: { ENDED: number }
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let youTubeApiPromise: Promise<YouTubeNamespace> | null = null

function loadYouTubeApi(): Promise<YouTubeNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youTubeApiPromise) return youTubeApiPromise

  youTubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      if (window.YT) resolve(window.YT)
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  })

  return youTubeApiPromise
}

function CourseVideo({
  lesson,
  isCompleted,
  onEnded,
}: {
  lesson: CertificationLesson
  isCompleted: boolean
  onEnded: () => void
}) {
  const playerNode = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let player: YouTubePlayer | undefined
    let cancelled = false

    void loadYouTubeApi().then((YT) => {
      if (cancelled || !playerNode.current) return
      const videoId = lesson.videoUrl.split('/embed/')[1]?.split('?')[0]
      if (!videoId) return

      player = new YT.Player(playerNode.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event) => {
            if (!isCompleted && event.data === YT.PlayerState.ENDED) onEnded()
          },
        },
      })
    })

    return () => {
      cancelled = true
      player?.destroy()
    }
  }, [isCompleted, lesson.videoUrl, onEnded])

  return <div ref={playerNode} className="h-full w-full" />
}

export function SequentialCourse({
  lessons,
  initialCompletedLessonIds,
}: {
  lessons: CertificationLesson[]
  initialCompletedLessonIds: string[]
}) {
  const [completed, setCompleted] = useState(() => new Set(initialCompletedLessonIds))
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const completedCount = useMemo(
    () => lessons.filter((lesson) => completed.has(lesson.id)).length,
    [completed, lessons],
  )

  async function finishLesson(lessonId: string) {
    if (completed.has(lessonId) || savingLessonId) return
    setSavingLessonId(lessonId)
    setError(null)

    try {
      const result = await completeCertificationLesson(lessonId)
      setCompleted(new Set(result.completedLessonIds))
    } catch {
      setError('We could not save your progress. Please replay the end of the video and try again.')
    } finally {
      setSavingLessonId(null)
    }
  }

  return (
    <>
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
          <span className="font-semibold">Course progress</span>
          <span className="text-white/55">{completedCount} of {lessons.length} lessons complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#5d00f5] transition-all duration-500"
            style={{ width: `${(completedCount / lessons.length) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-white/45">
          Finish each video to unlock the next lesson and its slides.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {lessons.map((lesson, index) => {
          const isCompleted = completed.has(lesson.id)
          const isUnlocked = index === 0 || lessons.slice(0, index).every((item) => completed.has(item.id))
          const isSaving = savingLessonId === lesson.id

          return (
            <section
              key={lesson.id}
              className={`overflow-hidden rounded-2xl border transition-colors ${
                isUnlocked ? 'border-white/10 bg-white/5' : 'border-white/7 bg-white/[0.025]'
              }`}
            >
              <div className="flex items-center gap-4 p-6 pb-4">
                <div
                  className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-bold ${
                    isCompleted
                      ? 'bg-[#00D4D4] text-black'
                      : isUnlocked
                        ? 'bg-[#5d00f5] text-white'
                        : 'bg-white/8 text-white/35'
                  }`}
                >
                  {isCompleted ? '✓' : lesson.id}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className={`text-sm font-semibold leading-snug ${isUnlocked ? 'text-white' : 'text-white/35'}`}>
                    {lesson.title}
                  </h2>
                  <p className="mt-1 text-xs text-white/40">
                    {isCompleted
                      ? 'Completed'
                      : isUnlocked
                        ? isSaving ? 'Saving your progress…' : 'Watch to the end to complete this lesson'
                        : 'Locked — complete the previous lesson first'}
                  </p>
                </div>
                {!isUnlocked && <span aria-hidden="true" className="text-xl opacity-50">🔒</span>}
              </div>

              {isUnlocked && (
                <>
                  <div className="mx-6 mb-4 aspect-video overflow-hidden rounded-xl bg-black">
                    <CourseVideo
                      lesson={lesson}
                      isCompleted={isCompleted}
                      onEnded={() => void finishLesson(lesson.id)}
                    />
                  </div>
                  <div className="px-6 pb-5">
                    <a
                      href={lesson.slidesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/8"
                      style={{ borderColor: '#00D4D4', color: '#00D4D4' }}
                    >
                      ↓ Open Slides
                    </a>
                  </div>
                </>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
