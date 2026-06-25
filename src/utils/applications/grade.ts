/**
 * Grading for Applications word problems. Reuses the same answer graders the
 * rest of the app relies on (numeric tolerance + polynomial sampling) so typed
 * answers behave consistently, while keeping this feature self-contained.
 */
import { matchesNumber, matchesPolynomial } from '../expression'
import type { AppField } from './types'

/** Grade a single answer field against the learner's raw input. */
export function gradeField(field: AppField, raw: string): boolean {
  const value = raw.trim()
  if (value === '') return false

  switch (field.kind) {
    case 'number':
      return matchesNumber(value, field.expected, field.tolerance)
    case 'expression':
      return matchesPolynomial(value, field.trueCoefficients, {
        sampleXs: field.sampleXs,
        tolerance: field.tolerance,
      })
    case 'choice': {
      const got = Number.parseFloat(value)
      return Number.isFinite(got) && got === field.correct
    }
  }
}

/** True only when every field in the problem is answered correctly. */
export function gradeProblem(fields: AppField[], answers: string[]): boolean {
  return fields.every((field, index) => gradeField(field, answers[index] ?? ''))
}
