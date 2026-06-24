import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface StreakState {
  count: number
  lastActiveDate: string | null
  longest: number
}

const MS_PER_DAY = 86_400_000

/** Local calendar day as YYYY-MM-DD (streaks follow the learner's own clock). */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole calendar days between a past moment and now (0 = today, 1 = yesterday). */
export function calendarDaysAgo(ms: number, now = new Date()): number {
  const then = new Date(ms)
  const a = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((b - a) / MS_PER_DAY)
}

/**
 * The streak as it should appear right now. A streak survives if the last active
 * day was today or yesterday; any older gap has already broken it.
 */
export function currentStreak(state: StreakState | null, now = new Date()): number {
  if (!state || !state.lastActiveDate || state.count <= 0) return 0
  const today = dayKey(now)
  const yesterday = dayKey(new Date(now.getTime() - MS_PER_DAY))
  if (state.lastActiveDate === today || state.lastActiveDate === yesterday) {
    return state.count
  }
  return 0
}

function readStreak(data: Record<string, unknown> | undefined): StreakState {
  return {
    count: typeof data?.streakCount === 'number' ? data.streakCount : 0,
    lastActiveDate:
      typeof data?.lastActiveDate === 'string' ? data.lastActiveDate : null,
    longest: typeof data?.longestStreak === 'number' ? data.longestStreak : 0,
  }
}

/**
 * Mark today as an active learning day and roll the streak forward. Idempotent:
 * a second call on the same day is a no-op that returns the unchanged state.
 */
export async function recordDailyActivity(uid: string): Promise<StreakState | null> {
  if (!db) return null
  const ref = doc(db, 'users', uid)
  const snapshot = await getDoc(ref)
  const previous = readStreak(snapshot.exists() ? snapshot.data() : undefined)

  const today = dayKey()
  if (previous.lastActiveDate === today) return previous

  const yesterday = dayKey(new Date(Date.now() - MS_PER_DAY))
  const count = previous.lastActiveDate === yesterday ? previous.count + 1 : 1
  const longest = Math.max(previous.longest, count)

  const next: StreakState = { count, lastActiveDate: today, longest }
  await setDoc(
    ref,
    { streakCount: count, lastActiveDate: today, longestStreak: longest },
    { merge: true },
  )
  return next
}
