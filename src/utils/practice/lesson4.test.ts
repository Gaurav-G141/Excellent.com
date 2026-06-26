import { describe, expect, it } from 'vitest'
import { lesson4Practice } from './lesson4'

const ALLOWED_COMPONENTS = new Set([
  'exponentialTriangleQuestion',
  'multipleChoice',
  'productRuleMultiPart',
  'typeInDerivative',
])

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

describe('lesson4Practice', () => {
  it('targets the exponents-product-rule lesson', () => {
    expect(lesson4Practice.lessonId).toBe('exponents-product-rule')
    expect(lesson4Practice.lessonTitle).toBe('Exponents & the Product Rule')
    expect(lesson4Practice.topics.length).toBeGreaterThan(0)
  })

  for (const topic of [
    { id: 'l4-exp-slope' },
    { id: 'l4-ln-slope' },
    { id: 'l4-npower' },
    { id: 'l4-product' },
    { id: 'l4-product-expand' },
  ]) {
    it(`${topic.id} is registered`, () => {
      expect(lesson4Practice.topics.some((t) => t.id === topic.id)).toBe(true)
    })
  }

  for (const topic of lesson4Practice.topics) {
    describe(`${topic.id}`, () => {
      it('produces well-formed problems across many generations', () => {
        const seenIds = new Set<string>()

        for (let i = 0; i < 50; i++) {
          const slide = topic.generate()

          expect(slide.type).toBe('problem')
          expect(ALLOWED_COMPONENTS.has(slide.component)).toBe(true)

          expect(typeof slide.id).toBe('string')
          expect(slide.id.length).toBeGreaterThan(0)
          expect(seenIds.has(slide.id)).toBe(false)
          seenIds.add(slide.id)

          const config = slide.config as Record<string, unknown>

          if (slide.component === 'exponentialTriangleQuestion') {
            expect(isNumber(config.initialX)).toBe(true)
            expect(['exp', 'ln']).toContain(config.variant)
            const vp = config.viewport as Record<string, unknown>
            expect(isNumber(vp.xMin)).toBe(true)
            expect(isNumber(vp.xMax)).toBe(true)
            expect(isNumber(vp.yMin)).toBe(true)
            expect(isNumber(vp.yMax)).toBe(true)
            if (config.variant === 'ln') {
              // initialX in [2,5] so the point sits in the plot and 1/x is clean.
              expect(config.initialX).toBeGreaterThanOrEqual(2)
              expect(config.initialX).toBeLessThanOrEqual(5)
            }
          } else if (slide.component === 'multipleChoice') {
            const options = config.options as unknown[]
            expect(Array.isArray(options)).toBe(true)
            expect(options.length).toBeGreaterThanOrEqual(3)
            expect(options.every((o) => typeof o === 'string' && o.length > 0)).toBe(true)
            const idx = config.correctIndex as number
            expect(Number.isInteger(idx)).toBe(true)
            expect(idx).toBeGreaterThanOrEqual(0)
            expect(idx).toBeLessThan(options.length)
            const correct = options[idx] as string
            // The correct option is always the ln(base)·baseˣ form.
            expect(correct.startsWith('ln(')).toBe(true)
          } else if (slide.component === 'productRuleMultiPart') {
            const u = config.u as unknown[]
            const v = config.v as unknown[]
            expect(Array.isArray(u)).toBe(true)
            expect(Array.isArray(v)).toBe(true)
            expect(u.length).toBeGreaterThan(0)
            expect(v.length).toBeGreaterThan(0)
            expect(u.every(isNumber)).toBe(true)
            expect(v.every(isNumber)).toBe(true)
            // Nonzero leading terms.
            expect(u[u.length - 1]).not.toBe(0)
            expect(v[v.length - 1]).not.toBe(0)
          } else if (slide.component === 'typeInDerivative') {
            const coefficients = config.coefficients as unknown[]
            expect(Array.isArray(coefficients)).toBe(true)
            expect(coefficients.length).toBeGreaterThan(0)
            expect(coefficients.every(isNumber)).toBe(true)
            expect(typeof config.display).toBe('string')
            expect((config.display as string).length).toBeGreaterThan(0)
          }

          expect(slide.attempts).toBe('unlimited')
          expect(slide.feedback.correct).toBe('')
          expect(typeof slide.feedback.wrong).toBe('string')
          expect((slide.feedback.wrong as string).length).toBeGreaterThan(0)
        }
      })
    })
  }
})
