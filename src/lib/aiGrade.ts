/**
 * AI grading for short free-response answers in lessons.
 *
 * Uses the shared OpenAI wiring (`getJsonModel`). The model returns a string
 * `verdict` ("correct" / "incorrect") plus one or two sentences of feedback —
 * the JSON-schema builder only supports strings, so we avoid a boolean here.
 *
 * Every path degrades gracefully: if AI is not configured, or the request
 * fails, or the output can't be parsed, this returns `null` so the caller can
 * fall back to a local keyword heuristic. It never blocks the learner.
 */
import { getJsonModel, Schema } from './ai'

export interface FreeResponseVerdict {
  correct: boolean
  feedback: string
}

/**
 * How demanding the grader should be. `standard` (the default) preserves the
 * original lenient "grade for the idea" behavior used by lessons; `lenient`
 * accepts even very informal beginner phrasing; `strict` requires a precise,
 * complete articulation (e.g. naming the underlying rate of change) and is used
 * by the Applications tab at high difficulty.
 */
export type GradeRigor = 'lenient' | 'standard' | 'strict'

export interface GradeFreeResponseArgs {
  /** The question the learner is answering. */
  question: string
  /** Plain-language description of what a correct answer must convey. */
  rubric: string
  /** The learner's raw answer text. */
  answer: string
  /** Grading strictness; omitted/`standard` keeps the original behavior. */
  rigor?: GradeRigor
}

/**
 * Ask the model to grade a free-response answer. Resolves to a verdict, or
 * `null` when AI is unavailable / errored (caller should fall back locally).
 */
export async function gradeFreeResponse({
  question,
  rubric,
  answer,
  rigor,
}: GradeFreeResponseArgs): Promise<FreeResponseVerdict | null> {
  const schema = Schema.object({
    properties: { verdict: Schema.string(), feedback: Schema.string() },
  })
  // Grading wants a steady, reproducible verdict, not creative variety, so run
  // the model cold rather than at the default high (scene-generation) temperature.
  const model = getJsonModel(schema, { temperature: 0.2 })
  if (!model) return null

  // `standard`/undefined keeps the original wording verbatim (lessons rely on it).
  const ideaLine =
    rigor === 'strict'
      ? 'Grade for the IDEA and whether it is framed correctly — not for completeness of every detail or exact notation.'
      : 'Grade for the IDEA, not exact wording or notation. Informal phrasing is fine.'
  const rigorLine =
    rigor === 'lenient'
      ? 'The learner is a beginner: accept the core idea even when phrased very informally or in everyday words, as long as they capture the essential point.'
      : rigor === 'strict'
        ? 'The learner is advanced, so weigh precision over a vague gist. Accept the answer if it correctly identifies the key relationship AND frames it in terms of how the quantity is changing (its rate of change / derivative), in either everyday or technical language. Do NOT require exact numbers, constants, a full formula, or every detail in the rubric. Mark it incorrect ONLY if it is vague or hand-wavy, or never connects to how the quantity changes (e.g. it merely restates the surface situation without addressing the rate of change).'
        : ''
  const verdictLine =
    rigor === 'strict'
      ? '- "verdict": exactly "correct" if the answer correctly identifies the relationship and frames it in terms of how the quantity is changing (its rate of change), otherwise "incorrect".'
      : '- "verdict": exactly "correct" if the student captures the key idea, otherwise "incorrect".'

  const prompt = [
    'You are a friendly, encouraging calculus tutor grading a short free-response answer.',
    ideaLine,
    ...(rigorLine ? [rigorLine] : []),
    '',
    `Question: ${question}`,
    `A correct answer should convey: ${rubric}`,
    `Student answer: """${answer}"""`,
    '',
    'Reply as JSON with:',
    verdictLine,
    '- "feedback": one or two short, warm sentences. If incorrect, nudge toward the idea WITHOUT stating the full answer.',
  ].join('\n')

  try {
    const result = await model.generateContent(prompt)
    const parsed = JSON.parse(result.response.text()) as {
      verdict?: string
      feedback?: string
    }
    const verdict = (parsed.verdict ?? '').trim().toLowerCase()
    return {
      correct: verdict.startsWith('correct'),
      feedback: parsed.feedback?.trim() || '',
    }
  } catch {
    return null
  }
}
