import { describe, it, expect } from 'vitest'
import {
  generateEndingQuestions,
  generateLesson3Questions,
  generatePracticeProblem,
} from './generateQuestion'
import { evaluateDerivative, evaluatePoly, evaluateSecondDerivative } from './polynomial'
import type { RelatedRatesProblemConfig } from '../types/lesson'

describe('generateEndingQuestions', () => {
  it('returns the requested number of distinct question kinds', () => {
    const questions = generateEndingQuestions(4, 1)
    expect(questions).toHaveLength(4)
    const components = new Set(questions.map((q) => q.component))
    expect(components.size).toBe(4)
  })

  it('is reproducible for the same seed [resume regression]', () => {
    const a = generateEndingQuestions(3, 42)
    const b = generateEndingQuestions(3, 42)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('differs across seeds', () => {
    const a = generateEndingQuestions(3, 1)
    const b = generateEndingQuestions(3, 999)
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b))
  })

  it('generateCritical embeds two genuine critical points (f\u2032 \u2248 0)', () => {
    // Force the critical kind by scanning seeds until present.
    let critical: ReturnType<typeof generateEndingQuestions>[number] | undefined
    for (let seed = 0; seed < 50 && !critical; seed++) {
      critical = generateEndingQuestions(4, seed).find(
        (q) => q.component === 'derivativeCriticalPoints',
      )
    }
    expect(critical).toBeDefined()
    const config = critical!.config as { coefficients: number[]; criticalPoints: { x: number }[] }
    for (const point of config.criticalPoints) {
      expect(Math.abs(evaluateDerivative(config.coefficients, point.x))).toBeLessThan(0.05)
    }
  })
})

describe('estimate-the-derivative problems have a faithful secant', () => {
  const secantSlope = (coefficients: number[], a: number, b: number) =>
    (evaluatePoly(coefficients, b) - evaluatePoly(coefficients, a)) / (b - a)

  it('zoom problems: |secant slope - true derivative| <= 0.1 and the secant is near a 0.1-step value', () => {
    for (let i = 0; i < 200; i++) {
      const q = generatePracticeProblem('zoom')
      const cfg = q.config as unknown as {
        coefficients: number[]
        targetX: number
        referenceX: number
        tolerance: number
      }
      const secant = secantSlope(cfg.coefficients, cfg.targetX, cfg.referenceX)
      const trueDeriv = evaluateDerivative(cfg.coefficients, cfg.targetX)
      expect(Math.abs(secant - trueDeriv)).toBeLessThanOrEqual(0.1 + 1e-9)

      // The secant slope is enterable: it sits within tolerance of a 0.1-step value.
      const nearestNice = Math.round(secant * 10) / 10
      expect(Math.abs(secant - nearestNice)).toBeLessThanOrEqual(cfg.tolerance + 1e-9)
    }
  })

  it('tangent problems: secant at the coincident threshold is within 0.1 of the true derivative', () => {
    for (let i = 0; i < 200; i++) {
      const q = generatePracticeProblem('tangent')
      const cfg = q.config as unknown as {
        coefficients: number[]
        targetX: number
        coincidentThreshold: number
        tolerance: number
      }
      // Worst-case graded position: P sits at the edge of the "close enough" band.
      const secant = secantSlope(
        cfg.coefficients,
        cfg.targetX,
        cfg.targetX + cfg.coincidentThreshold,
      )
      const trueDeriv = evaluateDerivative(cfg.coefficients, cfg.targetX)
      expect(Math.abs(secant - trueDeriv)).toBeLessThanOrEqual(0.1 + 1e-9)
      expect(Math.abs(secant - trueDeriv)).toBeLessThanOrEqual(cfg.tolerance + 1e-9)
    }
  })
})

describe('generateLesson3Questions', () => {
  it('is reproducible for the same seed, including the related-rates problem', () => {
    const a = generateLesson3Questions(2, 7)
    const b = generateLesson3Questions(2, 7)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('builds a related-rates problem with a consistent exact answer', () => {
    const [related] = generateLesson3Questions(2, 7)
    expect(related.component).toBe('relatedRates')
    const { problem } = related.config as unknown as RelatedRatesProblemConfig
    expect(problem.exact).toBeGreaterThan(0)
    expect(['sphere', 'square', 'cube']).toContain(problem.shape)
  })

  it('kinematics question has a well-defined acceleration at t0', () => {
    const questions = generateLesson3Questions(2, 7)
    const kinematics = questions.find((q) => q.component === 'secondDerivative')
    expect(kinematics).toBeDefined()
    const config = kinematics!.config as { coefficients: number[]; t0: number }
    expect(Number.isFinite(evaluateSecondDerivative(config.coefficients, config.t0))).toBe(true)
  })
})
