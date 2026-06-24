import { describe, it, expect } from 'vitest'
import {
  generateEndingQuestions,
  generateLesson3Questions,
} from './generateQuestion'
import { evaluateDerivative, evaluateSecondDerivative } from './polynomial'
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
