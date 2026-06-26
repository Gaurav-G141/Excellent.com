import { describe, it, expect } from 'vitest'
import { APPLICATION_LESSONS } from './index'
import { gradeField, gradeProblem } from './grade'
import type { AppField, WordProblem } from './types'

const ITERATIONS = 300

/** Author-facing calculus jargon that must never leak to the learner. */
const FORBIDDEN_PHRASES = [
  'derivative',
  'mean value theorem',
  'intermediate value theorem',
  'second derivative',
  'critical point',
  'secant',
  'tangent',
  'power rule',
  'chain rule',
  'sum rule',
  'related rates',
]

/** Build a guaranteed-correct expression STRING from low-to-high coefficients. */
function coeffsToExpr(coeffs: number[]): string {
  const terms = coeffs.map((c, p) => `(${c})*x^${p}`)
  return terms.length ? terms.join('+') : '0'
}

/** Canonical correct answer string for a single field. */
function canonicalAnswer(field: AppField): string {
  switch (field.kind) {
    case 'number':
      return String(field.expected)
    case 'expression':
      return coeffsToExpr(field.trueCoefficients)
    case 'choice':
      return String(field.correct)
  }
}

/** A definitely-wrong answer string for a single field (or null to skip). */
function wrongAnswer(field: AppField): string | null {
  switch (field.kind) {
    case 'number':
      return String(field.expected + 1000)
    case 'expression': {
      if (field.trueCoefficients.length === 0) return '5'
      const wrong = [...field.trueCoefficients]
      wrong[0] += 5
      return coeffsToExpr(wrong)
    }
    case 'choice': {
      const other = field.options.find((o) => o !== field.correct)
      return other === undefined ? null : String(other)
    }
  }
}

/** Lowercased text the learner actually reads, for jargon-leak checks. */
function learnerVisibleText(problem: WordProblem): string {
  const labels = problem.fields.map((f) => f.label).join(' ')
  return `${problem.prompt} ${problem.given ?? ''} ${labels}`.toLowerCase()
}

describe('Applications: lesson structure', () => {
  it('has exactly 4 lessons with the expected ids in order', () => {
    expect(APPLICATION_LESSONS.length).toBe(4)
    expect(APPLICATION_LESSONS.map((g) => g.lessonId)).toEqual([
      'derivatives-basics',
      'derivative-rules',
      'related-rates',
      'exponents-product-rule',
    ])
  })

  it('has globally-unique topic ids across all lessons', () => {
    const ids = APPLICATION_LESSONS.flatMap((g) => g.topics.map((t) => t.id))
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

for (const group of APPLICATION_LESSONS) {
  for (const topic of group.topics) {
    describe(`Applications: ${group.lessonId} / ${topic.id}`, () => {
      it(`${topic.id} generates self-consistent, in-scope problems`, () => {
        for (let iter = 0; iter < ITERATIONS; iter++) {
          const problem = topic.generate()
          const where = `${topic.id} iter#${iter}`

          // 1. Structure
          expect(problem.fields.length, `${where}: fields.length`).toBeGreaterThanOrEqual(1)
          expect(problem.topicId, `${where}: topicId`).toBe(topic.id)
          for (const key of ['id', 'title', 'prompt', 'hint'] as const) {
            expect(typeof problem[key], `${where}: ${key} is string`).toBe('string')
            expect((problem[key] as string).length, `${where}: ${key} non-empty`).toBeGreaterThan(0)
          }

          // 5/6/4. Per-field validity
          for (let fi = 0; fi < problem.fields.length; fi++) {
            const field = problem.fields[fi]
            const fieldWhere = `${where} field#${fi} (${field.kind})`
            if (field.kind === 'expression') {
              expect(
                field.trueCoefficients.length,
                `${fieldWhere}: trueCoefficients non-empty`,
              ).toBeGreaterThanOrEqual(1)
              for (const c of field.trueCoefficients) {
                expect(Number.isFinite(c), `${fieldWhere}: coefficient ${c} finite`).toBe(true)
              }
            } else if (field.kind === 'number') {
              expect(Number.isFinite(field.expected), `${fieldWhere}: expected finite`).toBe(true)
            } else {
              expect(field.options.includes(field.correct), `${fieldWhere}: options include correct`).toBe(true)
              expect(field.options.length, `${fieldWhere}: >= 2 options`).toBeGreaterThanOrEqual(2)
              expect(
                new Set(field.options).size,
                `${fieldWhere}: options have no duplicates`,
              ).toBe(field.options.length)
            }
          }

          // 2. Self-consistency: the stated answer grades as correct.
          const canonical = problem.fields.map(canonicalAnswer)
          expect(
            gradeProblem(problem.fields, canonical),
            `${where}: canonical answers should grade correct (fields=${JSON.stringify(
              problem.fields,
            )}, answers=${JSON.stringify(canonical)})`,
          ).toBe(true)

          // 3. Discrimination: a wrong answer per field grades as incorrect.
          for (let fi = 0; fi < problem.fields.length; fi++) {
            const field = problem.fields[fi]
            const wrong = wrongAnswer(field)
            if (wrong === null) continue
            expect(
              gradeField(field, wrong),
              `${where} field#${fi} (${field.kind}): wrong answer "${wrong}" should grade incorrect (field=${JSON.stringify(
                field,
              )})`,
            ).toBe(false)
          }

          // 7. Non-obvious phrasing (no author-facing jargon).
          const text = learnerVisibleText(problem)
          for (const phrase of FORBIDDEN_PHRASES) {
            expect(
              text.includes(phrase),
              `${where}: learner-visible text leaked forbidden phrase "${phrase}" -> ${text}`,
            ).toBe(false)
          }
        }
      })
    })
  }
}
