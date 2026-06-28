import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { ScenarioProblemCard } from '../components/applications/ScenarioProblemCard'
import { TabNav } from '../components/TabNav'
import { useAuth } from '../contexts/AuthContext'
import { useApplicationsLevel } from '../hooks/useApplicationsLevel'
import { useCompletedLessons } from '../hooks/useCompletedLessons'
import { useInterests } from '../hooks/useInterests'
import { prefetchThemes } from '../utils/applications/aiThemes'
import {
  levelFromRating,
  MAX_LEVEL,
  nextRating,
  type Outcome,
  type RatingState,
} from '../utils/applications/difficulty'
import { rewriteScenario } from '../utils/applications/scenarioRewrite'
import { ProblemBuffer } from '../utils/applications/problemBuffer'
import { pickWeightedTopic, type TopicRecency } from '../utils/applications/topicPicker'
import {
  APPLICATIONS_UNLOCK_LESSON,
  SCENARIO_LESSONS,
} from '../utils/applications/scenarios'
import type {
  ScenarioProblem,
  ScenarioTopicDef,
} from '../utils/applications/scenarioTypes'
import {
  loadApplicationsActivity,
  recordApplicationsSeen,
} from '../lib/applicationsActivity'
import { loseStickers, maybeSpawnSticker } from '../lib/stickers/trigger'
import { WRONG_ANSWERS_PER_STICKER_LOSS } from '../lib/stickers/config'
import './HomePage.css'
import './PracticePage.css'
import './ApplicationsPage.css'

/** Maps every topic id to the lesson that must be completed to unlock it. */
const LESSON_FOR_TOPIC = new Map<string, string>(
  SCENARIO_LESSONS.flatMap((group) =>
    group.topics.map((topic) => [topic.id, group.lessonId] as const),
  ),
)

/** Representative outcomes used only to predict where the level could move next. */
const WIN_OUTCOME: Outcome = { solved: true, wrongAttempts: 0, skipped: false }
const LOSS_OUTCOME: Outcome = { solved: false, wrongAttempts: 0, skipped: true }

/**
 * How many ready-to-serve problems to keep buffered per warmed level. Two each
 * at the current level, the level below, and the level above means a learner
 * almost never waits — including across consecutive skips at the same level.
 */
const BUFFER_DEPTH = 2

/** Defense-in-depth: a problem only counts as unlocked if its lesson is done. */
function isUnlocked(
  problem: ScenarioProblem | null,
  completed: Set<string>,
): problem is ScenarioProblem {
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

/**
 * Every level worth keeping warm right now. We always include the learner's
 * current level and its immediate neighbours (one below, one above) so the
 * "2 at level, 2 below, 2 above" backup is literally always on hand. We also
 * add wherever the next answer could actually land — which can exceed ±1 early
 * on when rating steps are large — so those are warm too. De-duplicated,
 * clamped to the playable band, and order-stable.
 */
function warmLevels(state: RatingState): number[] {
  const out: number[] = []
  const add = (lvl: number) => {
    const clamped = Math.max(1, Math.min(MAX_LEVEL, lvl))
    if (!out.includes(clamped)) out.push(clamped)
  }
  const current = levelFromRating(state.rating)
  add(current)
  add(current - 1)
  add(current + 1)
  for (const lvl of candidateNextLevels(state)) add(lvl)
  return out
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const { completed, loading: lessonsLoading } = useCompletedLessons()
  const { interests } = useInterests()
  const {
    state,
    level,
    loading: levelLoading,
    applyOutcome,
    setLevelForTesting, // TESTING ONLY — remove with the level controls below.
  } = useApplicationsLevel()
  const loading = lessonsLoading || levelLoading

  // The page-level gate: Applications stay locked until "Rules of Derivatives"
  // is completed. This is the same check TabNav uses, so the tab lock and the
  // page lock always agree. (unlockedTopics still filters the actual pool below
  // for defense-in-depth.)
  const applicationsUnlocked = completed.has(APPLICATIONS_UNLOCK_LESSON)

  // Only topics from completed lessons enter the pool. The learner still never
  // picks one, so completing more lessons quietly widens the mix of problems.
  const unlockedTopics = useMemo(
    () =>
      SCENARIO_LESSONS.filter((group) => completed.has(group.lessonId)).flatMap(
        (group) => group.topics,
      ),
    [completed],
  )

  const [problem, setProblem] = useState<ScenarioProblem | null>(null)
  const [nonce, setNonce] = useState(0)
  const [solved, setSolved] = useState(0)

  const mounted = useRef(true)
  // Guards the visible problem: a stale showProblem result is dropped so a slow
  // rewrite for an abandoned problem can never overwrite the live one.
  const displayToken = useRef(0)
  const problemRef = useRef<ScenarioProblem | null>(null)
  const levelRef = useRef(level)
  const stateRef = useRef(state)
  // Latest unlocked pool / completed set, read by the buffer's pick & accept so
  // it always reflects current progress without recreating the buffer.
  const unlockedTopicsRef = useRef(unlockedTopics)
  const completedRef = useRef(completed)
  // Latest learner interests, read live by the rewrite calls so newly-saved
  // interests theme upcoming problems without recreating the buffer.
  const interestsRef = useRef(interests)
  // Consecutive "misses" — wrong submissions or skips — since the last correct
  // solve. Every WRONG_ANSWERS_PER_STICKER_LOSS in a row costs one random sticker;
  // a correct answer resets the streak.
  // (Possibly temporary — remove with loseStickers / WRONG_ANSWERS_PER_STICKER_LOSS.)
  const missStreak = useRef(0)

  // When each topic was last served (epoch ms), seeded from Firestore on mount.
  // Drives the recency-weighted picker so recently-seen concepts are
  // deprioritized and fully recover (back to uniform) after about a day.
  const recencyRef = useRef<TopicRecency>({})

  // Draw a problem from a recency-weighted topic so the concept stays hidden AND
  // recent topics resurface less. Marking the pick immediately spreads variety
  // across a single prefetch burst; the actual "seen" time is refined (and
  // persisted) when the problem is displayed (see the effect below).
  const pickProblem = useCallback((topics: ScenarioTopicDef[]): ScenarioProblem | null => {
    const topic = pickWeightedTopic(topics, recencyRef.current, Date.now())
    if (!topic) return null
    recencyRef.current = { ...recencyRef.current, [topic.id]: Date.now() }
    return topic.generate()
  }, [])

  // The deep prewarm buffer: keeps BUFFER_DEPTH (2) ready-to-serve problems on
  // hand per warmed level, generating only the shortfall. Created once; all of
  // its inputs are read live from refs so it never needs recreating.
  const bufferRef = useRef<ProblemBuffer<ScenarioProblem> | null>(null)
  if (bufferRef.current === null) {
    bufferRef.current = new ProblemBuffer<ScenarioProblem>({
      depth: BUFFER_DEPTH,
      pick: () => pickProblem(unlockedTopicsRef.current),
      prepare: (base, lvl) => rewriteScenario(base, lvl, interestsRef.current),
      accept: (p) => isUnlocked(p, completedRef.current),
      isLive: () => mounted.current,
    })
  }
  const buffer = bufferRef.current

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
    unlockedTopicsRef.current = unlockedTopics
  }, [unlockedTopics])

  useEffect(() => {
    completedRef.current = completed
  }, [completed])

  useEffect(() => {
    interestsRef.current = interests
  }, [interests])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Seed recency from Firestore so "haven't been seen in a while" persists across
  // sessions. Any picks made before this resolves keep their fresher in-session
  // marks (those win over the loaded values).
  useEffect(() => {
    if (!user) return
    let cancelled = false
    void loadApplicationsActivity(user.uid)
      .then((activity) => {
        if (cancelled) return
        recencyRef.current = { ...activity, ...recencyRef.current }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user])

  // Persist (and refine) the served time whenever a problem is actually shown.
  // Human-paced, so one small best-effort write per displayed problem.
  useEffect(() => {
    if (!problem || !user) return
    const { topicId } = problem
    recencyRef.current = { ...recencyRef.current, [topicId]: Date.now() }
    void recordApplicationsSeen(user.uid, topicId).catch(() => {})
  }, [problem, user])

  // Show a freshly rewritten problem, displaying a loading state (not the base
  // phrasing) until the rewrite resolves. Used only on a prefetch miss.
  const showProblem = useCallback(
    (base: ScenarioProblem | null, lvl: number, comp: Set<string>) => {
      const token = ++displayToken.current
      if (!base) {
        setProblem(null)
        return
      }
      // Clear first so the UI shows "preparing" instead of the previous problem.
      setProblem(null)
      void rewriteScenario(base, lvl, interestsRef.current).then((rewritten) => {
        if (!mounted.current || displayToken.current !== token) return
        setProblem(isUnlocked(rewritten, comp) ? rewritten : null)
        setNonce((n) => n + 1)
      })
    },
    [],
  )

  // Display an already-prepared problem instantly, cancelling any in-flight
  // showProblem so a slow fetch can't clobber this one.
  const displayReady = useCallback((p: ScenarioProblem) => {
    displayToken.current++
    setProblem(p)
    setNonce((n) => n + 1)
  }, [])

  // Keep the current level and both levels the rating could move to warmed to
  // BUFFER_DEPTH (2 each). The buffer only ever prepares the shortfall, so a
  // level that already has enough on hand or in flight generates nothing.
  const prefetchNext = useCallback(
    (from: RatingState) => {
      buffer.topUp(warmLevels(from))
    },
    [buffer],
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
      buffer.reset()
      setProblem(null)
      return
    }
    // Wait until the saved rating has hydrated so returning learners are seeded
    // at their real level instead of the initial default.
    if (levelLoading) return
    if (!isUnlocked(problemRef.current, completed)) {
      showProblem(pickProblem(unlockedTopics), levelRef.current, completed)
    }
    prefetchNext(stateRef.current)
  }, [unlockedTopics, completed, levelLoading, showProblem, prefetchNext, buffer, pickProblem])

  // Move to the problem for the just-updated level: instant if it was prewarmed,
  // otherwise fetch one (with a loading state). Then re-warm current ± levels.
  function advance(nextState: RatingState) {
    const lvl = levelFromRating(nextState.rating)
    const ready = buffer.take(lvl)
    if (ready) {
      displayReady(ready)
    } else {
      showProblem(pickProblem(unlockedTopics), lvl, completed)
    }
    prefetchNext(nextState)
  }

  function handleSolved(outcome: Outcome) {
    const next = applyOutcome(outcome)
    setSolved((count) => count + 1)
    if (outcome.solved && user && problemRef.current) {
      void maybeSpawnSticker(problemRef.current, user.uid, interestsRef.current)
    }
    // A correct answer wipes the miss streak.
    if (outcome.solved) missStreak.current = 0
    advance(next)
  }

  // Counts one "miss" — a wrong submission or a skip — toward the sticker penalty.
  // Every WRONG_ANSWERS_PER_STICKER_LOSS misses in a row removes one random
  // sticker right away and resets the streak; a correct answer also resets it
  // (see handleSolved).
  function registerMiss() {
    if (!user) return
    missStreak.current += 1
    if (missStreak.current >= WRONG_ANSWERS_PER_STICKER_LOSS) {
      missStreak.current = 0
      void loseStickers(user.uid, 1)
    }
  }

  // Fires the instant a wrong answer is submitted.
  function handleWrongAttempt() {
    registerMiss()
  }

  function handleSkip() {
    registerMiss()
    const next = applyOutcome({ solved: false, wrongAttempts: 0, skipped: true })
    advance(next)
  }

  // TESTING ONLY — jump to a chosen level and immediately re-seed at that level.
  // Remove together with the controls rendered below and setLevelForTesting in
  // useApplicationsLevel.
  function handleSetLevel(target: number) {
    const next = setLevelForTesting(target)
    // Drop buffers warmed for the old trajectory; this jump is off-path.
    buffer.reset()
    showProblem(pickProblem(unlockedTopics), levelFromRating(next.rating), completed)
    prefetchNext(next)
  }

  return (
    <div className="home-page">
      <AppHeader />

      <main className="home-main">
        <TabNav />

        <div className="practice-intro">
          <h2>Applications</h2>
          <p>
            A random real-world problem each time, and we won&apos;t tell you which
            idea it&apos;s testing. Read carefully, figure out the approach, and solve.
            Miss one and you&apos;ll get a hint, never the answer.
          </p>
        </div>

        {loading ? (
          <p className="slide-hint">Loading your progress…</p>
        ) : !applicationsUnlocked ? (
          <div className="practice-locked">
            <div className="practice-locked-icon" aria-hidden="true">
              🔒
            </div>
            <h3>Applications are locked</h3>
            <p>
              Finish <strong>Rules of Derivatives</strong> to unlock real-world
              problems. Head to the <strong>Lessons</strong> tab to get there.
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
                <ScenarioProblemCard
                  key={nonce}
                  problem={problem}
                  level={level}
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
