/**
 * Saved per-level prompts and the prompt/validation plumbing for the AI rewrite
 * of Applications word problems.
 *
 * Code owns the math: the AI is only ever asked to restate learner-facing text
 * (title, prompt, field labels) at a target difficulty. It must never touch the
 * GIVEN formula, the answers, or which concept is tested. Everything here is
 * pure string/data work — no Firebase, no I/O — so it stays trivially testable.
 *
 * The difficulty gradient (1 = maximally explicit/hand-holding, 15 = a short
 * story whose question is only implied) follows docs/adaptive-difficulty.md §4–5
 * and the "implied, not stated" style in docs/uil-calc-problems.md.
 */

import { Schema } from '../../lib/ai'
import { cleanText } from './madlib'
import type { AppField } from './types'

/** Highest (most implicit) difficulty level. Levels run 1..MAX_LEVEL. */
export const MAX_LEVEL = 15

/** One-paragraph system instruction shared by every level. */
export const SYSTEM_LINE =
  'You turn a real-world math word problem into a specific target difficulty by rewriting ONLY its wording. ' +
  'You never change the math, never alter or drop any number, never reveal or solve the answer, and never ' +
  'change which quantity is being asked for. Your rewrite must read as a natural, sensible real-world situation ' +
  'that always poses one concrete question. Output JSON only.'

/** Constant guardrails appended to every rewrite prompt. */
export const RULES_BLOCK = [
  'RULES:',
  '- The GIVEN formula is shown to the student exactly as provided. Do not change it, restate it differently, or invent or alter any of its numbers. Likewise, every number already in the BASE PROMPT (measurements, the values a variable may take, rates) is part of the problem: reproduce each one exactly and never drop, round, or reword it.',
  '- Keep the SAME quantity asked for each answer blank (its meaning is provided). Never solve it, never state the numeric answer, and never hint at the value.',
  '- Use plain, everyday English only. NEVER name the math or the operation. Forbidden words include: derivative, rate of change, slope, integral, mean value theorem, intermediate value theorem, acceleration, velocity-as-derivative, critical point, tangent, secant, chain rule, power rule, related rates, polynomial, differentiate, calculus.',
  '- ALWAYS pose exactly one concrete, answerable question about a real-world quantity — a real question, or an unmistakable request to find one specific value (e.g. "when is the tension in the string greatest?", "how fast was the car going?", "which temperature must the hike pass through?"). What rises with difficulty is HOW MUCH everyday reasoning the reader needs to realize which quantity to find and how to get it (the underlying method is never named at higher levels) — difficulty NEVER removes the question. Never end on a scene with no question, and never hide the ask only inside the answer-blank labels.',
  '- The finished problem must make real-world sense: the units must fit the quantity, the situation must be physically possible, the title must match the scene, and every value the variable takes — including any specific moment the question asks about — must be plausible for the story (e.g. no negative counts, distances, or "time since the start" when the situation cannot be negative). If the BASE PROMPT drives the input with an awkward abstract placeholder (such as a "throttle x" or "level x" on something that would not really have one), recast x as a natural real-world driver for that quantity, keeping every number, the GIVEN formula, and the asked quantity exactly the same.',
  '- Add any extra, irrelevant information ONLY by weaving it into the scene as natural detail that looks just as relevant as what matters — never announce, label, or signal that something is irrelevant. FORBIDDEN: meta-comments such as "this doesn\'t matter", "just for context", "ignore", "without using", "has nothing to do with", or tacking an unrelated fact onto the end. Good distractors look like this: a stand selling cookies at one rate and brownies at another when only one is asked about; a trader holding three different stocks when only the net daily change matters; a child running at 7 mph while flying a kite. Any number you add must NOT equal — or be easily confused with — any answer option, any value the asked variable can take, the operative measurements, or the answer\'s units (e.g. never use 1, 2, 3, or 4 as flavor when the answer is one of 1–4, and never introduce a stray "thousands of dollars" amount in a thousands-of-dollars problem).',
  '- For any blank that must be answered as an algebraic expression, the label MUST contain the explicit phrase "as an expression in x". Merely mentioning the letter x somewhere in the label is not enough.',
  '- Write the title and prompt as natural prose. NEVER paste scaffolding words from these instructions into them — words like "GIVEN", "READ-ONLY", "do not change", "BASE PROMPT", or "TARGET DIFFICULTY". The formula is displayed to the student on its own; refer to it naturally ("the formula below", "the rule below") or restate it inline, but never tag it with those labels. The phrase "as an expression in x" belongs only in the relevant answer-blank label, never in the prompt.',
].join('\n')

/** Hand-tuned per-level instruction fragments, keyed 1..15. */
export const LEVEL_PROMPTS: Record<number, string> = {
  1: 'LEVEL 1 (maximally explicit): State the everyday quantity to find so it cannot be missed ("you are looking for ..."), and briefly gloss, in simple words, what each quantity means in the real world. One or two short sentences. Add ZERO extra details. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  2: 'LEVEL 2 (very explicit): Gloss the everyday meaning of each quantity and ask plainly for what to find. Short — one or two sentences — with NO distractions. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  3: 'LEVEL 3 (explicit): Ask plainly for the everyday quantity, with no goal-restatement and no gloss. Stay short with NO irrelevant details. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  4: 'LEVEL 4 (direct): An ordinary, concrete word problem that asks straight out for the everyday quantity, with light real-world context. NO distracting details. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  5: 'LEVEL 5 (direct): A normal, concrete word problem that asks directly for the quantity, with minimal framing. NO irrelevant details. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  6: 'LEVEL 6 (direct): A terse, concrete word problem that asks directly for the quantity with no extra context. NO distractions. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  7: 'LEVEL 7 (real-world cue): Ask the question through an everyday cue that stands in for the method instead of naming it (e.g. "the kite tugs hardest right when it is climbing fastest — when does the child feel the most pull?"). Still end in a clear, concrete question. Weave in EXACTLY ONE natural, irrelevant detail that belongs to the scene. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  8: 'LEVEL 8 (real-world cue): Pose the question through a real-world consequence rather than a method, a touch less directly, but still unmistakably a question. Weave in EXACTLY ONE natural, irrelevant number that fits the scene. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  9: 'LEVEL 9 (real-world cue): Let the situation point at the wanted quantity so the reader must recognize what it corresponds to, with no hint of the method — and still close on a clear question. Weave in EXACTLY ONE natural, irrelevant number. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  10: 'LEVEL 10 (embedded scenario): Embed the question in a short real-world scene and ask it indirectly through a consequence (such as "when is it pulling hardest?"), never naming what to compute. Weave in EXACTLY TWO natural, irrelevant numbers that fit the scene. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  11: 'LEVEL 11 (embedded scenario): Wrap the question in a brief scene so the reader pieces together which quantity is wanted, then still ask it concretely. Weave in EXACTLY TWO natural, irrelevant numbers. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  12: 'LEVEL 12 (embedded scenario): Set the question inside a situation and point at it only through real-world reasoning, but still ask a concrete question. Weave in EXACTLY TWO natural, irrelevant numbers as part of the scene. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  13: 'LEVEL 13 (implied story): Tell a short, vivid story where the method must be inferred from a real-world consequence that may take a step of common sense to unpack (e.g. "how many birds would keep the bug population steady?" implies the growth must be exactly cancelled out). Do not name any method, but STILL end with a concrete question the reader can answer — never trail off into a scene with no question. Weave EXACTLY THREE plausible, irrelevant numbers into the story as natural detail. Keep each answer-blank label minimal — just the everyday quantity and its units — and, if there are several blanks, clearly distinct from one another (e.g. an "over the whole stretch" value versus an "at the final moment" value). Keep the GIVEN formula untouched and never hint at the numeric answer.',
  14: 'LEVEL 14 (implied story): A short, vivid story pointing at the needed quantity even more faintly, through real-world reasoning — yet it must STILL ask a concrete question, never just describe a scene. Slip EXACTLY THREE plausible, irrelevant numbers in among the details as natural scene detail. Keep each label minimal and clearly distinct from the others, as in level 13. Keep the GIVEN formula untouched and never hint at the numeric answer.',
  15: 'LEVEL 15 (most implicit): Tell a short, vivid story whose method is implied entirely by the situation and takes real-world reasoning to pin down — but the story must STILL close on a concrete question (e.g. "how many predators would hold the population steady?"), never a method name and never just a scene. Weave EXACTLY THREE plausible, irrelevant numbers naturally into the narrative. Keep each label minimal and clearly distinct from the others, as in level 13. This is the most implicit level. Keep the GIVEN formula untouched and never hint at the numeric answer.',
}

/** One answer blank, described for the rewrite prompt. */
export interface RewriteField {
  label: string
  meaning?: string
  kind: AppField['kind']
  needsX: boolean
}

/** Everything the model needs to rewrite one problem at a level. */
export interface RewriteInput {
  level: number
  baseTitle: string
  basePrompt: string
  given?: string
  fields: RewriteField[]
}

/** Clamp a (possibly float/out-of-range) level into 1..MAX_LEVEL. */
function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 1
  const n = Math.round(level)
  if (n < 1) return 1
  if (n > MAX_LEVEL) return MAX_LEVEL
  return n
}

/** Lowest level whose question is implied rather than stated outright. */
export const IMPLIED_BAND_MIN = 7
/** Lowest level told as a story whose labels must be minimal/non-revealing. */
export const STORY_BAND_MIN = 13

type Band = 'explicit' | 'implied' | 'story'

function bandFor(level: number): Band {
  if (level >= STORY_BAND_MIN) return 'story'
  if (level >= IMPLIED_BAND_MIN) return 'implied'
  return 'explicit'
}

/** Compose the full rewrite prompt for one problem at the given level. */
export function buildRewritePrompt(input: RewriteInput): string {
  const level = clampLevel(input.level)
  const fragment = LEVEL_PROMPTS[level]
  const band = bandFor(level)

  const blanks = input.fields
    .map((f, i) => {
      const what = f.meaning?.trim() || f.label
      const exprNote = f.needsX
        ? ' This blank must be answered as an expression in x, so its label must make that clear.'
        : ''
      // Only the explicit band anchors on the original label. At higher levels we
      // deliberately hide it so the model isn't pulled back toward the original
      // (often method-flavored) phrasing — the #1 reason high levels read like low
      // ones.
      const labelNote = band === 'explicit' ? ` (current label: "${f.label}")` : ''
      return `${i + 1}. ${what}${labelNote}.${exprNote}`
    })
    .join('\n')

  // The blank descriptions are intentionally method-flavored ("how fast …") so
  // the model keeps the math right. Past the explicit band we must stop it from
  // copying that wording into learner-facing text, or every level collapses back
  // to "how fast does x change".
  const blankGuidance =
    band === 'explicit'
      ? ''
      : band === 'implied'
        ? '\n\nThe blank descriptions above exist ONLY so you know which value each blank wants and keep the math correct — they are NOT learner-facing. Write a fresh, plain label for each blank that names the everyday quantity and its units. Do NOT copy method-flavored wording from the descriptions (e.g. "how fast", "rate", "average", "exact", "at the end"), and never phrase a label as a command to compute.'
        : '\n\nThe blank descriptions above are for YOUR understanding only — never echo their wording. Give each blank the shortest plain label you can: the everyday quantity and its units, tied to the scene (e.g. "mph across the whole ride" vs "mph right at the finish"). Never name an operation ("how fast", "rate", and the like) and never write a label as an instruction ("write…", "find…"). Keep multiple labels clearly distinct from one another.'

  const givenBlock = input.given?.trim()
    ? `GIVEN (READ-ONLY — show exactly, do not change): ${input.given.trim()}`
    : 'GIVEN (READ-ONLY): (none)'

  return [
    SYSTEM_LINE,
    '',
    RULES_BLOCK,
    '',
    `TARGET DIFFICULTY — ${fragment}`,
    '',
    `BASE TITLE: ${input.baseTitle}`,
    `BASE PROMPT: ${input.basePrompt}`,
    '',
    givenBlock,
    '',
    `ANSWER BLANKS (${input.fields.length}, keep the same quantity and order):`,
    blanks + blankGuidance,
    '',
    `Return JSON: {"title": string, "prompt": string, "fieldLabels": string[]} with EXACTLY ${input.fields.length} entries in fieldLabels, one per blank, in the same order.`,
  ].join('\n')
}

/** JSON schema enforced on the model's rewrite output. */
export const REWRITE_SCHEMA = Schema.object({
  properties: {
    title: Schema.string(),
    prompt: Schema.string(),
    fieldLabels: Schema.array({ items: Schema.string() }),
  },
})

/** Validated, ready-to-apply rewrite text. */
export interface RewriteOutput {
  title: string
  prompt: string
  fieldLabels: string[]
}

/** Optional context that lets the validator reject answer leakage / collisions. */
export interface RewriteContext {
  /** Numbers that legitimately appear in the base problem (whitelisted). */
  allowedNumbers: number[]
  /** Target difficulty level, so the validator can apply high-band label rules. */
  level?: number
}

/** Extract every numeric literal from `text` (integers and decimals). */
export function numbersIn(text: string): number[] {
  const out: number[] = []
  const re = /-?\d+(?:\.\d+)?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const n = Number(m[0])
    if (Number.isFinite(n)) out.push(n)
  }
  return out
}

/** The concrete numeric values a rewrite must never reveal/collide with. */
function answerValues(fields: AppField[]): number[] {
  const vals: number[] = []
  for (const f of fields) {
    if (f.kind === 'number') vals.push(f.expected)
    // For choice fields we guard EVERY selectable option, not just the correct
    // one: a distractor that matches any pickable option would be just as
    // confusing as one matching the answer.
    else if (f.kind === 'choice') vals.push(...f.options)
    // Expression answers live as coefficients inside the GIVEN block, which is
    // shown verbatim and not part of the rewritten prose, so they're skipped.
  }
  return vals
}

const NUM_EPS = 1e-9

/**
 * Method phrases that `cleanText`'s shared list doesn't cover but that must
 * never reach the learner. Deliberately limited to unambiguous calculus
 * giveaways — everyday words like "slope" (a hill) or "acceleration" (a car)
 * are left to the prompt rules so we don't reject otherwise-valid scenarios.
 */
const EXTRA_BANNED = ['rate of change', 'instantaneous']

function hasExtraJargon(text: string): boolean {
  const lower = text.toLowerCase()
  return EXTRA_BANNED.some((b) => lower.includes(b))
}

/**
 * Operation giveaways that must never survive in a top-band (>= STORY_BAND_MIN)
 * rewrite, where the question is supposed to be implied. Kept deliberately tight
 * — these are unambiguous "name the operation" phrasings — so the high-band check
 * rarely forces a fallback to the (explicit) base problem.
 */
const HIGH_BAND_BANNED = ['how fast', 'how quickly', 'how rapidly']

function hasHighBandGiveaway(text: string): boolean {
  const lower = text.toLowerCase()
  return HIGH_BAND_BANNED.some((b) => lower.includes(b))
}

/**
 * Strip a leading imperative ("Write the …", "Find the …") from a field label so
 * a blank reads as the quantity it wants, not a command — e.g. "Write the exact
 * amount at t = 3" becomes "The exact amount at t = 3". Only rewrites when an
 * actual command verb leads the label, leaving everything else untouched.
 */
function stripLabelCommand(label: string): string {
  const m = label.match(
    /^(?:please\s+)?(?:write|find|calculate|compute|determine|enter)\b[\s:,-]+(.*)$/i,
  )
  if (!m) return label
  const rest = m[1].trim()
  if (rest.length === 0) return label
  return rest.charAt(0).toUpperCase() + rest.slice(1)
}

/**
 * Validate raw model output against the real fields. Returns a clean
 * RewriteOutput, or null if anything is malformed/unsafe (caller falls back to
 * the base problem). Never throws.
 *
 * When `context` is supplied, a rewrite is rejected if any concrete answer value
 * appears in the rewritten prose unless that number already occurred in the base
 * problem — this catches both answer leakage and distractors that collide with
 * an answer.
 */
export function validateRewrite(
  raw: unknown,
  fields: AppField[],
  context?: RewriteContext,
): RewriteOutput | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  if (!Array.isArray(obj.fieldLabels)) return null
  if (obj.fieldLabels.length !== fields.length) return null

  const title = cleanText(obj.title, 100)
  if (title === null || hasExtraJargon(title)) return null

  const prompt = cleanText(obj.prompt, 900)
  if (prompt === null || hasExtraJargon(prompt)) return null

  const fieldLabels: string[] = []
  for (let i = 0; i < fields.length; i++) {
    const cleaned = cleanText(obj.fieldLabels[i], 100)
    if (cleaned === null || hasExtraJargon(cleaned)) return null

    let label = stripLabelCommand(cleaned)
    if (fields[i].kind === 'expression' && !/expression\s+in\s+x/i.test(label)) {
      label += ' (write your answer as an expression in x)'
    }
    fieldLabels.push(label)
  }

  // In the story band the question must stay implied: reject any learner-facing
  // text that still names the operation outright (e.g. "how fast …").
  if (
    context &&
    typeof context.level === 'number' &&
    context.level >= STORY_BAND_MIN &&
    [title, prompt, ...fieldLabels].some(hasHighBandGiveaway)
  ) {
    return null
  }

  if (context) {
    const allowed = context.allowedNumbers
    const present = numbersIn([title, prompt, ...fieldLabels].join(' '))
    for (const answer of answerValues(fields)) {
      const whitelisted = allowed.some((a) => Math.abs(a - answer) < NUM_EPS)
      if (whitelisted) continue
      if (present.some((p) => Math.abs(p - answer) < NUM_EPS)) return null
    }
  }

  return { title, prompt, fieldLabels }
}
