/**
 * AI "clarify" for a scenario's free-response question.
 *
 * Some FRQ wordings come out stiff or ambiguous after the difficulty rewrite.
 * The Applications card lets a learner ask for a clearer rewording of just that
 * one question. This reword must NOT change what is being asked, must not name a
 * math/calculus method, and must not reveal or hint at any answer.
 *
 * Like the other AI seams here, every failure path (AI off, timeout, malformed
 * or unsafe output) returns null so the caller simply keeps the original
 * wording. This never throws and is independent of the Lessons/Practice features.
 */

import { getJsonModel, Schema } from '../../lib/ai'
import { cleanText } from './madlib'
import { STORY_BAND_MIN, hasExtraJargon, hasHighBandGiveaway, numbersIn } from './levelPrompts'

/** Max time to wait on the model before giving up and keeping the original. */
const CLARIFY_TIMEOUT_MS = 8000
const NUM_EPS = 1e-9

/** JSON schema enforced on the model's clarified question. */
export const CLARIFY_SCHEMA = Schema.object({
  properties: { question: Schema.string() },
})

export interface ClarifyArgs {
  /** The current (resolved) question wording to make clearer. */
  question: string
  /** Optional scene context so the reword stays consistent (never restated). */
  scenarioTitle?: string
  scenarioPrompt?: string
  /** Concrete answer values that must never surface in the reworded question. */
  forbiddenNumbers?: number[]
  /** Served difficulty level, so a story-band reword can't reintroduce method words. */
  level?: number
}

/** Compose the clarify prompt. */
export function buildClarifyPrompt(args: ClarifyArgs): string {
  const context = `${args.scenarioTitle ?? ''} ${args.scenarioPrompt ?? ''}`.trim()
  return [
    'You reword ONE question so it reads more clearly and naturally, WITHOUT changing what it asks.',
    'RULES:',
    '- Keep the exact same thing being asked. Do not make it easier or harder, do not add or remove parts, and do not answer it.',
    '- Never reveal, compute, or hint at the answer, and do not introduce any new numbers.',
    '- Use plain, everyday English. NEVER name a math operation or calculus idea (for example: derivative, rate of change, slope, integral, velocity, acceleration, differentiate).',
    '- Keep it to one or two clear sentences that stay consistent with the situation.',
    ...(context ? ['', `SITUATION (for consistency only — do not restate it): ${context}`] : []),
    '',
    `QUESTION TO REWORD: ${args.question}`,
    '',
    'Return JSON: {"question": string}.',
  ].join('\n')
}

/**
 * Validate raw model output, returning the cleaned reworded question or null.
 * Rejects jargon and any answer-number that wasn't already in the original
 * question (so reusing a number the learner already saw is fine).
 */
export function validateClarify(raw: unknown, args: ClarifyArgs): string | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  const cleaned = cleanText(obj.question, 400)
  if (cleaned === null || hasExtraJargon(cleaned)) return null

  // In the story band the question must stay implied: reject a reword that
  // reintroduces an operation giveaway ("how fast", …) unless the original
  // question already used that phrasing.
  if (
    typeof args.level === 'number' &&
    args.level >= STORY_BAND_MIN &&
    hasHighBandGiveaway(cleaned) &&
    !hasHighBandGiveaway(args.question)
  ) {
    return null
  }

  const forbidden = args.forbiddenNumbers
  if (forbidden && forbidden.length > 0) {
    const allowed = numbersIn(args.question)
    const present = numbersIn(cleaned)
    for (const answer of forbidden) {
      const whitelisted = allowed.some((a) => Math.abs(a - answer) < NUM_EPS)
      if (whitelisted) continue
      if (present.some((p) => Math.abs(p - answer) < NUM_EPS)) return null
    }
  }

  return cleaned
}

/**
 * Ask the model for a clearer wording of `args.question`. Resolves to the new
 * wording, or null when AI is unavailable / errored / unsafe (caller keeps the
 * original). Never throws.
 */
export async function clarifyQuestion(args: ClarifyArgs): Promise<string | null> {
  const model = getJsonModel(CLARIFY_SCHEMA, { temperature: 0.3 })
  if (!model) return null

  try {
    const prompt = buildClarifyPrompt(args)
    let timer: ReturnType<typeof setTimeout> | undefined
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), CLARIFY_TIMEOUT_MS)
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer)
    })
    if (!result) return null

    const text = result.response.text()
    if (typeof text !== 'string' || text.trim().length === 0) return null

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return null
    }
    return validateClarify(parsed, args)
  } catch {
    return null
  }
}
