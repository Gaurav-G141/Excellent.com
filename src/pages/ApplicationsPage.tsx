import { useEffect, useMemo, useState } from 'react'
import { WordProblemCard } from '../components/applications/WordProblemCard'
import { TabNav } from '../components/TabNav'
import { useAuth } from '../contexts/AuthContext'
import { useCompletedLessons } from '../hooks/useCompletedLessons'
import { APPLICATION_LESSONS } from '../utils/applications'
import type { ApplicationTopicDef, WordProblem } from '../utils/applications/types'
import './HomePage.css'
import './PracticePage.css'
import './ApplicationsPage.css'

/** Maps every topic id to the lesson that must be completed to unlock it. */
const LESSON_FOR_TOPIC = new Map<string, string>(
  APPLICATION_LESSONS.flatMap((group) =>
    group.topics.map((topic) => [topic.id, group.lessonId] as const),
  ),
)

/** Draw a problem from a uniformly random topic so the concept stays hidden. */
function randomProblem(topics: ApplicationTopicDef[]): WordProblem | null {
  if (topics.length === 0) return null
  const topic = topics[Math.floor(Math.random() * topics.length)]
  return topic.generate()
}

/** Defense-in-depth: a problem only counts as unlocked if its lesson is done. */
function isUnlocked(
  problem: WordProblem | null,
  completed: Set<string>,
): problem is WordProblem {
  if (!problem) return false
  const lessonId = LESSON_FOR_TOPIC.get(problem.topicId)
  return lessonId !== undefined && completed.has(lessonId)
}

export default function ApplicationsPage() {
  const { signOut } = useAuth()
  const { completed, loading } = useCompletedLessons()

  // Only topics from completed lessons enter the pool. The learner still never
  // picks one, so completing more lessons quietly widens the mix of problems.
  const unlockedTopics = useMemo(
    () =>
      APPLICATION_LESSONS.filter((group) => completed.has(group.lessonId)).flatMap(
        (group) => group.topics,
      ),
    [completed],
  )

  const [problem, setProblem] = useState<WordProblem | null>(null)
  const [nonce, setNonce] = useState(0)
  const [solved, setSolved] = useState(0)

  // Generate the first problem once the unlocked pool is known, and re-seed if
  // the pool changes (e.g. a lesson is completed). Any problem whose lesson is
  // not (or no longer) completed is discarded so a locked topic can never show.
  useEffect(() => {
    if (unlockedTopics.length === 0) {
      setProblem(null)
      return
    }
    setProblem((current) =>
      isUnlocked(current, completed) ? current : randomProblem(unlockedTopics),
    )
  }, [unlockedTopics, completed])

  function nextProblem() {
    setProblem(randomProblem(unlockedTopics))
    setNonce((n) => n + 1)
  }

  function handleSolved() {
    setSolved((count) => count + 1)
    nextProblem()
  }

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
          <h2>Applications</h2>
          <p>
            A random real-world problem each time — and we won&apos;t tell you which
            idea it&apos;s testing. Read carefully, figure out the approach, and solve.
            Miss one and you&apos;ll get a hint, never the answer.
          </p>
        </div>

        {loading ? (
          <p className="slide-hint">Loading your progress…</p>
        ) : !isUnlocked(problem, completed) ? (
          <div className="practice-locked">
            <div className="practice-locked-icon" aria-hidden="true">
              🔒
            </div>
            <h3>Applications are locked</h3>
            <p>
              Finish a lesson to unlock real-world problems for its concepts. Head to
              the <strong>Lessons</strong> tab to get started.
            </p>
          </div>
        ) : (
          <>
            <p className="practice-meta">
              Solved this session: <strong>{solved}</strong>
            </p>

            <div className="practice-stage applications-stage">
              <WordProblemCard key={nonce} problem={problem} onSolved={handleSolved} />
            </div>

            <div className="practice-actions">
              <button type="button" className="practice-skip" onClick={nextProblem}>
                Skip · new problem
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
