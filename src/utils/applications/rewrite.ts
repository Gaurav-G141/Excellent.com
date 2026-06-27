/**
 * Runtime that rewrites an Applications word problem to a target difficulty
 * level using the AI model, with hard fallbacks.
 *
 * The AI only restates learner-facing text (title, prompt, field labels). The
 * math is owned by code: the GIVEN formula and every answer field are copied
 * verbatim onto a clone. Any failure mode — AI unavailable, timeout, malformed
 * or unsafe output — returns the original problem unchanged. This never throws.
 */

import { getJsonModel } from '../../lib/ai'
import {
  buildRewritePrompt,
  numbersIn,
  REWRITE_SCHEMA,
  validateRewrite,
  type RewriteField,
} from './levelPrompts'
import type { WordProblem } from './types'

/** Max time to wait on the model (per attempt) before falling back. */
const REWRITE_TIMEOUT_MS = 9000

/**
 * How many times to ask the model. A second attempt is only worth it when the
 * first returned promptly but failed validation (e.g. a stray banned phrase or a
 * number collision); a timeout means the network is slow, so we don't retry.
 */
const MAX_ATTEMPTS = 2

/**
 * Return a copy of `problem` with title/prompt/labels rewritten to `level`, or
 * the original problem unchanged on any failure. Answers are always preserved.
 */
export async function rewriteProblem(
  problem: WordProblem,
  level: number,
): Promise<WordProblem> {
  const model = getJsonModel(REWRITE_SCHEMA)
  if (!model) return problem

  try {
    const fields: RewriteField[] = problem.fields.map((field) => ({
      label: field.label,
      meaning: (field as { meaning?: string }).meaning,
      kind: field.kind,
      needsX: field.kind === 'expression',
    }))

    const prompt = buildRewritePrompt({
      level,
      baseTitle: problem.title,
      basePrompt: problem.prompt,
      given: problem.given,
      fields,
    })
    // Numbers already present in the problem are legitimate; the validator uses
    // them to whitelist reused values while still rejecting an answer that the
    // rewrite leaks (or a distractor that collides with an answer).
    const allowedNumbers = numbersIn(`${problem.title} ${problem.prompt} ${problem.given ?? ''}`)

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // Bound the model call; clear the timer in finally so a successful call
      // never leaves a timer dangling.
      let timer: ReturnType<typeof setTimeout> | undefined
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<null>((resolve) => {
          timer = setTimeout(() => resolve(null), REWRITE_TIMEOUT_MS)
        }),
      ]).finally(() => {
        if (timer) clearTimeout(timer)
      })
      // A timeout means the network is slow — retrying would only stack more
      // latency, so fall back to base phrasing immediately.
      if (!result) return problem

      const text = result.response.text()
      if (typeof text !== 'string' || text.trim().length === 0) continue

      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        continue
      }
      const out = validateRewrite(parsed, problem.fields, { allowedNumbers, level })
      if (!out) continue

      return {
        ...problem,
        title: out.title,
        prompt: out.prompt,
        fields: problem.fields.map((f, i) => ({
          ...f,
          label: out.fieldLabels[i],
        })),
      }
    }
    return problem
  } catch {
    return problem
  }
}
