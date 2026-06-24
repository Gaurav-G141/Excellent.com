import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { DEFAULT_LESSON_ID, lessons, prerequisiteLessonId } from '../../lessons'
import { loadLessonProgress, saveLessonProgress } from '../../lib/progress'
import { recordDailyActivity } from '../../lib/streak'
import {
  generateEndingQuestions,
  generateLesson3Questions,
} from '../../utils/generateQuestion'
import { ProgressBar } from './ProgressBar'
import { SlideRenderer } from './SlideRenderer'
import './LessonPlayer.css'

export function LessonPlayer() {
  const { user } = useAuth()
  const { lessonId } = useParams<{ lessonId: string }>()

  // An unknown lesson id should send the learner home — never silently fall back
  // to another lesson's content.
  const notFound = lessonId != null && !lessons[lessonId]
  const lesson = useMemo(
    () => lessons[lessonId ?? DEFAULT_LESSON_ID] ?? lessons[DEFAULT_LESSON_ID],
    [lessonId],
  )
  const coreCount = lesson.slides.length

  const endingQuestions = useMemo(() => {
    const spec = lesson.randomQuestions
    if (!spec) return []
    return spec.kind === 'relatedRates'
      ? generateLesson3Questions(spec.count)
      : generateEndingQuestions(spec.count)
  }, [lesson])
  const slides = useMemo(
    () => [...lesson.slides, ...endingQuestions],
    [lesson, endingQuestions],
  )
  const total = slides.length

  const [slideIndex, setSlideIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const activityRecorded = useRef(false)

  const prereqId = useMemo(() => prerequisiteLessonId(lesson.id), [lesson.id])
  const [locked, setLocked] = useState(false)
  const [accessChecked, setAccessChecked] = useState(false)

  useEffect(() => {
    let active = true
    setAccessChecked(false)
    setLocked(false)
    if (!prereqId || !user) {
      setAccessChecked(true)
      return
    }
    loadLessonProgress(user.uid, prereqId)
      .then((progress) => {
        if (active) setLocked(!progress?.lessonCompleted)
      })
      .catch(() => {
        if (active) setLocked(false)
      })
      .finally(() => {
        if (active) setAccessChecked(true)
      })
    return () => {
      active = false
    }
  }, [prereqId, user])

  useEffect(() => {
    let active = true
    setHydrated(false)
    setCompleted(false)
    setSlideIndex(0)
    activityRecorded.current = false
    if (!user) {
      setHydrated(true)
      return
    }

    // Never block the lesson on the progress read. If Firestore is slow we show
    // the first slide after a short wait and apply the saved position when (if)
    // it arrives — as long as the learner hasn't already navigated away from it.
    const timeout = window.setTimeout(() => {
      if (active) setHydrated(true)
    }, 2000)

    loadLessonProgress(user.uid, lesson.id)
      .then((progress) => {
        if (!active || !progress) return
        if (progress.lessonCompleted) {
          setCompleted(true)
          return
        }
        const safeIndex = Math.min(Math.max(progress.currentSlideIndex, 0), total - 1)
        setSlideIndex((current) => (current === 0 ? safeIndex : current))
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          window.clearTimeout(timeout)
          setHydrated(true)
        }
      })
    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [user, lesson.id, total])

  const persist = useCallback(
    (index: number, done: boolean) => {
      if (!user) return
      saveLessonProgress(user.uid, lesson.id, {
        currentSlideIndex: index,
        lessonCompleted: done,
      }).catch(() => {})
    },
    [user, lesson.id],
  )

  const advance = useCallback(() => {
    // First forward step today counts as a learning day for the streak.
    if (user && !activityRecorded.current) {
      activityRecorded.current = true
      recordDailyActivity(user.uid).catch(() => {})
    }
    setSlideIndex((index) => {
      if (index >= total - 1) {
        setCompleted(true)
        persist(index, true)
        return index
      }
      const next = index + 1
      persist(next, false)
      return next
    })
  }, [persist, total, user])

  const goBack = useCallback(() => {
    setSlideIndex((index) => {
      if (index <= 0) return index
      const prev = index - 1
      persist(prev, false)
      return prev
    })
  }, [persist])

  const restart = useCallback(() => {
    setCompleted(false)
    setSlideIndex(0)
    persist(0, false)
  }, [persist])

  if (notFound) {
    return <Navigate to="/" replace />
  }

  if (!accessChecked || !hydrated) {
    return (
      <div className="lesson-player">
        <main className="lesson-slide">
          <p className="slide-hint">Loading…</p>
        </main>
      </div>
    )
  }

  if (locked && !completed) {
    const prereq = prereqId ? lessons[prereqId] : null
    return (
      <div className="lesson-player">
        <header className="lesson-header">
          <span className="lesson-title">{lesson.title}</span>
          <Link to="/" className="lesson-close" aria-label="Exit lesson">
            ✕
          </Link>
        </header>
        <main className="lesson-slide lesson-complete">
          <h2>Lesson locked</h2>
          <p>
            Finish {prereq ? `“${prereq.title}”` : 'the previous lesson'} to unlock this
            one.
          </p>
          <Link to="/" className="slide-cta">
            Back to home
          </Link>
        </main>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="lesson-player">
        <header className="lesson-header">
          <span className="lesson-title">{lesson.title}</span>
          <Link to="/" className="lesson-close" aria-label="Exit lesson">
            ✕
          </Link>
        </header>
        <main className="lesson-slide lesson-complete">
          <h2>Lesson complete</h2>
          <p>You finished {lesson.title}.</p>
          <Link to="/" className="slide-cta">
            Back to home
          </Link>
          <button type="button" className="lesson-restart" onClick={restart}>
            Start over
          </button>
        </main>
      </div>
    )
  }

  const slide = slides[slideIndex]
  const inFinal = endingQuestions.length > 0 && slideIndex >= coreCount

  return (
    <div className="lesson-player">
      <header className="lesson-header">
        <button
          type="button"
          className="lesson-back"
          onClick={goBack}
          disabled={slideIndex === 0}
          aria-label="Previous slide"
        >
          ←
        </button>
        <span className="lesson-title">{lesson.title}</span>
        <Link to="/" className="lesson-close" aria-label="Exit lesson">
          ✕
        </Link>
      </header>

      <ProgressBar current={slideIndex} total={total} />

      {inFinal && (
        <p className="lesson-section-tag">
          Final question {slideIndex - coreCount + 1} of {endingQuestions.length}
        </p>
      )}

      <main className="lesson-slide">
        <SlideRenderer key={slide.id} slide={slide} onAdvance={advance} />
      </main>
    </div>
  )
}
