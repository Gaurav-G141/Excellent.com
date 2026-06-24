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
