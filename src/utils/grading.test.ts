import { describe, it, expect } from 'vitest'
import { isCloseTo, isValidMeanValuePoint } from './grading'
import { derivativeCoefficients } from './polynomial'

describe('isCloseTo', () => {
  it('respects the tolerance band', () => {
    expect(isCloseTo(1.05, 1, 0.1)).toBe(true)
    expect(isCloseTo(1.2, 1, 0.1)).toBe(false)
  })
})

describe('isValidMeanValuePoint', () => {
  // f(x) = x^3 - 3x  on [-2, 2].  secant slope = 1.
  // f'(x) = 3x^2 - 3 = 1  =>  c = +/- 1.1547, BOTH valid in (-2, 2).
  const coefficients = [0, -3, 0, 1]
  const derivative = derivativeCoefficients(coefficients) // [-3, 0, 3]
  const secantSlope = 1
  const lo = -2
  const hi = 2
  const tol = 0.05

  it('accepts the first mean-value point', () => {
    expect(isValidMeanValuePoint(-1.1547, derivative, secantSlope, lo, hi, tol)).toBe(true)
  })

  it('accepts the SECOND valid mean-value point (regression for over-strict grading)', () => {
    expect(isValidMeanValuePoint(1.1547, derivative, secantSlope, lo, hi, tol)).toBe(true)
  })

  it('rejects points outside the open interval', () => {
    expect(isValidMeanValuePoint(-2, derivative, secantSlope, lo, hi, tol)).toBe(false)
    expect(isValidMeanValuePoint(2, derivative, secantSlope, lo, hi, tol)).toBe(false)
    expect(isValidMeanValuePoint(3, derivative, secantSlope, lo, hi, tol)).toBe(false)
  })

  it('rejects an interior point whose slope does not match', () => {
    expect(isValidMeanValuePoint(0, derivative, secantSlope, lo, hi, tol)).toBe(false)
  })
})
