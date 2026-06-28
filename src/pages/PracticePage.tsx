import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { SlideRenderer } from '../components/lesson/SlideRenderer'
import { TabNav } from '../components/TabNav'
import { useAuth } from '../contexts/AuthContext'
import { useCompletedLessons } from '../hooks/useCompletedLessons'
import {
  loadPracticeActivity,
  recordPracticeActivity,
  type PracticeActivity,
} from '../lib/practiceActivity'
import { loadApplicationsActivity } from '../lib/applicationsActivity'
import { loadAllLessonProgress } from '../lib/progress'
import type { ProblemSlide } from '../types/lesson'
import { APPLICATION_LESSONS } from '../utils/applications'
import { SCENARIO_LESSONS } from '../utils/applications/scenarios'
import { PRACTICE_LESSONS, type PracticeLessonGroup } from '../utils/practice'
import { buildReviewItems, isDue, lastPracticedLabel } from '../utils/practice/review'
import '../components/lesson/LessonPlayer.css'
import './HomePage.css'
import './PracticePage.css'

/** A selected topic, or `null` topicId meaning "mixed" within the group. */
interface Selection {
  groupId: string
  topicId: string | null
}

/** One generated problem together with the concrete topic it came from. */
interface GeneratedProblem {
  slide: ProblemSlide
  topicId: string
}

/**
 * Maps every Applications topic id to the lesson it belongs to. Covers both the
 * current multi-step scenario topics and the legacy single-shot topics so older
 * recorded activity still feeds the "Worth reviewing" staleness check.
 */
const APP_TOPIC_TO_LESSON = new Map<string, string>(
  [...SCENARIO_LESSONS, ...APPLICATION_LESSONS].flatMap((group) =>
    group.topics.map((topic) => [topic.id, group.lessonId] as const),
  ),
)

function generateFor(group: PracticeLessonGroup, topicId: string | null): GeneratedProblem {
  const topic =
    topicId === null
      ? group.topics[Math.floor(Math.random() * group.topics.length)]
      : (group.topics.find((t) => t.id === topicId) ?? group.topics[0])
  return { slide: topic.generate(), topicId: topic.id }
}

export default function PracticePage() {
  const { user } = useAuth()
  const { completed, loading } = useCompletedLessons()

  // A practice group only unlocks once its lesson has been completed.
  const unlockedGroups = useMemo(
    () => PRACTICE_LESSONS.filter((group) => completed.has(group.lessonId)),
    [completed],
  )

  const [selection, setSelection] = useState<Selection | null>(null)
  const [problem, setProblem] = useState<ProblemSlide | null>(null)
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const [solved, setSolved] = useState(0)
  const [activity, setActivity] = useState<PracticeActivity>({})
  // Per-lesson "last studied" (epoch ms): the most recent Lessons or Applications
  // engagement for each lesson, applied to all of that lesson's practice topics.
  const [lessonActivity, setLessonActivity] = useState<Record<string, number>>({})

  // Load when each concept was last studied across all three sections (practice
  // per topic; lessons + applications per lesson). Best-effort; never blocks.
  useEffect(() => {
    if (!user) {
      setActivity({})
      setLessonActivity({})
      return
    }
    let active = true
    void Promise.all([
      loadPracticeActivity(user.uid),
      loadApplicationsActivity(user.uid),
      loadAllLessonProgress(user.uid),
    ])
      .then(([practice, apps, progress]) => {
        if (!active) return
        setActivity(practice)

        // Fold Applications (keyed by app topic) and Lessons (keyed by lesson)
        // into one lesson-id -> latest-ms map, keeping the most recent per lesson.
        const byLesson: Record<string, number> = {}
        const bump = (lessonId: string | undefined, ms: number) => {
          if (!lessonId) return
          byLesson[lessonId] = Math.max(byLesson[lessonId] ?? 0, ms)
        }
        for (const [appTopicId, ms] of Object.entries(apps)) {
          bump(APP_TOPIC_TO_LESSON.get(appTopicId), ms)
        }
        for (const [lessonId, p] of Object.entries(progress)) {
          if (p.updatedAt != null) bump(lessonId, p.updatedAt)
        }
        setLessonActivity(byLesson)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [user])

  // Once we know which groups are unlocked, default to the first one. If the
  // current selection points at a now-locked group, fall back to a valid one.
  useEffect(() => {
    if (unlockedGroups.length === 0) {
      setSelection(null)
      setProblem(null)
      return
    }
    const stillValid =
      selection && unlockedGroups.some((g) => g.lessonId === selection.groupId)
    if (!stillValid) {
      const first = unlockedGroups[0]
      const generated = generateFor(first, null)
      setSelection({ groupId: first.lessonId, topicId: null })
      setProblem(generated.slide)
      setCurrentTopicId(generated.topicId)
      setNonce((n) => n + 1)
    }
  }, [unlockedGroups, selection])

  const activeGroup = useMemo(
    () => unlockedGroups.find((g) => g.lessonId === selection?.groupId) ?? null,
    [unlockedGroups, selection],
  )

  // Concepts worth reviewing: unlocked topics never studied (in any section) or
  // gone stale, stalest first. Shown as a gentle nudge above free practice.
  const reviewItems = useMemo(() => {
    if (unlockedGroups.length === 0) return []
    return buildReviewItems(unlockedGroups, activity, Date.now(), lessonActivity)
      .filter(isDue)
      .slice(0, 4)
  }, [unlockedGroups, activity, lessonActivity])

  function nextProblem(sel: Selection) {
    const group = unlockedGroups.find((g) => g.lessonId === sel.groupId)
    if (!group) return
    const generated = generateFor(group, sel.topicId)
    setProblem(generated.slide)
    setCurrentTopicId(generated.topicId)
    setNonce((n) => n + 1)
  }

  function selectTopic(groupId: string, topicId: string | null) {
    const sel = { groupId, topicId }
    setSelection(sel)
    nextProblem(sel)
  }

  function handleSolved() {
    if (!selection) return
    setSolved((count) => count + 1)
    // Record the just-solved topic for spaced-repetition tracking, and reflect
    // it locally right away so the review panel updates without a re-read.
    if (user && currentTopicId) {
      const topicId = currentTopicId
      setActivity((prev) => ({ ...prev, [topicId]: Date.now() }))
      void recordPracticeActivity(user.uid, topicId).catch(() => {})
    }
    nextProblem(selection)
  }

  function skip() {
    if (selection) nextProblem(selection)
  }

  const isActive = (groupId: string, topicId: string | null) =>
    selection?.groupId === groupId && selection?.topicId === topicId

  const lockedGroups = PRACTICE_LESSONS.filter(
    (group) => !completed.has(group.lessonId),
  )

  return (
    <div className="home-page">
      <AppHeader />

      <main className="home-main">
        <TabNav />

        <div className="practice-intro">
          <h2>Practice</h2>
          <p>
            Pick any concept and get an endless supply of fresh, randomly generated
            problems. Solve one and the next appears.
          </p>
        </div>

        {loading ? (
          <p className="slide-hint">Loading your progress…</p>
        ) : unlockedGroups.length === 0 || !activeGroup || !problem ? (
          <div className="practice-locked">
            <div className="practice-locked-icon" aria-hidden="true">
              🔒
            </div>
            <h3>Practice is locked</h3>
            <p>
              Finish a lesson to unlock practice for its concepts. Head to the{' '}
              <strong>Lessons</strong> tab to get started.
            </p>
          </div>
        ) : (
          <>
            {reviewItems.length > 0 && (
              <section className="practice-review" aria-label="Suggested review">
                <h3 className="practice-review-title">Worth reviewing</h3>
                <p className="practice-review-note">
                  You haven&apos;t studied these in a while. Tap one to brush up.
                </p>
                <div className="practice-review-list">
                  {reviewItems.map((item) => (
                    <button
                      key={item.topicId}
                      type="button"
                      className="practice-review-chip"
                      onClick={() => selectTopic(item.groupId, item.topicId)}
                    >
                      <span className="practice-review-chip-label">{item.label}</span>
                      <span className="practice-review-chip-meta">
                        {lastPracticedLabel(item)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {unlockedGroups.map((group) => (
              <section key={group.lessonId} className="practice-group">
                <h3 className="practice-group-title">{group.lessonTitle}</h3>
                <div
                  className="practice-bar"
                  role="group"
                  aria-label={`${group.lessonTitle} practice topics`}
                >
                  <button
                    type="button"
                    className={`practice-chip${isActive(group.lessonId, null) ? ' practice-chip--active' : ''}`}
                    aria-pressed={isActive(group.lessonId, null)}
                    onClick={() => selectTopic(group.lessonId, null)}
                  >
                    Mixed
                  </button>
                  {group.topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      className={`practice-chip${isActive(group.lessonId, topic.id) ? ' practice-chip--active' : ''}`}
                      aria-pressed={isActive(group.lessonId, topic.id)}
                      onClick={() => selectTopic(group.lessonId, topic.id)}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </section>
            ))}

            {lockedGroups.map((group) => (
              <section
                key={group.lessonId}
                className="practice-group practice-group--locked"
              >
                <h3 className="practice-group-title">
                  <span aria-hidden="true">🔒 </span>
                  {group.lessonTitle}
                </h3>
                <p className="practice-locked-note">
                  Complete <strong>{group.lessonTitle}</strong> to unlock these
                  problems.
                </p>
              </section>
            ))}

            <p className="practice-meta">
              Now practicing: <strong>{activeGroup.lessonTitle}</strong>
              {selection?.topicId
                ? ` · ${activeGroup.topics.find((t) => t.id === selection.topicId)?.label ?? ''}`
                : ' · Mixed'}
              {' · '}Solved this session: <strong>{solved}</strong>
            </p>

            <div className="practice-stage lesson-slide">
              <SlideRenderer key={nonce} slide={problem} onAdvance={handleSolved} />
            </div>

            <div className="practice-actions">
              <button type="button" className="practice-skip" onClick={skip}>
                Skip · new problem
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
