import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { DEFAULT_LESSON_ID, lessons } from '../../lessons'
import { loadLessonProgress, saveLessonProgress } from '../../lib/progress'
import { generateEndingQuestions } from '../../utils/generateQuestion'
import { ProgressBar } from './ProgressBar'
import { SlideRenderer } from './SlideRenderer'
import './LessonPlayer.css'

const ENDING_COUNT = 3

export function LessonPlayer() {
  const { user } = useAuth()
  const { lessonId } = useParams<{ lessonId: string }>()

  const lesson = useMemo(
    () => lessons[lessonId ?? DEFAULT_LESSON_ID] ?? lessons[DEFAULT_LESSON_ID],
    [lessonId],
  )
  const coreCount = lesson.slides.length

  const endingQuestions = useMemo(
    () => (lesson.appendRandomQuestions ? generateEndingQuestions(ENDING_COUNT) : []),
    [lesson],
  )
  const slides = useMemo(
    () => [...lesson.slides, ...endingQuestions],
    [lesson, endingQuestions],
  )
  const total = slides.length

  const [slideIndex, setSlideIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let active = true
    setHydrated(false)
    setCompleted(false)
    setSlideIndex(0)
    if (!user) {
      setHydrated(true)
      return
    }
    loadLessonProgress(user.uid, lesson.id)
      .then((progress) => {
        if (!active || !progress) return
        if (progress.lessonCompleted) {
          setCompleted(true)
          return
        }
        const safeIndex = Math.min(Math.max(progress.currentSlideIndex, 0), total - 1)
        setSlideIndex(safeIndex)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setHydrated(true)
      })
    return () => {
      active = false
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
  }, [persist, total])

  const restart = useCallback(() => {
    setCompleted(false)
    setSlideIndex(0)
    persist(0, false)
  }, [persist])

  if (!hydrated) {
    return (
      <div className="lesson-player">
        <main className="lesson-slide">
          <p className="slide-hint">Loading…</p>
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
