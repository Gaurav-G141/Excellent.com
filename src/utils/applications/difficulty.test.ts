import { describe, it, expect } from 'vitest'

import {
  MAX_LEVEL,
  INITIAL_RATING,
  INITIAL_STATE,
  clampRating,
  levelFromRating,
  scoreFromOutcome,
  kFactor,
  nextRating,
  type Outcome,
  type RatingState,
} from './difficulty'

// The K-factor band defined in difficulty.ts (kept private there). Tests assert
// kFactor never leaves this band; if the source tunables change, update here.
const K_MAX = 5
const K_MIN = 0.75

function outcome(partial: Partial<Outcome>): Outcome {
  return { solved: false, wrongAttempts: 0, skipped: false, ...partial }
}

const FIRST_TRY = outcome({ solved: true, wrongAttempts: 0 })
const ONE_WRONG = outcome({ solved: true, wrongAttempts: 1 })
const TWO_WRONG = outcome({ solved: true, wrongAttempts: 2 })
const SKIPPED = outcome({ solved: false, skipped: true })
const UNSOLVED = outcome({ solved: false, wrongAttempts: 3 })

// ── Constants ────────────────────────────────────────────────────────────────

describe('difficulty: constants', () => {
  it('exposes the documented tunables', () => {
    expect(MAX_LEVEL).toBe(15)
    expect(INITIAL_RATING).toBe(4)
    expect(INITIAL_STATE).toEqual({ rating: INITIAL_RATING, games: 0 })
  })
})

// ── scoreFromOutcome ─────────────────────────────────────────────────────────

describe('difficulty: scoreFromOutcome', () => {
  it('first-try solve scores 1.0', () => {
    expect(scoreFromOutcome(FIRST_TRY)).toBe(1.0)
  })

  it('solve after exactly 1 wrong scores 0.6', () => {
    expect(scoreFromOutcome(ONE_WRONG)).toBe(0.6)
  })

  it('solve after >= 2 wrong scores 0.3', () => {
    expect(scoreFromOutcome(TWO_WRONG)).toBe(0.3)
    expect(scoreFromOutcome(outcome({ solved: true, wrongAttempts: 5 }))).toBe(0.3)
  })

  it('skipped scores 0.0', () => {
    expect(scoreFromOutcome(SKIPPED)).toBe(0.0)
  })

  it('unsolved (gave up without skip flag) scores 0.0', () => {
    expect(scoreFromOutcome(UNSOLVED)).toBe(0.0)
  })

  it('skipped overrides even a would-be first-try solve', () => {
    // skipped takes precedence: a "solved + skipped" contradiction scores 0.
    expect(scoreFromOutcome(outcome({ solved: true, wrongAttempts: 0, skipped: true }))).toBe(0.0)
  })
})

// ── kFactor ──────────────────────────────────────────────────────────────────

describe('difficulty: kFactor', () => {
  it('decays as games accumulate: kFactor(0) > kFactor(50)', () => {
    expect(kFactor(0)).toBeGreaterThan(kFactor(50))
  })

  it('starts at K_MAX when games = 0', () => {
    expect(kFactor(0)).toBeCloseTo(K_MAX, 10)
  })

  it('is strictly decreasing across the early range', () => {
    for (let g = 0; g < 60; g++) {
      expect(kFactor(g)).toBeGreaterThan(kFactor(g + 1))
    }
  })

  it('stays within [K_MIN, K_MAX] for all (including huge / negative) inputs', () => {
    const samples = [-1000, -1, 0, 1, 5, 8, 20, 100, 1000, 1e6]
    for (const g of samples) {
      const k = kFactor(g)
      expect(k).toBeGreaterThanOrEqual(K_MIN)
      expect(k).toBeLessThanOrEqual(K_MAX)
    }
  })

  it('approaches K_MIN as games grow large', () => {
    expect(kFactor(1e6)).toBeCloseTo(K_MIN, 6)
  })

  it('treats negative games as 0 (clamped floor)', () => {
    expect(kFactor(-10)).toBe(kFactor(0))
  })
})

// ── clampRating ──────────────────────────────────────────────────────────────

describe('difficulty: clampRating', () => {
  it('clamps below 1 up to 1', () => {
    expect(clampRating(0)).toBe(1)
    expect(clampRating(-50)).toBe(1)
  })

  it('clamps above MAX_LEVEL down to MAX_LEVEL', () => {
    expect(clampRating(15.5)).toBe(15)
    expect(clampRating(9999)).toBe(MAX_LEVEL)
  })

  it('leaves in-band values untouched', () => {
    expect(clampRating(1)).toBe(1)
    expect(clampRating(7.25)).toBe(7.25)
    expect(clampRating(15)).toBe(15)
  })
})

// ── levelFromRating ──────────────────────────────────────────────────────────

describe('difficulty: levelFromRating', () => {
  it('rounds to the nearest integer level', () => {
    expect(levelFromRating(3.4)).toBe(3)
    expect(levelFromRating(3.6)).toBe(4)
    expect(levelFromRating(7.5)).toBe(8)
  })

  it('clamps to [1, MAX_LEVEL]', () => {
    expect(levelFromRating(0)).toBe(1)
    expect(levelFromRating(-3)).toBe(1)
    expect(levelFromRating(20)).toBe(15)
    expect(levelFromRating(15.49)).toBe(15)
  })

  it('always returns an integer within range', () => {
    for (let r = -5; r <= 20; r += 0.13) {
      const lvl = levelFromRating(r)
      expect(Number.isInteger(lvl)).toBe(true)
      expect(lvl).toBeGreaterThanOrEqual(1)
      expect(lvl).toBeLessThanOrEqual(MAX_LEVEL)
    }
  })
})

// ── nextRating ───────────────────────────────────────────────────────────────

describe('difficulty: nextRating', () => {
  const fresh: RatingState = { rating: 4, games: 0 }

  it('raises the rating on a win (first-try)', () => {
    const next = nextRating(fresh, FIRST_TRY)
    expect(next.rating).toBeGreaterThan(fresh.rating)
    // TEST_FIXED_STEP override: a win moves +0.5 exactly (4 -> 4.5).
    // Restore to `4 + K_MAX * (1 - EXPECTED)` = 6.5 when TEST_FIXED_STEP is null.
    expect(next.rating).toBeCloseTo(4.5, 10)
  })

  it('lowers the rating on a loss (skipped)', () => {
    const next = nextRating(fresh, SKIPPED)
    expect(next.rating).toBeLessThan(fresh.rating)
    // TEST_FIXED_STEPS override: a miss moves -0.4 exactly (4 -> 3.6).
    // Restore to `4 + K_MAX * (0 - EXPECTED)` = 1.5 when TEST_FIXED_STEPS is null.
    expect(next.rating).toBeCloseTo(3.6, 10)
  })

  it('increments games by exactly 1', () => {
    expect(nextRating(fresh, FIRST_TRY).games).toBe(1)
    expect(nextRating({ rating: 8, games: 41 }, SKIPPED).games).toBe(42)
  })

  it('clamps a win at the top of the band to MAX_LEVEL', () => {
    const next = nextRating({ rating: 15, games: 0 }, FIRST_TRY)
    expect(next.rating).toBe(MAX_LEVEL)
    expect(next.rating).toBeLessThanOrEqual(MAX_LEVEL)
  })

  it('clamps a loss at the bottom of the band to 1', () => {
    const next = nextRating({ rating: 1, games: 0 }, SKIPPED)
    expect(next.rating).toBe(1)
    expect(next.rating).toBeGreaterThanOrEqual(1)
  })

  // TEST_FIXED_STEPS override: the swing no longer decays with games — every win
  // is +0.5 and every loss is -0.4 (asymmetric, biased harder). Restore the
  // "early larger than late" assertions when TEST_FIXED_STEPS is null.
  it('applies a fixed +0.5 win step regardless of games (TEST_FIXED_STEPS)', () => {
    const early = nextRating({ rating: 4, games: 0 }, FIRST_TRY).rating - 4
    const late = nextRating({ rating: 4, games: 100 }, FIRST_TRY).rating - 4
    expect(early).toBeCloseTo(0.5, 10)
    expect(late).toBeCloseTo(0.5, 10)
  })

  it('applies a fixed -0.4 loss step regardless of games (TEST_FIXED_STEPS)', () => {
    const early = nextRating({ rating: 8, games: 0 }, SKIPPED).rating - 8
    const late = nextRating({ rating: 8, games: 100 }, SKIPPED).rating - 8
    expect(early).toBeCloseTo(-0.4, 10)
    expect(late).toBeCloseTo(-0.4, 10)
  })

  it('leaves the rating unchanged at the neutral expected score', () => {
    // A 1-wrong solve scores 0.6 (above neutral) -> small rise, never a drop.
    const next = nextRating({ rating: 8, games: 0 }, ONE_WRONG)
    expect(next.rating).toBeGreaterThan(8)
  })

  it('falls back to INITIAL_RATING when the stored rating is NaN', () => {
    const corrupt = nextRating({ rating: NaN, games: 0 }, FIRST_TRY)
    const clean = nextRating({ rating: INITIAL_RATING, games: 0 }, FIRST_TRY)
    expect(Number.isFinite(corrupt.rating)).toBe(true)
    expect(corrupt.rating).toBeCloseTo(clean.rating, 10)
  })

  it('falls back when the stored rating is Infinity / -Infinity', () => {
    expect(Number.isFinite(nextRating({ rating: Infinity, games: 0 }, FIRST_TRY).rating)).toBe(true)
    expect(Number.isFinite(nextRating({ rating: -Infinity, games: 0 }, SKIPPED).rating)).toBe(true)
  })

  it('falls back to 0 games when the stored games count is non-finite', () => {
    const next = nextRating({ rating: 4, games: NaN }, FIRST_TRY)
    // games treated as 0 -> incremented to 1, and the swing matches a fresh game.
    expect(next.games).toBe(1)
    expect(next.rating).toBeCloseTo(nextRating({ rating: 4, games: 0 }, FIRST_TRY).rating, 10)
  })

  it('does not mutate the input state', () => {
    const input: RatingState = { rating: 4, games: 0 }
    const snapshot = { ...input }
    nextRating(input, FIRST_TRY)
    expect(input).toEqual(snapshot)
  })

  it('keeps the rating finite and in-band across a long random walk', () => {
    let state: RatingState = { ...INITIAL_STATE }
    const outcomes = [FIRST_TRY, ONE_WRONG, TWO_WRONG, SKIPPED, UNSOLVED]
    for (let i = 0; i < 500; i++) {
      state = nextRating(state, outcomes[i % outcomes.length])
      expect(Number.isFinite(state.rating)).toBe(true)
      expect(state.rating).toBeGreaterThanOrEqual(1)
      expect(state.rating).toBeLessThanOrEqual(MAX_LEVEL)
      expect(Number.isInteger(state.games)).toBe(true)
    }
    expect(state.games).toBe(500)
  })
})
