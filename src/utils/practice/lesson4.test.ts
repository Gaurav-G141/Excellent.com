import { describe, expect, it } from 'vitest'
import { lesson4Practice } from './lesson4'

const ALLOWED_COMPONENTS = new Set([
  'exponentialTriangleQuestion',
  'multipleChoice',
  'productRuleMultiPart',
  'typeInDerivative',
])

const MC_TOPICS = new Set(['l4-exp-chain', 'l4-log-chain'])

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

describe('lesson4Practice', () => {
  it('targets the exponents-product-rule lesson', () => {
    expect(lesson4Practice.lessonId).toBe('exponents-product-rule')
    expect(lesson4Practice.lessonTitle).toBe('Exponents & the Product Rule')
    expect(lesson4Practice.topics.length).toBeGreaterThan(0)
  })

  it('has exactly the expected topic ids in order', () => {
    expect(lesson4Practice.topics.map((t) => t.id)).toEqual([
      'l4-exp-slope',
      'l4-ln-slope',
      'l4-exp-chain',
      'l4-log-chain',
      'l4-product',
      'l4-product-expand',
    ])
  })

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
              expect(config.initialX).toBeGreaterThanOrEqual(2)
              expect(config.initialX).toBeLessThanOrEqual(5)
            }
          } else if (slide.component === 'multipleChoice') {
            const options = config.options as unknown[]
            expect(Array.isArray(options)).toBe(true)
            expect(options.length).toBeGreaterThanOrEqual(4)
            expect(options.every((o) => typeof o === 'string' && (o as string).length > 0)).toBe(
              true,
            )
            // All options must be DISTINCT.
            expect(new Set(options as string[]).size).toBe(options.length)

            const idx = config.correctIndex as number
            expect(Number.isInteger(idx)).toBe(true)
            expect(idx).toBeGreaterThanOrEqual(0)
            expect(idx).toBeLessThan(options.length)

            const correct = (options as string[])[idx]
            // The string at correctIndex is the intended correct derivative.
            if (topic.id === 'l4-exp-chain') {
              // Either e^(…) with a chain factor, or numeric base with ln(b).
              expect(correct).toMatch(/\^\(/)
              const isEuler = correct.includes('e^(')
              const isNumeric = /\bln\(\d+\)/.test(correct) && /\d+\^\(/.test(correct)
              expect(isEuler || isNumeric).toBe(true)
              // Correct answer always carries the chain factor "(g')·".
              expect(correct.startsWith('(')).toBe(true)
            } else if (topic.id === 'l4-log-chain') {
              // Correct log derivative is a quotient g'/g.
              expect(correct).toMatch(/^\(.*\)\/\(.*\)$/)
            }
          } else if (slide.component === 'productRuleMultiPart') {
            const u = config.u as unknown[]
            const v = config.v as unknown[]
            expect(Array.isArray(u)).toBe(true)
            expect(Array.isArray(v)).toBe(true)
            expect(u.length).toBeGreaterThan(0)
            expect(v.length).toBeGreaterThan(0)
            expect(u.every(isNumber)).toBe(true)
            expect(v.every(isNumber)).toBe(true)
            expect(u[u.length - 1]).not.toBe(0)
            expect(v[v.length - 1]).not.toBe(0)
          } else if (slide.component === 'typeInDerivative') {
            const coefficients = config.coefficients as unknown[]
            expect(Array.isArray(coefficients)).toBe(true)
            expect(coefficients.length).toBeGreaterThan(0)
            expect(coefficients.every(isNumber)).toBe(true)
            const display = config.display as string
            expect(typeof display).toBe('string')
            expect(display.length).toBeGreaterThan(0)
            // l4-product-expand shows the FACTORED product form.
            if (topic.id === 'l4-product-expand') {
              expect(display).toContain('(')
              expect(display).toContain(')')
            }
          }

          expect(slide.attempts).toBe('unlimited')
          expect(slide.feedback.correct).toBe('')
          expect(typeof slide.feedback.wrong).toBe('string')
          expect((slide.feedback.wrong as string).length).toBeGreaterThan(0)
        }
      })

      if (MC_TOPICS.has(topic.id)) {
        it('multiple-choice options are strings, distinct, and correctIndex is valid', () => {
          for (let i = 0; i < 50; i++) {
            const slide = topic.generate()
            expect(slide.component).toBe('multipleChoice')
            const config = slide.config as Record<string, unknown>
            const options = config.options as string[]

            expect(Array.isArray(options)).toBe(true)
            expect(options.length).toBeGreaterThanOrEqual(4)
            expect(options.every((o) => typeof o === 'string' && o.length > 0)).toBe(true)
            expect(new Set(options).size).toBe(options.length)

            const idx = config.correctIndex as number
            expect(Number.isInteger(idx)).toBe(true)
            expect(idx).toBeGreaterThanOrEqual(0)
            expect(idx).toBeLessThan(options.length)
          }
        })
      }
    })
  }
})
