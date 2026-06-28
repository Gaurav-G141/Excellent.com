import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { TabNav } from '../components/TabNav'
import { useAuth } from '../contexts/AuthContext'
import {
  isAlwaysOpen,
  LESSON_ICONS,
  lessonList,
  lessons,
  recommendedPrerequisiteId,
} from '../lessons'
import { db } from '../lib/firebase'
import { isUnlockedByPrereq } from '../lib/lessonAccess'
import { loadLessonProgress } from '../lib/progress'
import { calendarDaysAgo, currentStreak } from '../lib/streak'
import './HomePage.css'

interface LessonStatus {
  daysAgo: number | null
  completed: boolean
}

function studiedLabel(status: LessonStatus | undefined): string {
  if (!status || status.daysAgo === null) return 'Not started yet'
  const when =
    status.daysAgo === 0
      ? 'today'
      : status.daysAgo === 1
        ? 'yesterday'
        : `${status.daysAgo} days ago`
  return status.completed ? `Finished · last studied ${when}` : `Last studied ${when}`
}

export default function HomePage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [statuses, setStatuses] = useState<Record<string, LessonStatus>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user || !db) {
      setLoaded(true)
      return
    }
    let active = true
    setLoaded(false)

    const userPromise = getDoc(doc(db, 'users', user.uid))
      .then((snapshot) => {
        if (!active || !snapshot.exists()) return
        const data = snapshot.data()
        setDisplayName((data.displayName as string) ?? null)
        setStreak(
          currentStreak({
            count: typeof data.streakCount === 'number' ? data.streakCount : 0,
            lastActiveDate:
              typeof data.lastActiveDate === 'string' ? data.lastActiveDate : null,
            longest: 0,
          }),
        )
      })
      .catch(() => {})

    const lessonPromises = lessonList.map((lesson) =>
      loadLessonProgress(user.uid, lesson.id)
        .then((progress) => {
          if (!active || !progress) return
          setStatuses((current) => ({
            ...current,
            [lesson.id]: {
              daysAgo:
                progress.updatedAt !== null ? calendarDaysAgo(progress.updatedAt) : null,
              completed: progress.lessonCompleted,
            },
          }))
        })
        .catch(() => {}),
    )

    Promise.all([userPromise, ...lessonPromises]).finally(() => {
      if (active) setLoaded(true)
    })

    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="home-page">
      <AppHeader />

      <main className="home-main">
        <TabNav />

        <div className="home-intro">
          <p className="home-greeting">
            Hello, {displayName ?? user?.email ?? 'learner'}!
          </p>
          <span
            className={`home-streak${streak > 0 ? ' home-streak--active' : ''}`}
            aria-label={streak > 0 ? `${streak} day streak` : 'No active streak'}
          >
            {streak > 0 ? (
              <>
                <span className="home-streak-count">{streak}</span>
                day streak
              </>
            ) : (
              'Start your streak today'
            )}
          </span>
        </div>

        {!loaded && <p className="home-loading slide-hint">Loading your lessons…</p>}

        {loaded &&
          lessonList.map((lesson, index) => {
          const alwaysOpen = isAlwaysOpen(lesson.id)
          // Always-open lessons ignore the positional unlock chain entirely.
          const prev = !alwaysOpen && index > 0 ? lessonList[index - 1] : null
          const unlocked =
            alwaysOpen ||
            isUnlockedByPrereq(
              prev !== null,
              prev ? statuses[prev.id]?.completed === true : false,
              statuses[lesson.id]?.completed === true,
              statuses[lesson.id] !== undefined,
            )

          // Non-blocking suggestion shown on always-open cards until the
          // recommended lesson has been finished.
          const recommendedId = alwaysOpen ? recommendedPrerequisiteId(lesson.id) : null
          const recommended =
            recommendedId && statuses[recommendedId]?.completed !== true
              ? lessons[recommendedId]
              : null

          if (!unlocked) {
            return (
              <div
                key={lesson.id}
                className="home-lesson-card home-lesson-card--locked"
                aria-disabled="true"
              >
                <span className="home-lesson-icon home-lesson-icon--locked" aria-hidden>
                  {'\u{1F512}'}
                </span>
                <div>
                  <h2>{lesson.title}</h2>
                  <p>
                    {lesson.subject} · {lesson.slides.length} slides
                  </p>
                  <p className="home-lesson-status home-lesson-status--locked">
                    Finish {prev?.title ?? 'the previous lesson'} to unlock
                  </p>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={lesson.id}
              to={`/lessons/${lesson.id}`}
              className="home-lesson-card"
            >
              <span className="home-lesson-icon">{LESSON_ICONS[lesson.id] ?? '∂'}</span>
              <div>
                <h2>{lesson.title}</h2>
                <p>
                  {lesson.subject} · {lesson.slides.length} slides
                </p>
                <p className="home-lesson-status">{studiedLabel(statuses[lesson.id])}</p>
                {recommended && (
                  <p className="home-lesson-status home-lesson-status--recommended">
                    Recommended first: {recommended.title}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </main>
    </div>
  )
}
