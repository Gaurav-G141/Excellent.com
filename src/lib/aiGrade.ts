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

export interface GradeFreeResponseArgs {
  /** The question the learner is answering. */
  question: string
  /** Plain-language description of what a correct answer must convey. */
  rubric: string
  /** The learner's raw answer text. */
  answer: string
}

/**
 * Ask the model to grade a free-response answer. Resolves to a verdict, or
 * `null` when AI is unavailable / errored (caller should fall back locally).
 */
export async function gradeFreeResponse({
  question,
  rubric,
  answer,
}: GradeFreeResponseArgs): Promise<FreeResponseVerdict | null> {
  const schema = Schema.object({
    properties: { verdict: Schema.string(), feedback: Schema.string() },
  })
  const model = getJsonModel(schema)
  if (!model) return null

  const prompt = [
    'You are a friendly, encouraging calculus tutor grading a short free-response answer.',
    'Grade for the IDEA, not exact wording or notation. Informal phrasing is fine.',
    '',
    `Question: ${question}`,
    `A correct answer should convey: ${rubric}`,
    `Student answer: """${answer}"""`,
    '',
    'Reply as JSON with:',
    '- "verdict": exactly "correct" if the student captures the key idea, otherwise "incorrect".',
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
