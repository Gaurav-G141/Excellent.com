import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { DEFAULT_LESSON_ID, lessons, prerequisiteLessonId } from '../../lessons'
import { evaluatePrereqAccess } from '../../lib/lessonAccess'
import { loadLessonProgress, saveLessonProgress } from '../../lib/progress'
import { recordDailyActivity } from '../../lib/streak'
import {
  generateEndingQuestions,
  generateLesson3Questions,
} from '../../utils/generateQuestion'
import { hashStringToSeed } from '../../utils/random'
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

  // Seed the random questions per (user, lesson) so a resumed slide index lands
  // on the SAME question content it did before, rather than a freshly randomized one.
  const endingQuestions = useMemo(() => {
    const spec = lesson.randomQuestions
    if (!spec) return []
    const seed = user ? hashStringToSeed(`${user.uid}:${lesson.id}`) : undefined
    return spec.kind === 'relatedRates'
      ? generateLesson3Questions(spec.count, seed)
      : generateEndingQuestions(spec.count, seed)
  }, [lesson, user])
  const slides = useMemo(
    () => [...lesson.slides, ...endingQuestions],
    [lesson, endingQuestions],
  )
  const total = slides.length

  const [slideIndex, setSlideIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const activityRecorded = useRef(false)
  // Completion is sticky: once a lesson has ever been finished we never write
  // `lessonCompleted: false` again, so reviewing/restarting it can't re-lock the
  // next lesson by un-completing its prerequisite.
  const everCompleted = useRef(false)

  const prereqId = useMemo(() => prerequisiteLessonId(lesson.id), [lesson.id])
  // 'checking' until the prereq read resolves; 'error' fails CLOSED so a failed
  // read can never silently unlock a gated lesson.
  const [access, setAccess] = useState<'checking' | 'unlocked' | 'locked' | 'error'>(
    'checking',
  )
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let active = true
    setAccess('checking')
    if (!prereqId || !user) {
      setAccess('unlocked')
      return
    }
    Promise.all([
      loadLessonProgress(user.uid, lesson.id),
      loadLessonProgress(user.uid, prereqId),
    ])
      .then(([self, prereq]) => {
        if (!active) return
        // A lesson that has ever been opened keeps its own progress doc, so it
        // stays unlocked forever — it can never re-lock after being unlocked.
        if (self != null) {
          setAccess('unlocked')
          return
        }
        setAccess(evaluatePrereqAccess(prereqId, prereq?.lessonCompleted))
      })
      .catch(() => {
        if (active) setAccess('error')
      })
    return () => {
      active = false
    }
  }, [prereqId, user, lesson.id, retryToken])

  useEffect(() => {
    let active = true
    setHydrated(false)
    setCompleted(false)
    setSlideIndex(0)
    activityRecorded.current = false
    everCompleted.current = false
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
          everCompleted.current = true
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
      if (done) everCompleted.current = true
      saveLessonProgress(user.uid, lesson.id, {
        currentSlideIndex: index,
        lessonCompleted: done || everCompleted.current,
      })
        .then(() => setSaveError(false))
        .catch(() => setSaveError(true))
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

  if (access === 'checking' || !hydrated) {
    return (
      <div className="lesson-player">
        <main className="lesson-slide">
          <p className="slide-hint">Loading…</p>
        </main>
      </div>
    )
  }

  if (access === 'error' && !completed) {
    return (
      <div className="lesson-player">
        <header className="lesson-header">
          <span className="lesson-title">{lesson.title}</span>
          <Link to="/" className="lesson-close" aria-label="Exit lesson">
            ✕
          </Link>
        </header>
        <main className="lesson-slide lesson-complete">
          <h2>Couldn’t verify access</h2>
          <p>We couldn’t confirm your progress on the previous lesson. Check your
            connection and try again.</p>
          <button
            type="button"
            className="slide-cta"
            onClick={() => {
              setAccess('checking')
              setRetryToken((token) => token + 1)
            }}
          >
            Try again
          </button>
          <Link to="/" className="lesson-restart">
            Back to home
          </Link>
        </main>
      </div>
    )
  }

  if (access === 'locked' && !completed) {
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

      {saveError && (
        <p className="lesson-save-error" role="status">
          Your progress couldn’t be saved. Check your connection.
        </p>
      )}

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
