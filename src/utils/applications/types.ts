/**
 * Types for the Applications tab — self-contained, real-world *word* problems.
 *
 * Each problem is plain text plus one or more answer fields. Problems are
 * regenerated with fresh numbers/themes so the learner rarely repeats one. On a
 * wrong answer the learner is shown `hint` (a nudge), never the full solution.
 *
 * This module is independent of the Lessons and Practice features.
 */

/** A single numeric answer, graded with a tolerance (π is allowed when set). */
export interface NumberField {
  kind: 'number'
  /** Label shown next to the input, e.g. "Average speed (mph)". */
  label: string
  /** The exact expected value. */
  expected: number
  /** Absolute tolerance; defaults to the grader's magnitude-relative tolerance. */
  tolerance?: number
  placeholder?: string
  /**
   * Plain-English description of WHAT this blank asks for, including its unit,
   * so an AI rewrite can keep the ask intact. Never contains the numeric answer
   * or math jargon.
   */
  meaning?: string
}

/**
 * A polynomial-in-x answer (e.g. a derivative). Graded by numeric sampling, so
 * any algebraically-equivalent form (factored or expanded) is accepted. The
 * grader only understands the variable `x`, so expression answers must be in x.
 */
export interface ExpressionField {
  kind: 'expression'
  label: string
  /** True coefficients, low-to-high (index = power), e.g. [5, 8, 3] = 3x² + 8x + 5. */
  trueCoefficients: number[]
  sampleXs?: number[]
  tolerance?: number
  placeholder?: string
  /**
   * When true, the answer is assembled with the polynomial playground calculator
   * (standard form only) instead of a free-text box. Grading is unchanged.
   */
  builder?: boolean
  /**
   * Plain-English description of WHAT this blank asks for, including its unit,
   * so an AI rewrite can keep the ask intact. Never contains the numeric answer
   * or math jargon.
   */
  meaning?: string
}

/** A multiple-choice numeric answer. */
export interface ChoiceField {
  kind: 'choice'
  label: string
  /** All options shown as buttons (already include the correct one). */
  options: number[]
  /** The single correct option (must be present in `options`). */
  correct: number
  /**
   * Plain-English description of WHAT this blank asks for, including its unit,
   * so an AI rewrite can keep the ask intact. Never contains the numeric answer
   * or math jargon.
   */
  meaning?: string
}

export type AppField = NumberField | ExpressionField | ChoiceField

export interface WordProblem {
  id: string
  topicId: string
  title: string
  /** The scenario the learner reads. Plain text; may name the function inline. */
  prompt: string
  /** Optional emphasized line, e.g. the function or data table. */
  given?: string
  /** One or more answer fields; ALL must be correct to solve the problem. */
  fields: AppField[]
  /** Shown after a wrong attempt — a nudge toward the method, NOT the answer. */
  hint: string
}

/** One Applications topic: a concept, regenerated with fresh numbers each call. */
export interface ApplicationTopicDef {
  /** Unique id across lessons, e.g. "a1-fastest". */
  id: string
  /** Short chip label, e.g. "Fastest rate". */
  label: string
  /** Build a fresh, self-contained, well-posed word problem. */
  generate: () => WordProblem
}

/** All Applications topics belonging to one lesson. */
export interface ApplicationLessonGroup {
  lessonId: string
  lessonTitle: string
  topics: ApplicationTopicDef[]
}
