/**
 * Elo / chess-style difficulty engine for the Applications tab.
 *
 * A learner carries a single floating "rating" (1..15). The served problem
 * level is `round(rating)`. After each problem resolves, the outcome is mapped
 * to a score in [0, 1] and the rating moves toward it by a decaying K-factor:
 * large early swings for fast calibration, small later moves for stability.
 *
 * Pure and self-contained: no Firebase, no React, no side effects.
 */

export const MAX_LEVEL = 15
export const INITIAL_RATING = 4

const K_MAX = 5
const K_MIN = 0.75
const TAU = 8
const EXPECTED = 0.5

/**
 * TESTING ONLY — REMOVE / SET BACK TO `null` TO RESTORE NORMAL PROGRESSION.
 *
 * While this is non-null, every answer moves the rating by a FIXED ±this many
 * levels (a win up, a miss down) instead of the gentle decaying K-factor, so the
 * difficulty swing is obvious during manual testing. Set to `null` to restore
 * the real Elo-style progression (and revert the matching assertions in
 * difficulty.test.ts).
 */
const TEST_FIXED_STEP: number | null = 0.5

/** What happened on a single problem, used to derive a score. */
export interface Outcome {
  solved: boolean
  wrongAttempts: number
  skipped: boolean
}

/** A learner's persisted difficulty state. */
export interface RatingState {
  rating: number
  games: number
}

export const INITIAL_STATE: RatingState = { rating: INITIAL_RATING, games: 0 }

/** Clamp a rating into the playable band [1, MAX_LEVEL]. */
export function clampRating(rating: number): number {
  return Math.max(1, Math.min(MAX_LEVEL, rating))
}

/** The served level for a rating: rounded and clamped to [1, MAX_LEVEL]. */
export function levelFromRating(rating: number): number {
  return Math.max(1, Math.min(MAX_LEVEL, Math.round(rating)))
}

/** Map an outcome to a score in [0, 1] (first-try solves score highest). */
export function scoreFromOutcome(o: Outcome): number {
  if (o.skipped || !o.solved) return 0.0
  if (o.wrongAttempts === 0) return 1.0
  if (o.wrongAttempts === 1) return 0.6
  return 0.3
}

/** Decaying K-factor by games played: big early, gentle later. */
export function kFactor(games: number): number {
  return K_MIN + (K_MAX - K_MIN) * Math.exp(-Math.max(0, games) / TAU)
}

/**
 * Advance the rating after one problem. Non-finite inputs are treated as the
 * initial defaults so a corrupt persisted value can never derail adaptation.
 */
export function nextRating(state: RatingState, outcome: Outcome): RatingState {
  const rating = Number.isFinite(state.rating) ? state.rating : INITIAL_RATING
  const games = Number.isFinite(state.games) ? Math.max(0, state.games) : 0
  const S = scoreFromOutcome(outcome)
  if (TEST_FIXED_STEP !== null) {
    const direction = S > EXPECTED ? 1 : S < EXPECTED ? -1 : 0
    return {
      rating: clampRating(rating + direction * TEST_FIXED_STEP),
      games: games + 1,
    }
  }
  const k = kFactor(games)
  return {
    rating: clampRating(rating + k * (S - EXPECTED)),
    games: games + 1,
  }
}
