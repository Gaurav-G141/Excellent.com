import { doc, runTransaction } from 'firebase/firestore'
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

export function readStreak(data: Record<string, unknown> | undefined): StreakState {
  return {
    count: typeof data?.streakCount === 'number' ? data.streakCount : 0,
    lastActiveDate:
      typeof data?.lastActiveDate === 'string' ? data.lastActiveDate : null,
    longest: typeof data?.longestStreak === 'number' ? data.longestStreak : 0,
  }
}

/**
 * Pure streak roll: given the previous state, return the new state for "active
 * today", or `null` if today was already recorded (no change). Extends the
 * streak when the last active day was yesterday, otherwise resets to 1.
 */
export function rollStreak(previous: StreakState, now = new Date()): StreakState | null {
  const today = dayKey(now)
  if (previous.lastActiveDate === today) return null
  const yesterday = dayKey(new Date(now.getTime() - MS_PER_DAY))
  const count = previous.lastActiveDate === yesterday ? previous.count + 1 : 1
  const longest = Math.max(previous.longest, count)
  return { count, lastActiveDate: today, longest }
}

/**
 * Mark today as an active learning day and roll the streak forward. Runs inside
 * a Firestore transaction so concurrent calls (multiple tabs / rapid clicks)
 * can't both read a stale count and clobber each other. Idempotent within a day.
 */
export async function recordDailyActivity(uid: string): Promise<StreakState | null> {
  if (!db) return null
  const database = db
  const ref = doc(database, 'users', uid)
  return runTransaction(database, async (tx) => {
    const snapshot = await tx.get(ref)
    const previous = readStreak(snapshot.exists() ? snapshot.data() : undefined)
    const next = rollStreak(previous)
    if (!next) return previous
    tx.set(
      ref,
      { streakCount: next.count, lastActiveDate: next.lastActiveDate, longestStreak: next.longest },
      { merge: true },
    )
    return next
  })
}
