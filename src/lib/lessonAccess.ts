/** Result of evaluating whether a lesson is reachable, given its prerequisite. */
export type LessonAccess = 'unlocked' | 'locked'

/**
 * Pure decision used by LessonPlayer. A lesson is unlocked when it has no
 * prerequisite or when the prerequisite is completed. Anything else (not
 * completed, unknown) is locked. Read *errors* are handled separately by the
 * caller as a fail-closed 'error' state — they must never resolve to unlocked.
 */
export function evaluatePrereqAccess(
  prereqId: string | null,
  prereqCompleted: boolean | undefined | null,
): LessonAccess {
  if (!prereqId) return 'unlocked'
  return prereqCompleted === true ? 'unlocked' : 'locked'
}

/**
 * Home-screen unlock rule: a lesson is reachable if it is the first lesson, the
 * previous lesson is completed, it has itself already been completed, or it has
 * already been started. The last condition guarantees a lesson never re-locks
 * once the learner has been able to open it.
 */
export function isUnlockedByPrereq(
  hasPrev: boolean,
  prevCompleted: boolean,
  selfCompleted: boolean,
  selfStarted = false,
): boolean {
  return !hasPrev || prevCompleted || selfCompleted || selfStarted
}
