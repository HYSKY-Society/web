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
      host?: string
      playerVars: Record<string, number | string>
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
  const onEndedRef = useRef(onEnded)

  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  useEffect(() => {
    let player: YouTubePlayer | undefined
    let cancelled = false

    void loadYouTubeApi().then((YT) => {
      if (cancelled || !playerNode.current) return
      const videoId = lesson.videoUrl.split('/embed/')[1]?.split('?')[0]
      if (!videoId) return

      player = new YT.Player(playerNode.current, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onStateChange: (event) => {
            if (!isCompleted && event.data === YT.PlayerState.ENDED) onEndedRef.current()
          },
        },
      })
    })

    return () => {
      cancelled = true
      player?.destroy()
    }
  }, [isCompleted, lesson.videoUrl])

  return <div ref={playerNode} className="h-full w-full" aria-label={lesson.title} />
}

function slidesPreviewUrl(url: string) {
  return url.replace(/\/view(?:\?.*)?$/, '/preview')
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
  const [slidesLesson, setSlidesLesson] = useState<CertificationLesson | null>(null)
  const [error, setError] = useState<string | null>(null)

  const completedCount = useMemo(
    () => lessons.filter((lesson) => completed.has(lesson.id)).length,
    [completed, lessons],
  )

  useEffect(() => {
    if (!slidesLesson) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSlidesLesson(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [slidesLesson])

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

  function goToLesson(lessonId: string) {
    document.getElementById(`lesson-${lessonId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          const nextLesson = lessons[index + 1]
          const previousLesson = lessons[index - 1]

          return (
            <section
              id={`lesson-${lesson.id}`}
              key={lesson.id}
              className={`scroll-mt-20 overflow-hidden rounded-2xl border transition-colors ${
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
                  style={!isCompleted && isUnlocked ? { color: '#fff' } : undefined}
                >
                  {isCompleted ? '✓' : lesson.id}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className={`text-sm font-semibold leading-snug ${isUnlocked ? 'text-white' : 'text-white/35'}`}>
                    {lesson.title}
                  </h2>
                  {!isCompleted && (
                    <p className="mt-1 text-xs text-white/40">
                      {isUnlocked
                        ? isSaving ? 'Saving your progress…' : 'Watch to the end to complete this lesson'
                        : 'Locked — complete the previous lesson first'}
                    </p>
                  )}
                </div>
                {isCompleted ? (
                  <span className="shrink-0 rounded-full border border-[#00D4D4]/40 bg-[#00D4D4]/10 px-3 py-1 text-xs font-bold text-[#00D4D4]">
                    ✓ Complete
                  </span>
                ) : !isUnlocked ? (
                  <span aria-hidden="true" className="text-xl opacity-50">🔒</span>
                ) : null}
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
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-5">
                    <button
                      type="button"
                      onClick={() => setSlidesLesson(lesson)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#00D4D4] bg-black px-6 py-3 text-sm font-semibold text-[#00D4D4] transition-colors hover:bg-[#0a1719]"
                    >
                      ▣ View Slides
                    </button>

                    <div className="flex flex-wrap gap-2">
                      {previousLesson && (
                        <button
                          type="button"
                          onClick={() => goToLesson(previousLesson.id)}
                          className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/8 hover:text-white"
                        >
                          ← Previous
                        </button>
                      )}
                      {nextLesson && isCompleted && (
                        <button
                          type="button"
                          onClick={() => goToLesson(nextLesson.id)}
                          className="rounded-xl bg-[#5d00f5] px-5 py-3 text-sm font-bold transition-colors hover:bg-[#7130f7]"
                          style={{ color: '#fff' }}
                        >
                          Next lesson →
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          )
        })}
      </div>

      {slidesLesson && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="slides-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSlidesLesson(null)
          }}
        >
          <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#080b12] shadow-2xl">
            <div className="flex items-center gap-4 border-b border-white/10 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[#00D4D4]">Course slides</div>
                <h2 id="slides-title" className="truncate font-semibold text-white">{slidesLesson.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSlidesLesson(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close slides"
              >
                ×
              </button>
            </div>
            <iframe
              src={slidesPreviewUrl(slidesLesson.slidesUrl)}
              title={`Slides for ${slidesLesson.title}`}
              className="min-h-0 flex-1 bg-white"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </>
  )
}
