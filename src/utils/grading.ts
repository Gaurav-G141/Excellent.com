import { evaluatePoly } from './polynomial'

/** True if `entered` is within `tolerance` of the expected value. */
export function isCloseTo(entered: number, expected: number, tolerance: number): boolean {
  return Math.abs(entered - expected) <= tolerance
}

/**
 * A point c satisfies the Mean Value Theorem on (lo, hi) when it lies strictly
 * inside the interval and f'(c) matches the secant slope. ANY such c is valid —
 * there can be several, so we must not anchor to a single scanned root.
 */
export function isValidMeanValuePoint(
  entered: number,
  derivativeCoefficients: number[],
  secantSlope: number,
  lo: number,
  hi: number,
  tolerance: number,
): boolean {
  if (!(entered > lo && entered < hi)) return false
  return isCloseTo(evaluatePoly(derivativeCoefficients, entered), secantSlope, tolerance)
}

/**
 * How many of the learner's selected x-values are NOT within `tolerance` of any
 * true critical point — used to tell them "{n} of your points are not critical
 * points".
 */
export function countNonCriticalSelections(
  selectedXs: number[],
  criticalXs: number[],
  tolerance: number,
): number {
  return selectedXs.filter((x) => !criticalXs.some((cx) => Math.abs(x - cx) <= tolerance)).length
}
