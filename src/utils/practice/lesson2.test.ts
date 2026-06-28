import { describe, it, expect } from 'vitest'
import { lesson2Practice } from './lesson2'
import { derivativeCoefficients, evaluatePoly } from '../polynomial'
import { isValidMeanValuePoint } from '../grading'
import type { MvtMultiPartConfig } from '../../types/lesson'

const mvtTopic = lesson2Practice.topics.find((t) => t.id === 'l2-mvt')

/** Scan (lo, hi) for an interior x where f'(x) is within tolerance of the slope. */
function hasInteriorMeanValuePoint(
  derivative: number[],
  secantSlope: number,
  lo: number,
  hi: number,
  tolerance: number,
): boolean {
  const step = (hi - lo) / 2000
  for (let x = lo + step; x < hi; x += step) {
    if (isValidMeanValuePoint(x, derivative, secantSlope, lo, hi, tolerance)) return true
  }
  return false
}

describe('generateMvt', () => {
  it('exposes the MVT topic generator', () => {
    expect(mvtTopic).toBeDefined()
  })

  it('always yields an interior c and never an endpoint that satisfies f′=S', () => {
    for (let run = 0; run < 300; run++) {
      const slide = mvtTopic!.generate()
      const config = slide.config as unknown as MvtMultiPartConfig
      const { coefficients, ax, bx, derivativeTolerance = 0.12 } = config

      const lo = Math.min(ax, bx)
      const hi = Math.max(ax, bx)
      const derivative = derivativeCoefficients(coefficients)
      const secantSlope =
        (evaluatePoly(coefficients, hi) - evaluatePoly(coefficients, lo)) / (hi - lo)

      // (a) at least one valid c strictly inside (lo, hi)
      expect(hasInteriorMeanValuePoint(derivative, secantSlope, lo, hi, derivativeTolerance)).toBe(
        true,
      )

      // (b) NEITHER endpoint satisfies f'=S within the grading tolerance
      expect(Math.abs(evaluatePoly(derivative, lo) - secantSlope)).toBeGreaterThan(
        derivativeTolerance,
      )
      expect(Math.abs(evaluatePoly(derivative, hi) - secantSlope)).toBeGreaterThan(
        derivativeTolerance,
      )
    }
  })
})
