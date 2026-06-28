/**
 * Grading for multi-step scenario problems.
 *
 * Only FRQ steps are graded by the AI (see gradeFreeResponse). Every other step
 * is graded here in code, reusing the same numeric/polynomial graders the rest of
 * the Applications tab relies on so behavior stays consistent.
 */

import { matchesNumber, matchesPolynomial } from '../expression'
import { bandFor } from './levelPrompts'
import type { FrqStep, ScenarioStep } from './scenarioTypes'

/** How demanding FRQ grading is. Mirrors the AI grader's GradeRigor. */
export type FrqRigor = 'lenient' | 'standard' | 'strict'

/** Map a served difficulty level to a grading strictness. */
export function rigorForLevel(level: number): FrqRigor {
  const band = bandFor(level)
  if (band === 'explicit') return 'lenient'
  if (band === 'story') return 'strict'
  return 'standard'
}

/**
 * Phrases that show a learner is reasoning about a rate of change with respect to
 * time, required for a strict (high-difficulty) free-response pass on the local
 * fallback path.
 */
const RATE_TERMS = [
  'rate',
  'per second',
  'per minute',
  'per hour',
  'per day',
  'per unit',
  'with respect to time',
  'relative to time',
  'over time',
  'derivative',
  'slope',
  'd/dt',
  'dh/dt',
]

/**
 * Grade a code-checkable step (number / expression / choice) against the raw
 * input. FRQ steps always return false here — they are graded by the AI.
 */
export function gradeCodeStep(step: ScenarioStep, raw: string): boolean {
  const value = raw.trim()
  if (value === '') return false

  switch (step.kind) {
    case 'number':
      return matchesNumber(value, step.expected, step.tolerance)
    case 'expression':
      return matchesPolynomial(value, step.trueCoefficients, {
        sampleXs: step.sampleXs,
        tolerance: step.tolerance,
      })
    case 'choice': {
      const got = Number.parseFloat(value)
      return Number.isFinite(got) && got === step.correct
    }
    case 'frq':
      return false
  }
}

/**
 * Local fallback grader for a free-response step, used only when the AI grader is
 * unavailable. Requires a minimum length, and — when `fallbackKeywords` is given —
 * at least one keyword from every OR-group (AND across groups). At `strict` rigor
 * (high difficulty) it additionally requires the answer to reference a rate of
 * change over time, so an informal restatement no longer passes.
 */
export function heuristicGradeFrq(
  step: FrqStep,
  answer: string,
  rigor: FrqRigor = 'standard',
): boolean {
  const trimmed = answer.trim()
  if (trimmed.length < 12) return false

  const lower = trimmed.toLowerCase()
  const groups = step.fallbackKeywords
  const baseOk =
    !groups || groups.length === 0
      ? trimmed.length >= 20
      : groups.every((group) => group.some((kw) => lower.includes(kw.toLowerCase())))
  if (!baseOk) return false

  if (rigor === 'strict') return RATE_TERMS.some((term) => lower.includes(term))
  return true
}
