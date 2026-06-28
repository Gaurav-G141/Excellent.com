/**
 * Types for the Applications tab's multi-step "scenario" problems.
 *
 * A scenario is a paper-box-style guided problem: a real-world prompt (with the
 * calculus hidden) plus an ordered list of steps revealed one at a time. The
 * first conceptual step is a free-response question graded by the AI; every other
 * step is a numeric, polynomial-calculator, or multiple-choice answer graded in
 * code (see scenarioGrade.ts). As with the single-shot WordProblem path, the math
 * is owned by code — the AI only ever restates the surface wording of the
 * title/prompt at a difficulty level (see scenarioRewrite.ts).
 *
 * Difficulty (1..15) interacts with the scaffold via `tier` + `visibleSteps`:
 *   - 'guide'    extra hand-holding step, shown only in the explicit band (<= 6),
 *   - 'core'     always shown,
 *   - 'scaffold' shown until the story band (hidden at >= 13), so the leanest,
 *                hardest version is just the concept + the final ask.
 */

import { IMPLIED_BAND_MIN, STORY_BAND_MIN, bandFor, type Band } from './levelPrompts'

export type { Band }

/** Which difficulty bands a step appears in. */
export type StepTier = 'guide' | 'core' | 'scaffold'

/**
 * A step prompt that can vary by difficulty band. A plain string is used at every
 * level; the object form lets a step read more leadingly at low levels and more
 * implicitly at the top, falling back to `base`.
 */
export type BandText = string | { base: string; explicit?: string; story?: string }

interface BaseStep {
  id: string
  tier: StepTier
  /** The question/instruction shown for this step (may vary by band). */
  prompt: BandText
  /** Progressive hints, shown on successive wrong attempts at this step. */
  hints?: string[]
}

/** A conceptual free-response step — the only kind graded by the AI. */
export interface FrqStep extends BaseStep {
  kind: 'frq'
  /** Plain-language description of what a correct answer must convey. */
  rubric: string
  /**
   * Local fallback for when the AI grader is unavailable. Each inner array is an
   * OR-group of keywords; the answer must contain at least one keyword from every
   * group (AND across groups). Omit for a length-only fallback.
   */
  fallbackKeywords?: string[][]
  /** Optional confirming line shown once this step is answered correctly. */
  idealAnswer?: string
}

/** A single numeric answer, graded with a tolerance (reuses matchesNumber). */
export interface NumberStep extends BaseStep {
  kind: 'number'
  expected: number
  tolerance?: number
  placeholder?: string
}

/** A polynomial-in-x answer, graded by sampling (reuses matchesPolynomial). */
export interface ExpressionStep extends BaseStep {
  kind: 'expression'
  /** True coefficients low-to-high (index = power). */
  trueCoefficients: number[]
  /** Assemble with the polynomial calculator instead of a text box. */
  builder?: boolean
  sampleXs?: number[]
  tolerance?: number
  placeholder?: string
}

/** A multiple-choice numeric answer. */
export interface ChoiceStep extends BaseStep {
  kind: 'choice'
  options: number[]
  correct: number
}

export type ScenarioStep = FrqStep | NumberStep | ExpressionStep | ChoiceStep

/** A complete multi-step scenario problem. */
export interface ScenarioProblem {
  id: string
  topicId: string
  title: string
  /** The scenario the learner reads; AI-rewritable. Ends with the overall ask. */
  prompt: string
  /** Optional formula block shown verbatim (never changed by the AI). */
  given?: string
  /** Ordered steps; filtered by difficulty via `visibleSteps`. */
  steps: ScenarioStep[]
  /** Optional closing explanation shown after every visible step is solved. */
  idealAnswer?: string
  /** Optional explicit sticker subject (parity with WordProblem theming). */
  stickerSubject?: string
  /**
   * Concrete nouns the code-authored steps refer to (e.g. ['beanbag']). The AI
   * rewrite may theme the surrounding setting around an interest but must keep
   * referring to these same things, so the main prompt and the steps never drift
   * apart (e.g. a "guitar pick" prompt over a "beanbag" step). Validation drops
   * any rewrite whose prompt no longer mentions every term.
   */
  subjectTerms?: string[]
}

/** One scenario topic: a concept regenerated with fresh numbers each call. */
export interface ScenarioTopicDef {
  id: string
  label: string
  generate: () => ScenarioProblem
}

/** All scenario topics belonging to one lesson (mirrors ApplicationLessonGroup). */
export interface ScenarioLessonGroup {
  lessonId: string
  lessonTitle: string
  topics: ScenarioTopicDef[]
}

/** Highest level at which 'guide' (beginner) steps still appear. */
export const GUIDE_MAX_LEVEL = IMPLIED_BAND_MIN - 1
/** Highest level at which 'scaffold' steps still appear (hidden in the story band). */
export const SCAFFOLD_MAX_LEVEL = STORY_BAND_MIN - 1

/**
 * The steps visible at `level`: 'core' always, 'scaffold' below the story band,
 * 'guide' only in the explicit band. Beginners get extra hand-holding; the top
 * band collapses to just the concept + final ask.
 */
export function visibleSteps(steps: ScenarioStep[], level: number): ScenarioStep[] {
  return steps.filter((step) => {
    if (step.tier === 'core') return true
    if (step.tier === 'scaffold') return level <= SCAFFOLD_MAX_LEVEL
    return level <= GUIDE_MAX_LEVEL
  })
}

/** Resolve a possibly band-varying step prompt to the wording for `level`. */
export function resolveStepPrompt(prompt: BandText, level: number): string {
  if (typeof prompt === 'string') return prompt
  const band = bandFor(level)
  if (band === 'story' && prompt.story) return prompt.story
  if (band === 'explicit' && prompt.explicit) return prompt.explicit
  return prompt.base
}
