/**
 * AI surface-rewrite for multi-step scenario problems.
 *
 * Like rewrite.ts (the single-shot WordProblem path), this only restates the
 * learner-facing wording at a target difficulty — here just the `title` and the
 * scenario `prompt`. The GIVEN formula and every step (questions, answers,
 * rubrics, hints) are owned by code and spread through verbatim. Difficulty hides
 * the method in the prompt; the step scaffold is handled separately by the card.
 *
 * Reuses the prompt rules, level fragments, interest clause, and validation
 * primitives from levelPrompts.ts so the two paths stay consistent. Any failure
 * (AI off, timeout, malformed/unsafe output) returns the scenario unchanged. This
 * never throws.
 */

import { getJsonModel, Schema } from '../../lib/ai'
import { cleanText } from './madlib'
import {
  LEVEL_PROMPTS,
  MAX_LEVEL,
  RULES_BLOCK,
  STORY_BAND_MIN,
  STYLE_BLOCK,
  SYSTEM_LINE,
  buildInterestClause,
  hasExtraJargon,
  hasHighBandGiveaway,
  numbersIn,
} from './levelPrompts'
import type { ScenarioProblem, ScenarioStep } from './scenarioTypes'

/** Max time to wait on the model (per attempt) before falling back. */
const REWRITE_TIMEOUT_MS = 9000
/** Retry only a prompt-but-invalid first result; a timeout means a slow network. */
const MAX_ATTEMPTS = 2
const NUM_EPS = 1e-9

/** JSON schema enforced on the model's scenario rewrite (title + prompt only). */
export const SCENARIO_REWRITE_SCHEMA = Schema.object({
  properties: {
    title: Schema.string(),
    prompt: Schema.string(),
  },
})

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 1
  const n = Math.round(level)
  if (n < 1) return 1
  if (n > MAX_LEVEL) return MAX_LEVEL
  return n
}

/** Concrete numeric answers a rewrite must never reveal (number + choice steps). */
export function scenarioAnswerValues(steps: ScenarioStep[]): number[] {
  const vals: number[] = []
  for (const step of steps) {
    if (step.kind === 'number') vals.push(step.expected)
    else if (step.kind === 'choice') vals.push(...step.options)
    // Expression coefficients live in the GIVEN block (shown verbatim), not the
    // rewritten prose, so they don't need answer-leak guarding here.
  }
  return vals
}

interface ScenarioRewriteInput {
  level: number
  baseTitle: string
  basePrompt: string
  given?: string
  interests?: string[]
  /** Concrete nouns the guided steps name; the rewrite must keep referring to them. */
  subjectTerms?: string[]
}

/** Compose the rewrite prompt for one scenario at a level (title + prompt only). */
export function buildScenarioRewritePrompt(input: ScenarioRewriteInput): string {
  const level = clampLevel(input.level)
  const fragment = LEVEL_PROMPTS[level]
  const givenBlock = input.given?.trim()
    ? `GIVEN (READ-ONLY — show exactly, do not change): ${input.given.trim()}`
    : 'GIVEN (READ-ONLY): (none)'
  const interestClause = buildInterestClause(input.interests)

  // The guided steps name these objects verbatim, so the prompt must keep
  // referring to the same things. Interests may reskin the SETTING (people,
  // place, occasion) but must not rename these subjects, or the steps would talk
  // about a different object than the prompt.
  const subjects = (input.subjectTerms ?? []).map((t) => t.trim()).filter(Boolean)
  const subjectClause =
    subjects.length > 0
      ? `KEEP THESE SUBJECTS: the guided steps refer to ${subjects
          .map((s) => `"${s}"`)
          .join(', ')}. Your rewrite MUST keep referring to these same real things, using these words, so the steps still match. You may theme the surrounding setting (people, place, occasion) around the learner's interest, but do NOT rename or swap these subjects (for example, never turn a "beanbag" into a "guitar pick").`
      : ''

  return [
    SYSTEM_LINE,
    '',
    RULES_BLOCK,
    '',
    STYLE_BLOCK,
    '',
    `TARGET DIFFICULTY — ${fragment}`,
    '',
    ...(interestClause ? [interestClause, ''] : []),
    ...(subjectClause ? [subjectClause, ''] : []),
    `BASE TITLE: ${input.baseTitle}`,
    `BASE PROMPT: ${input.basePrompt}`,
    '',
    givenBlock,
    '',
    'This problem is solved in guided steps that are shown to the learner separately — do NOT add, remove, restate, or answer those steps. Rewrite ONLY the title and the scenario prompt to the target difficulty. The prompt must still close on the SAME overall real-world question.',
    '',
    'Return JSON: {"title": string, "prompt": string}.',
  ].join('\n')
}

/** Validate raw model output for a scenario rewrite, or null if unsafe/malformed. */
export function validateScenarioRewrite(
  raw: unknown,
  scenario: ScenarioProblem,
  context: { allowedNumbers: number[]; level: number },
): { title: string; prompt: string } | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  const title = cleanText(obj.title, 100)
  if (title === null || hasExtraJargon(title)) return null

  const prompt = cleanText(obj.prompt, 900)
  if (prompt === null || hasExtraJargon(prompt)) return null

  // In the story band the question must stay implied: reject text that still
  // names the operation outright (e.g. "how fast …").
  if (context.level >= STORY_BAND_MIN && [title, prompt].some(hasHighBandGiveaway)) {
    return null
  }

  // The guided steps name concrete objects; if the rewrite dropped or renamed any
  // of them the prompt and steps would describe different things, so fall back.
  const lowerPrompt = prompt.toLowerCase()
  for (const term of scenario.subjectTerms ?? []) {
    const t = term.trim().toLowerCase()
    if (t && !lowerPrompt.includes(t)) return null
  }

  // Reject any concrete step answer that appears in the rewritten prose unless it
  // already occurred in the base problem (catches leakage + answer collisions).
  const present = numbersIn(`${title} ${prompt}`)
  for (const answer of scenarioAnswerValues(scenario.steps)) {
    const whitelisted = context.allowedNumbers.some((a) => Math.abs(a - answer) < NUM_EPS)
    if (whitelisted) continue
    if (present.some((p) => Math.abs(p - answer) < NUM_EPS)) return null
  }

  return { title, prompt }
}

/**
 * Return a copy of `scenario` with title/prompt rewritten to `level`, or the
 * original unchanged on any failure. Steps/given/answers are always preserved.
 */
export async function rewriteScenario(
  scenario: ScenarioProblem,
  level: number,
  interests?: string[],
): Promise<ScenarioProblem> {
  const model = getJsonModel(SCENARIO_REWRITE_SCHEMA)
  if (!model) return scenario

  try {
    const prompt = buildScenarioRewritePrompt({
      level,
      baseTitle: scenario.title,
      basePrompt: scenario.prompt,
      given: scenario.given,
      interests,
      subjectTerms: scenario.subjectTerms,
    })
    const allowedNumbers = numbersIn(
      `${scenario.title} ${scenario.prompt} ${scenario.given ?? ''}`,
    )

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      let timer: ReturnType<typeof setTimeout> | undefined
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<null>((resolve) => {
          timer = setTimeout(() => resolve(null), REWRITE_TIMEOUT_MS)
        }),
      ]).finally(() => {
        if (timer) clearTimeout(timer)
      })
      // A timeout means a slow network; retrying only stacks latency.
      if (!result) return scenario

      const text = result.response.text()
      if (typeof text !== 'string' || text.trim().length === 0) continue

      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        continue
      }
      const out = validateScenarioRewrite(parsed, scenario, {
        allowedNumbers,
        level: clampLevel(level),
      })
      if (!out) continue

      return { ...scenario, title: out.title, prompt: out.prompt }
    }
    return scenario
  } catch {
    return scenario
  }
}
