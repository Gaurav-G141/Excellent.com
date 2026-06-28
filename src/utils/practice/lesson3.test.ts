import { describe, expect, it } from 'vitest'
import { lesson3Practice } from './lesson3'
import { evaluatePoly } from '../polynomial'
import type { IvtProblemConfig } from '../../types/lesson'

const ivtTopic = lesson3Practice.topics.find((t) => t.id === 'l3-ivt')

describe('lesson3Practice IVT', () => {
  it('targets the related-rates lesson and exposes the IVT topic', () => {
    expect(lesson3Practice.lessonId).toBe('related-rates')
    expect(ivtTopic).toBeDefined()
  })

  it('generates endpoints-only IVT problems (no equation, curve hidden) with valid math', () => {
    if (!ivtTopic) throw new Error('missing l3-ivt topic')

    for (let i = 0; i < 200; i++) {
      const slide = ivtTopic.generate()
      expect(slide.component).toBe('ivtProblem')

      const config = slide.config as unknown as IvtProblemConfig

      // No visible equation is sent to the learner.
      expect(config.functionDisplay ?? '').toBe('')
      // The curve must be hidden so it can't reveal a misleading crossing.
      expect(config.hideCurve).toBe(true)
      // Copy must not reference "the given equation".
      expect(slide.body.toLowerCase()).not.toContain('equation')

      // Math invariants: guaranteed strictly interior, distractors strictly outside.
      const fa = evaluatePoly(config.coefficients, config.ax)
      const fb = evaluatePoly(config.coefficients, config.bx)
      const lo = Math.min(fa, fb)
      const hi = Math.max(fa, fb)

      expect(config.guaranteedValue).toBeGreaterThan(lo)
      expect(config.guaranteedValue).toBeLessThan(hi)

      for (const d of config.distractors) {
        expect(d < lo || d > hi).toBe(true)
      }

      // All three option values are distinct.
      const all = [config.guaranteedValue, ...config.distractors]
      expect(new Set(all).size).toBe(all.length)
    }
  })
})
