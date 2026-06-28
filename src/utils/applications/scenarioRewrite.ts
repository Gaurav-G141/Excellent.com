/**
 * AI surface-rewrite for multi-step scenario problems.
 *
 * Unlike the single-shot WordProblem path, this rewrites the WHOLE learner-facing
 * surface of a scenario together — the `title`, the scenario `prompt`, AND every
 * step's question + hints — so the problem can be genuinely re-themed (e.g. built
 * around a learner interest) instead of merely name-dropping it. Code still owns
 * ALL the math: the GIVEN formula, every step's expected value / coefficients /
 * options / tolerance, and the FRQ rubric + fallback keywords are spread through
 * verbatim and never sent to (or touched by) the model.
 *
 * Because the prompt and the steps are rewritten in one pass, the rewrite may
 * recast the central subject around an interest as long as it stays consistent
 * across the whole problem. (When the model returns no `steps` — e.g. older
 * behavior or a partial response — we fall back to title/prompt-only and keep the
 * original subject-consistency guard so the prompt can't drift from the steps.)
 *
 * Reuses the prompt rules, level fragments, interest clause, and validation
 * primitives from levelPrompts.ts. Any failure (AI off, timeout, malformed/unsafe
 * output) returns the scenario unchanged. This never throws.
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
import { resolveStepPrompt, type ScenarioProblem, type ScenarioStep } from './scenarioTypes'

/** Max time to wait on the model (per attempt) before falling back. */
const REWRITE_TIMEOUT_MS = 9000
/** Retry only a prompt-but-invalid first result; a timeout means a slow network. */
const MAX_ATTEMPTS = 2
const NUM_EPS = 1e-9

/**
 * JSON schema enforced on the model's scenario rewrite. `steps` mirrors the
 * scenario's own step list (same length + order); only each step's wording is
 * rewritten — never its answer, which the model never sees.
 */
export const SCENARIO_REWRITE_SCHEMA = Schema.object({
  properties: {
    title: Schema.string(),
    prompt: Schema.string(),
    steps: Schema.array({
      items: Schema.object({
        properties: {
          question: Schema.string(),
          hints: Schema.array({ items: Schema.string() }),
        },
      }),
    }),
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

/** One step described to the model for rewriting (its answer is never included). */
interface RewriteStepInput {
  kind: ScenarioStep['kind']
  /** The step's current learner-facing question, resolved at the target level. */
  question: string
  /** The step's current hints (already resolved/plain). */
  hints: string[]
  /** True for polynomial-builder answers, which must keep "as an expression in x". */
  isExpression: boolean
}

interface ScenarioRewriteInput {
  level: number
  baseTitle: string
  basePrompt: string
  given?: string
  interests?: string[]
  /** The scenario's steps, resolved at the target level, for full re-theming. */
  steps: RewriteStepInput[]
}

/** Compose the rewrite prompt for one scenario at a level (title + prompt + steps). */
export function buildScenarioRewritePrompt(input: ScenarioRewriteInput): string {
  const level = clampLevel(input.level)
  const fragment = LEVEL_PROMPTS[level]
  const givenBlock = input.given?.trim()
    ? `GIVEN (READ-ONLY — show exactly, do not change): ${input.given.trim()}`
    : 'GIVEN (READ-ONLY): (none)'
  const interestClause = buildInterestClause(input.interests)

  // Because the prompt AND the steps are rewritten together, the subject may be
  // recast around the interest — this explicitly overrides the shared STYLE_BLOCK
  // "keep the same subject" line, while every hard math guarantee still holds.
  const themeFreedom =
    'THEME FREEDOM: You are rewriting the title, the scenario, AND every step together, so you MAY recast ' +
    'the central subject itself so the whole problem is genuinely ABOUT the chosen setting (the people, places, ' +
    'creatures, and objects can all come from it, and the thing whose quantity changes can BECOME something from ' +
    "it — e.g. a population of ladybugs, a ladybug's motion, or someone collecting ladybugs). This OVERRIDES any " +
    'earlier instruction to keep the original subject words. The hard requirements still hold without exception: ' +
    'reproduce every number exactly, keep the GIVEN formula unchanged, keep each step asking for the SAME quantity ' +
    'and units, keep the prompt and ALL steps describing the SAME new subject consistently, never name the ' +
    'calculus, and never reveal or hint at any answer.'

  const stepsBlock = input.steps
    .map((s, i) => {
      const lines = [`${i + 1}. (${s.kind}) Current wording: "${s.question}"`]
      if (s.hints.length > 0) lines.push(`   Current hints: ${JSON.stringify(s.hints)}`)
      if (s.isExpression) {
        lines.push(
          '   This step is answered with a formula — its rewritten question MUST contain the exact phrase "as an expression in x".',
        )
      }
      return lines.join('\n')
    })
    .join('\n')

  const stepsInstruction =
    `STEPS TO REWRITE (there are ${input.steps.length} — return EXACTLY this many, in this same order):\n` +
    stepsBlock +
    '\n\n' +
    'Rewrite EVERY step: restate its question and its hints in the new theme and at the target difficulty. ' +
    'Each step still asks for EXACTLY the same thing — the same quantity, the same units, the same kind of answer — ' +
    'so only the surface wording and theme change. The numeric answer to every step is fixed by code, hidden from ' +
    'you, and must never be stated or hinted. Each hint must give the SAME guidance as before, just reworded to fit ' +
    'the new scene. Give a step\'s "hints" as an empty array only if it currently has none.'

  return [
    SYSTEM_LINE,
    '',
    RULES_BLOCK,
    '',
    STYLE_BLOCK,
    '',
    themeFreedom,
    '',
    `TARGET DIFFICULTY — ${fragment}`,
    '',
    ...(interestClause ? [interestClause, ''] : []),
    `BASE TITLE: ${input.baseTitle}`,
    `BASE PROMPT: ${input.basePrompt}`,
    '',
    givenBlock,
    '',
    stepsInstruction,
    '',
    `Return JSON: {"title": string, "prompt": string, "steps": [{"question": string, "hints": string[]}]} with EXACTLY ${input.steps.length} step entries, in order. The prompt must still close on the SAME overall real-world question.`,
  ].join('\n')
}

/** A validated rewrite of one step's wording. */
interface RewrittenStep {
  question: string
  hints: string[]
}

/** Validated rewrite output: title/prompt always, steps only when fully rewritten. */
export interface ScenarioRewriteResult {
  title: string
  prompt: string
  /** Present only when the model returned a well-formed, same-length step list. */
  steps?: RewrittenStep[]
}

/**
 * Validate raw model output for a scenario rewrite, or null if unsafe/malformed.
 *
 * When the model returns a same-length `steps` array, the whole surface (prompt +
 * steps) is re-themed together, so the subject may legitimately change and the
 * subject-consistency guard is skipped. When it returns no usable steps, only the
 * title/prompt are rewritten and the original subject MUST still appear in the
 * prompt (so prompt and steps can't drift apart).
 */
export function validateScenarioRewrite(
  raw: unknown,
  scenario: ScenarioProblem,
  context: { allowedNumbers: number[]; level: number },
): ScenarioRewriteResult | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  const title = cleanText(obj.title, 100)
  if (title === null || hasExtraJargon(title)) return null

  const prompt = cleanText(obj.prompt, 900)
  if (prompt === null || hasExtraJargon(prompt)) return null

  // Optionally accept a full step rewrite (same count + order). Anything provided
  // but malformed/unsafe is a hard reject — we never silently keep a bad mix.
  let rewrittenSteps: RewrittenStep[] | undefined
  if (Array.isArray(obj.steps) && obj.steps.length === scenario.steps.length) {
    const built: RewrittenStep[] = []
    for (let i = 0; i < scenario.steps.length; i++) {
      const stepRaw = obj.steps[i]
      if (typeof stepRaw !== 'object' || stepRaw === null) return null
      const sObj = stepRaw as Record<string, unknown>

      let question = cleanText(sObj.question, 300)
      if (question === null || hasExtraJargon(question)) return null
      if (scenario.steps[i].kind === 'expression' && !/expression\s+in\s+x/i.test(question)) {
        question += ' (write your answer as an expression in x)'
      }

      const hints: string[] = []
      if (Array.isArray(sObj.hints)) {
        for (const h of sObj.hints) {
          const ch = cleanText(h, 200)
          if (ch === null || hasExtraJargon(ch)) return null
          hints.push(ch)
        }
      }
      built.push({ question, hints })
    }
    rewrittenSteps = built
  }

  // In the story band the overall question must stay implied: reject text that
  // still names the operation outright (e.g. "how fast …"). Hints may guide more
  // openly, so they're excluded from this check.
  if (context.level >= STORY_BAND_MIN) {
    const highBandTexts = [title, prompt, ...(rewrittenSteps?.map((s) => s.question) ?? [])]
    if (highBandTexts.some(hasHighBandGiveaway)) return null
  }

  // Without a full step rewrite, the steps still name the original subject; the
  // prompt must keep mentioning it so the two don't describe different things.
  if (!rewrittenSteps) {
    const lowerPrompt = prompt.toLowerCase()
    for (const term of scenario.subjectTerms ?? []) {
      const t = term.trim().toLowerCase()
      if (t && !lowerPrompt.includes(t)) return null
    }
  }

  // Reject any concrete step answer that appears anywhere in the rewritten prose
  // unless it already occurred in the base (catches leakage + answer collisions).
  const allText = [title, prompt]
  if (rewrittenSteps) {
    for (const s of rewrittenSteps) {
      allText.push(s.question, ...s.hints)
    }
  }
  const present = numbersIn(allText.join(' '))
  for (const answer of scenarioAnswerValues(scenario.steps)) {
    const whitelisted = context.allowedNumbers.some((a) => Math.abs(a - answer) < NUM_EPS)
    if (whitelisted) continue
    if (present.some((p) => Math.abs(p - answer) < NUM_EPS)) return null
  }

  return { title, prompt, steps: rewrittenSteps }
}

/** Numbers that legitimately appear anywhere in the base scenario (whitelisted). */
function baseAllowedNumbers(scenario: ScenarioProblem, level: number): number[] {
  const parts = [scenario.title, scenario.prompt, scenario.given ?? '']
  // Base step wording (e.g. "day 5") may reproduce input values the rewrite is
  // allowed to keep; include them so reusing them isn't mistaken for a leak.
  for (const step of scenario.steps) {
    parts.push(resolveStepPrompt(step.prompt, level))
    if (step.hints) parts.push(...step.hints)
  }
  return numbersIn(parts.join(' '))
}

/**
 * Return a copy of `scenario` with title/prompt (and, when the model provides
 * them, every step's question + hints) rewritten to `level`, or the original
 * unchanged on any failure. All answers/coefficients/options/given are preserved.
 */
export async function rewriteScenario(
  scenario: ScenarioProblem,
  level: number,
  interests?: string[],
): Promise<ScenarioProblem> {
  const model = getJsonModel(SCENARIO_REWRITE_SCHEMA)
  if (!model) return scenario

  const lvl = clampLevel(level)
  try {
    const prompt = buildScenarioRewritePrompt({
      level,
      baseTitle: scenario.title,
      basePrompt: scenario.prompt,
      given: scenario.given,
      interests,
      steps: scenario.steps.map((step) => ({
        kind: step.kind,
        question: resolveStepPrompt(step.prompt, lvl),
        hints: step.hints ?? [],
        isExpression: step.kind === 'expression',
      })),
    })
    const allowedNumbers = baseAllowedNumbers(scenario, lvl)

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
      const out = validateScenarioRewrite(parsed, scenario, { allowedNumbers, level: lvl })
      if (!out) continue

      // Reassemble: replace only the learner-facing wording, keep every code-owned
      // field (kind, expected, coefficients, options, rubric, keywords, tier, …).
      const steps = out.steps
        ? scenario.steps.map((step, i) => {
            const r = out.steps![i]
            const next: ScenarioStep = { ...step, prompt: r.question }
            if (r.hints.length > 0) next.hints = r.hints
            return next
          })
        : scenario.steps

      return { ...scenario, title: out.title, prompt: out.prompt, steps }
    }
    return scenario
  } catch {
    return scenario
  }
}
