import { useEffect, useMemo, useState } from 'react'
import { SlideRenderer } from '../components/lesson/SlideRenderer'
import { TabNav } from '../components/TabNav'
import { useAuth } from '../contexts/AuthContext'
import { useCompletedLessons } from '../hooks/useCompletedLessons'
import type { ProblemSlide } from '../types/lesson'
import { PRACTICE_LESSONS, type PracticeLessonGroup } from '../utils/practice'
import '../components/lesson/LessonPlayer.css'
import './HomePage.css'
import './PracticePage.css'

/** A selected topic, or `null` topicId meaning "mixed" within the group. */
interface Selection {
  groupId: string
  topicId: string | null
}

function generateFor(group: PracticeLessonGroup, topicId: string | null): ProblemSlide {
  if (topicId === null) {
    const topic = group.topics[Math.floor(Math.random() * group.topics.length)]
    return topic.generate()
  }
  const topic = group.topics.find((t) => t.id === topicId) ?? group.topics[0]
  return topic.generate()
}

export default function PracticePage() {
  const { signOut } = useAuth()
  const { completed, loading } = useCompletedLessons()

  // A practice group only unlocks once its lesson has been completed.
  const unlockedGroups = useMemo(
    () => PRACTICE_LESSONS.filter((group) => completed.has(group.lessonId)),
    [completed],
  )

  const [selection, setSelection] = useState<Selection | null>(null)
  const [problem, setProblem] = useState<ProblemSlide | null>(null)
  const [nonce, setNonce] = useState(0)
  const [solved, setSolved] = useState(0)

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
      setSelection({ groupId: first.lessonId, topicId: null })
      setProblem(generateFor(first, null))
      setNonce((n) => n + 1)
    }
  }, [unlockedGroups, selection])

  const activeGroup = useMemo(
    () => unlockedGroups.find((g) => g.lessonId === selection?.groupId) ?? null,
    [unlockedGroups, selection],
  )

  function nextProblem(sel: Selection) {
    const group = unlockedGroups.find((g) => g.lessonId === sel.groupId)
    if (!group) return
    setProblem(generateFor(group, sel.topicId))
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
      <header className="home-header">
        <h1>Excellent</h1>
        <button type="button" className="home-sign-out" onClick={() => signOut()}>
          Sign out
        </button>
      </header>

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
