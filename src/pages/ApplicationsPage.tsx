import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WordProblemCard } from '../components/applications/WordProblemCard'
import { TabNav } from '../components/TabNav'
import { useAuth } from '../contexts/AuthContext'
import { useApplicationsLevel } from '../hooks/useApplicationsLevel'
import { useCompletedLessons } from '../hooks/useCompletedLessons'
import { APPLICATION_LESSONS } from '../utils/applications'
import { prefetchThemes } from '../utils/applications/aiThemes'
import {
  levelFromRating,
  nextRating,
  type Outcome,
  type RatingState,
} from '../utils/applications/difficulty'
import { rewriteProblem } from '../utils/applications/rewrite'
import { loseStickers, maybeSpawnSticker } from '../lib/stickers/trigger'
import { WRONG_ANSWERS_PER_STICKER_LOSS } from '../lib/stickers/config'
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

/** Representative outcomes used only to predict where the level could move next. */
const WIN_OUTCOME: Outcome = { solved: true, wrongAttempts: 0, skipped: false }
const LOSS_OUTCOME: Outcome = { solved: false, wrongAttempts: 0, skipped: true }

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

/**
 * The 1-2 levels the rating could land on after the *next* answer: one if they
 * do well (level up), one if they don't (level down). Prefetching both means an
 * AI-rewritten problem is usually ready whichever way it goes.
 */
function candidateNextLevels(state: RatingState): number[] {
  const up = levelFromRating(nextRating(state, WIN_OUTCOME).rating)
  const down = levelFromRating(nextRating(state, LOSS_OUTCOME).rating)
  return up === down ? [up] : [up, down]
}

export default function ApplicationsPage() {
  const { signOut, user } = useAuth()
  const { completed, loading: lessonsLoading } = useCompletedLessons()
  const {
    state,
    level,
    loading: levelLoading,
    applyOutcome,
    setLevelForTesting, // TESTING ONLY — remove with the level controls below.
  } = useApplicationsLevel()
  const loading = lessonsLoading || levelLoading

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

  const mounted = useRef(true)
  // Guards the visible problem: a stale showProblem result is dropped so a slow
  // rewrite for an abandoned problem can never overwrite the live one.
  const displayToken = useRef(0)
  // Prewarmed, already-rewritten problems keyed by the level they were built for.
  const bufferByLevel = useRef<Map<number, WordProblem>>(new Map())
  // Levels with a prefetch in flight (avoid firing duplicates for one level).
  const inFlight = useRef<Set<number>>(new Set())
  // Bumped to invalidate all in-flight prefetches (pool reset / manual jump).
  const bufferGen = useRef(0)
  const problemRef = useRef<WordProblem | null>(null)
  const levelRef = useRef(level)
  const stateRef = useRef(state)
  // Cumulative wrong answers across problems; every Nth costs a random sticker.
  // (Possibly temporary — remove with loseStickers / WRONG_ANSWERS_PER_STICKER_LOSS.)
  const wrongTally = useRef(0)

  useEffect(() => {
    problemRef.current = problem
  }, [problem])

  useEffect(() => {
    levelRef.current = level
  }, [level])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Show a freshly rewritten problem, displaying a loading state (not the base
  // phrasing) until the rewrite resolves. Used only on a prefetch miss.
  const showProblem = useCallback(
    (base: WordProblem | null, lvl: number, comp: Set<string>) => {
      const token = ++displayToken.current
      if (!base) {
        setProblem(null)
        return
      }
      // Clear first so the UI shows "preparing" instead of the previous problem.
      setProblem(null)
      void rewriteProblem(base, lvl).then((rewritten) => {
        if (!mounted.current || displayToken.current !== token) return
        setProblem(isUnlocked(rewritten, comp) ? rewritten : null)
        setNonce((n) => n + 1)
      })
    },
    [],
  )

  // Display an already-prepared problem instantly, cancelling any in-flight
  // showProblem so a slow fetch can't clobber this one.
  const displayReady = useCallback((p: WordProblem) => {
    displayToken.current++
    setProblem(p)
    setNonce((n) => n + 1)
  }, [])

  // Prefetch + rewrite one problem for `lvl` into the buffer (no-op if one is
  // already cached or in flight for that level).
  const prefetchLevel = useCallback(
    (topics: ApplicationTopicDef[], lvl: number, comp: Set<string>) => {
      if (topics.length === 0) return
      if (bufferByLevel.current.has(lvl) || inFlight.current.has(lvl)) return
      const base = randomProblem(topics)
      if (!base) return
      const gen = bufferGen.current
      inFlight.current.add(lvl)
      void rewriteProblem(base, lvl)
        .then((rewritten) => {
          if (!mounted.current || bufferGen.current !== gen) return
          if (isUnlocked(rewritten, comp)) bufferByLevel.current.set(lvl, rewritten)
        })
        .finally(() => {
          inFlight.current.delete(lvl)
        })
    },
    [],
  )

  // Warm both levels the rating could move to after the next answer.
  const prefetchNext = useCallback(
    (from: RatingState, topics: ApplicationTopicDef[], comp: Set<string>) => {
      for (const lvl of candidateNextLevels(from)) prefetchLevel(topics, lvl, comp)
    },
    [prefetchLevel],
  )

  // Best-effort: ask the AI to brew up extra "mad-lib" narrative themes in the
  // background. Failures are swallowed; the static themes always cover us.
  useEffect(() => {
    void prefetchThemes()
  }, [])

  // Generate the first problem once the unlocked pool is known, and re-seed if
  // the pool changes (e.g. a lesson is completed). Any problem whose lesson is
  // not (or no longer) completed is discarded so a locked topic can never show.
  useEffect(() => {
    if (unlockedTopics.length === 0) {
      displayToken.current++
      bufferGen.current++
      bufferByLevel.current.clear()
      inFlight.current.clear()
      setProblem(null)
      return
    }
    // Wait until the saved rating has hydrated so returning learners are seeded
    // at their real level instead of the initial default.
    if (levelLoading) return
    if (!isUnlocked(problemRef.current, completed)) {
      showProblem(randomProblem(unlockedTopics), levelRef.current, completed)
    }
    prefetchNext(stateRef.current, unlockedTopics, completed)
  }, [unlockedTopics, completed, levelLoading, showProblem, prefetchNext])

  // Move to the problem for the just-updated level: instant if it was prewarmed,
  // otherwise fetch one (with a loading state). Then warm the next two levels.
  function advance(nextState: RatingState) {
    const lvl = levelFromRating(nextState.rating)
    const cached = bufferByLevel.current.get(lvl) ?? null
    if (isUnlocked(cached, completed)) {
      bufferByLevel.current.delete(lvl)
      displayReady(cached)
    } else {
      showProblem(randomProblem(unlockedTopics), lvl, completed)
    }
    prefetchNext(nextState, unlockedTopics, completed)
  }

  function handleSolved(outcome: Outcome) {
    const next = applyOutcome(outcome)
    setSolved((count) => count + 1)
    if (outcome.solved && user && problemRef.current) {
      void maybeSpawnSticker(problemRef.current, user.uid)
    }
    advance(next)
  }

  // Fires the instant a wrong answer is submitted. Repeated wrong answers cost
  // stickers: the tally is cumulative across problems and spent down in whole
  // "losses" of N wrong answers each, so the Nth wrong answer removes one right
  // away rather than waiting for the problem to end.
  function handleWrongAttempt() {
    if (!user) return
    wrongTally.current += 1
    if (wrongTally.current >= WRONG_ANSWERS_PER_STICKER_LOSS) {
      wrongTally.current -= WRONG_ANSWERS_PER_STICKER_LOSS
      void loseStickers(user.uid, 1)
    }
  }

  function handleSkip() {
    const next = applyOutcome({ solved: false, wrongAttempts: 0, skipped: true })
    advance(next)
  }

  // TESTING ONLY — jump to a chosen level and immediately re-seed at that level.
  // Remove together with the controls rendered below and setLevelForTesting in
  // useApplicationsLevel.
  function handleSetLevel(target: number) {
    const next = setLevelForTesting(target)
    // Drop buffers warmed for the old trajectory; this jump is off-path.
    bufferGen.current++
    bufferByLevel.current.clear()
    inFlight.current.clear()
    showProblem(randomProblem(unlockedTopics), levelFromRating(next.rating), completed)
    prefetchNext(next, unlockedTopics, completed)
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
        ) : unlockedTopics.length === 0 ? (
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

            {/* TESTING ONLY — manual level controls. Delete this whole block
                (and setLevelForTesting in useApplicationsLevel) to remove. */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                margin: '0 0 1rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', opacity: 0.7, marginRight: '0.3rem' }}>
                Test level (current: {level}):
              </span>
              {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleSetLevel(lvl)}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.4rem',
                    cursor: 'pointer',
                    fontWeight: lvl === level ? 700 : 400,
                    border: lvl === level ? '2px solid #6c5ce7' : '1px solid #ccc',
                    background: lvl === level ? '#6c5ce7' : '#fff',
                    color: lvl === level ? '#fff' : '#333',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="practice-stage applications-stage">
              {problem && isUnlocked(problem, completed) ? (
                <WordProblemCard
                  key={nonce}
                  problem={problem}
                  onSolved={(outcome) => handleSolved(outcome)}
                  onWrongAttempt={handleWrongAttempt}
                />
              ) : (
                <div className="applications-loading" role="status" aria-live="polite">
                  <span className="applications-spinner" aria-hidden="true" />
                  <p>Preparing your next problem…</p>
                </div>
              )}
            </div>

            <div className="practice-actions">
              <button
                type="button"
                className="practice-skip"
                onClick={handleSkip}
                disabled={!problem}
              >
                Skip · new problem
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
