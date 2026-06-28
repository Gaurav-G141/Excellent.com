/**
 * Starter scenario for Lesson 2 (Rules of Derivatives), paper-box style:
 *   - s2-spread: a power-rule problem on a continuously spreading AREA.
 *
 * It models a genuinely CONTINUOUS quantity (area over time), so taking an
 * instantaneous rate of change is meaningful — unlike a discrete "cost of one
 * more item", which is really f(x+1) - f(x), not a derivative. All math is
 * code-owned; the AI only restates the title/prompt wording, and only the FRQ
 * step is AI-graded. Calculus is never named in the prompt.
 *
 * NOTE: the product-rule rectangle scenario used to live here, but the product
 * rule is taught in Lesson 4 — so it now lives in scenarios/lesson4.ts and only
 * unlocks behind 'exponents-product-rule'. This group keeps just the power-rule
 * (spread) scenario, which IS taught in this lesson.
 */

import { formatPolynomial, pick, randInt, uniqueId } from '../helpers'
import type { ScenarioLessonGroup, ScenarioProblem, ScenarioTopicDef } from '../scenarioTypes'

/** Differentiate a low-to-high coefficient array. */
function derivative(coeffs: number[]): number[] {
  if (coeffs.length <= 1) return [0]
  const out: number[] = []
  for (let power = 1; power < coeffs.length; power++) out.push(coeffs[power] * power)
  return out
}

/** Evaluate a low-to-high polynomial at x. */
function evalPoly(coeffs: number[], x: number): number {
  return coeffs.reduce((sum, c, power) => sum + c * x ** power, 0)
}

// ── s2-spread — power rule on a spreading area ───────────────────────────────
interface SpreadTheme {
  title: string
  spill: string
  /** The distinctive head noun the rewrite must keep (matches the steps). */
  key: string
  place: string
  unit: string
  timeUnit: string
}

const SPREAD_THEMES: SpreadTheme[] = [
  { title: 'Oil slick', spill: 'oil slick', key: 'oil', place: 'the sea', unit: 'square metres', timeUnit: 'minute' },
  { title: 'Spilled paint', spill: 'pool of paint', key: 'paint', place: 'a workshop floor', unit: 'square centimetres', timeUnit: 'second' },
  { title: 'Spreading wildfire', spill: 'wildfire', key: 'fire', place: 'a dry hillside', unit: 'hectares', timeUnit: 'hour' },
  { title: 'Ink blot', spill: 'ink blot', key: 'ink', place: 'a paper towel', unit: 'square centimetres', timeUnit: 'second' },
  { title: 'Coffee stain', spill: 'coffee stain', key: 'coffee', place: 'a white tablecloth', unit: 'square centimetres', timeUnit: 'second' },
  { title: 'Algae bloom', spill: 'algae bloom', key: 'algae', place: 'a still lake', unit: 'square metres', timeUnit: 'day' },
  { title: 'Spreading rust', spill: 'rust patch', key: 'rust', place: 'an old iron gate', unit: 'square centimetres', timeUnit: 'day' },
  { title: 'Creeping frost', spill: 'patch of frost', key: 'frost', place: 'a cold windowpane', unit: 'square centimetres', timeUnit: 'minute' },
  { title: 'Spilled syrup', spill: 'pool of syrup', key: 'syrup', place: 'a kitchen counter', unit: 'square centimetres', timeUnit: 'second' },
  { title: 'Lava flow', spill: 'lava flow', key: 'lava', place: 'a volcanic slope', unit: 'square metres', timeUnit: 'minute' },
  { title: 'Mossy patch', spill: 'patch of moss', key: 'moss', place: 'a shaded rooftop', unit: 'square centimetres', timeUnit: 'week' },
  { title: 'Glowing mould', spill: 'patch of mould', key: 'mould', place: 'a damp ceiling', unit: 'square centimetres', timeUnit: 'day' },
]

function genSpread(): ScenarioProblem {
  const theme = pick(SPREAD_THEMES)
  const a = pick([1, 2, 3])
  const b = randInt(2, 8)
  const x0 = randInt(3, 7)

  // A(x) = a·x² + b·x  (area covered after x time units); coeffs low-to-high.
  const coeffs = [0, b, a]
  const areaAtX0 = evalPoly(coeffs, x0)
  const derivCoeffs = derivative(coeffs) // [b, 2a]
  const rate = evalPoly(derivCoeffs, x0) // 2a·x0 + b

  const { spill, place, unit, timeUnit } = theme

  return {
    id: uniqueId('s2-spread'),
    topicId: 's2-spread',
    title: theme.title,
    // The steps name the spreading thing, so the rewrite must keep referring to it.
    subjectTerms: [theme.key],
    prompt: `A ${spill} spreads across ${place}. The area it covers (in ${unit}) after x ${timeUnit}s follows the formula below. How fast is the covered area growing at ${timeUnit} ${x0}?`,
    given: `A(x) = ${formatPolynomial(coeffs, 'x')}`,
    idealAnswer: `"How fast the area is growing" is the rate the area changes with respect to time. Build that rate formula, then read it at ${timeUnit} ${x0}.`,
    steps: [
      {
        id: 'warmup',
        tier: 'guide',
        kind: 'number',
        prompt: `Warm up: how much area has the ${spill} covered after ${x0} ${timeUnit}s? (${unit})`,
        expected: areaAtX0,
        hints: [`Put x = ${x0} into the area formula.`],
      },
      {
        id: 'concept',
        tier: 'core',
        kind: 'frq',
        prompt: {
          base: `What does "how fast the area is growing" refer to about the area as time passes? Explain in your own words.`,
          story: `The patch keeps widening. What exactly are we measuring when we ask how fast its area is growing at one instant?`,
        },
        rubric: `It is the rate at which the covered area is changing with respect to time at that instant — the derivative of the area as a function of time, evaluated at ${timeUnit} ${x0}.`,
        fallbackKeywords: [
          ['area', 'region', 'surface', 'space', 'patch'],
          ['grow', 'spread', 'increas', 'chang', 'expand', 'cover', 'fast', 'rate'],
        ],
        idealAnswer: `Yes — it's the rate the area changes with respect to time, right at that moment.`,
        hints: [
          `Picture the area as a value that climbs every ${timeUnit}; we want how quickly it climbs.`,
          `It's the rate the area changes with respect to time, right at ${timeUnit} ${x0}.`,
        ],
      },
      {
        id: 'derive',
        tier: 'scaffold',
        kind: 'expression',
        builder: true,
        prompt: `Build a formula for how fast the covered area is changing as time passes (as an expression in x).`,
        trueCoefficients: derivCoeffs,
        hints: [
          `Bring each power down in front and lower the power by one.`,
          `The x² term becomes a 2x-style term and the x term becomes a constant.`,
        ],
      },
      {
        id: 'final',
        tier: 'core',
        kind: 'number',
        prompt: `So how fast is the area growing at ${timeUnit} ${x0}? (${unit} per ${timeUnit})`,
        expected: rate,
        hints: [`Put x = ${x0} into the rate formula you just built.`],
      },
    ],
  }
}

const spread: ScenarioTopicDef = {
  id: 's2-spread',
  label: 'A spreading area',
  generate: genSpread,
}

export const lesson2Scenarios: ScenarioLessonGroup = {
  lessonId: 'derivative-rules',
  lessonTitle: 'Rules of Derivatives',
  topics: [spread],
}
