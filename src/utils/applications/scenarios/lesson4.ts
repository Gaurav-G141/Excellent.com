/**
 * Scenarios for Lesson 4 (Exponents & the Product Rule), paper-box style:
 *   - s4-growth:  continuous growth N(x) = N0·e^(k·x). The key idea is that the
 *     speed of growth is proportional to how much is currently there (its rate of
 *     change is k times the current amount).
 *   - s2-product: a product-rule problem on a rectangle whose length AND width
 *     both grow with time. (The id keeps its original "s2-" prefix so a learner's
 *     recency history for it survives the move — it used to sit in Lesson 2, but
 *     the product rule is taught HERE, in Lesson 4, so it is gated behind this
 *     lesson to avoid serving an untaught rule.)
 *
 * Both model genuinely CONTINUOUS quantities, so an instantaneous rate of growth
 * is meaningful. Code owns all the math; the AI only restates the title/prompt
 * wording, and only the FRQ steps are AI-graded. Calculus is never named.
 */

import { formatPolynomial, pick, randInt, shuffle, uniqueId } from '../helpers'
import type { ScenarioLessonGroup, ScenarioProblem, ScenarioTopicDef } from '../scenarioTypes'

/** Multiply two low-to-high coefficient arrays. */
function multiplyPoly(p: number[], q: number[]): number[] {
  const out = new Array(p.length + q.length - 1).fill(0)
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) out[i + j] += p[i] * q[j]
  }
  return out
}

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

/** Drop duplicates while preserving order. */
function uniqueNums(values: number[]): number[] {
  const out: number[] = []
  for (const v of values) if (!out.includes(v)) out.push(v)
  return out
}

// ── s4-growth — continuous, self-feeding growth ──────────────────────────────
interface GrowthTheme {
  title: string
  stuff: string
  place: string
  timeUnit: string
}

// Continuously-measured amounts (mass / coverage), so an instantaneous rate of
// growth is meaningful — not discrete counts.
const GROWTH_THEMES: GrowthTheme[] = [
  { title: 'Lab bacteria', stuff: 'bacteria', place: 'a warm dish', timeUnit: 'hour' },
  { title: 'Pond algae', stuff: 'algae', place: 'a still pond', timeUnit: 'day' },
  { title: 'Yeast culture', stuff: 'yeast', place: 'a brewing tank', timeUnit: 'hour' },
  { title: 'Spreading mould', stuff: 'mould', place: 'a loaf of bread', timeUnit: 'day' },
  { title: 'Sourdough starter', stuff: 'sourdough culture', place: 'a kitchen jar', timeUnit: 'hour' },
  { title: 'Duckweed', stuff: 'duckweed', place: 'a garden pond', timeUnit: 'day' },
  { title: 'Coastal plankton', stuff: 'plankton', place: 'a sheltered bay', timeUnit: 'day' },
  { title: 'Kombucha culture', stuff: 'kombucha culture', place: 'a brewing jar', timeUnit: 'day' },
  { title: 'Compost microbes', stuff: 'microbes', place: 'a compost bin', timeUnit: 'hour' },
  { title: 'Sprouting moss', stuff: 'moss', place: 'a terrarium', timeUnit: 'day' },
]

function genGrowth(): ScenarioProblem {
  const theme = pick(GROWTH_THEMES)
  const n0 = pick([100, 150, 200, 300, 500])
  const k = pick([0.1, 0.2, 0.25, 0.3])
  const x0 = randInt(2, 5)

  const current = n0 * Math.exp(k * x0)
  const rate = k * current
  const currentRounded = Math.round(current)
  const rateRounded = Math.round(rate)

  // Distractors: the current amount itself, the starting rate (k·N0), and double
  // the true rate. Round, de-dupe, and pad if a collision shrinks the set.
  let options = uniqueNums([
    rateRounded,
    Math.round(k * n0),
    currentRounded,
    Math.round(rate * 2),
  ])
  let bump = 1
  while (options.length < 4) {
    const candidate = rateRounded + bump * 7
    if (!options.includes(candidate)) options.push(candidate)
    bump++
  }
  options = shuffle(options)

  const { stuff, place, timeUnit } = theme

  return {
    id: uniqueId('s4-growth'),
    topicId: 's4-growth',
    title: theme.title,
    // The steps name the growing substance, so the rewrite must keep it.
    subjectTerms: [stuff],
    prompt: `The amount of ${stuff} in ${place} after x ${timeUnit}s follows the formula below. How fast is the ${stuff} growing at ${timeUnit} ${x0}?`,
    given: `N(x) = ${n0} · e^(${k} · x)`,
    idealAnswer: `For continuous growth, the speed of growth is proportional to how much is there: it's the growth constant times the current amount. Find the amount at ${timeUnit} ${x0}, then multiply by ${k}.`,
    steps: [
      {
        id: 'concept',
        tier: 'core',
        kind: 'frq',
        prompt: {
          base: `For something growing continuously like this, how does the speed at which it grows relate to how much is there at that moment? Explain in your own words.`,
          story: `Why does this kind of growth speed up as the amount gets bigger? What is the growth speed tied to?`,
        },
        rubric: `The growth speed is proportional to the current amount: the rate of change equals the growth constant (here ${k}) times however much is present at that time (derivative = k·N).`,
        fallbackKeywords: [
          ['proportion', 'times', 'multipl', 'constant', 'itself', 'more', 'bigger', 'k '],
          ['amount', 'much', 'size', 'current', 'present', 'many', 'population', 'number'],
        ],
        idealAnswer: `Right — the growth speed is the growth constant times the current amount.`,
        hints: [
          `Bigger amount, faster growth — they rise together.`,
          `The growth speed is a fixed multiple (the growth constant) of how much is there.`,
        ],
      },
      {
        id: 'amount',
        tier: 'scaffold',
        kind: 'number',
        prompt: `About how much ${stuff} is there at ${timeUnit} ${x0}?`,
        expected: currentRounded,
        tolerance: Math.max(2, current * 0.03),
        hints: [`Put x = ${x0} into the formula and use e ≈ 2.718.`],
      },
      {
        id: 'final',
        tier: 'core',
        kind: 'choice',
        prompt: `Roughly how fast is the ${stuff} growing at ${timeUnit} ${x0}? (per ${timeUnit})`,
        options,
        correct: rateRounded,
        hints: [
          `Multiply the current amount by the growth constant ${k}.`,
          `Growth speed = ${k} × (amount present right now).`,
        ],
      },
    ],
  }
}

const growth: ScenarioTopicDef = {
  id: 's4-growth',
  label: 'Growth that feeds itself',
  generate: genGrowth,
}

// ── s2-product — product rule on an expanding rectangle ──────────────────────
interface RectTheme {
  title: string
  thing: string
  timeUnit: string
}

const RECT_THEMES: RectTheme[] = [
  { title: 'Solar farm', thing: 'solar panel array', timeUnit: 'month' },
  { title: 'Projected image', thing: 'projected image', timeUnit: 'second' },
  { title: 'Garden plot', thing: 'garden plot', timeUnit: 'week' },
  { title: 'Stage banner', thing: 'banner', timeUnit: 'second' },
  { title: 'Greenhouse bed', thing: 'greenhouse bed', timeUnit: 'week' },
  { title: 'Mosaic mural', thing: 'mosaic mural', timeUnit: 'day' },
  { title: 'Practice field', thing: 'practice field', timeUnit: 'month' },
  { title: 'Photo print', thing: 'photo print', timeUnit: 'second' },
  { title: 'Patchwork quilt', thing: 'quilt', timeUnit: 'week' },
  { title: 'Tiled patio', thing: 'tiled patio', timeUnit: 'week' },
]

function genProduct(): ScenarioProblem {
  const theme = pick(RECT_THEMES)
  // length L(x) = l1·x + l0 (metres), width W(x) = w1·x + w0 (metres).
  const l1 = pick([1, 2])
  const l0 = randInt(3, 8)
  const w1 = pick([1, 2, 3])
  const w0 = randInt(2, 7)
  const x0 = randInt(2, 5)

  const lengthCoeffs = [l0, l1]
  const widthCoeffs = [w0, w1]
  const areaCoeffs = multiplyPoly(lengthCoeffs, widthCoeffs) // quadratic
  const areaDeriv = derivative(areaCoeffs)
  const areaRate = evalPoly(areaDeriv, x0)

  const { thing, timeUnit } = theme

  return {
    id: uniqueId('s2-product'),
    topicId: 's2-product',
    title: theme.title,
    prompt: `A rectangular ${thing} is being expanded. After x ${timeUnit}s its length and width (in metres) each follow the formulas below. How fast is its area growing in ${timeUnit} ${x0}?`,
    given: `length L(x) = ${formatPolynomial(lengthCoeffs, 'x')}\nwidth W(x) = ${formatPolynomial(widthCoeffs, 'x')}`,
    idealAnswer: `The area is length × width, and both sides are changing, so its rate has two pieces: the length's rate (times the current width) plus the width's rate (times the current length). Add them, then read it at ${timeUnit} ${x0}.`,
    steps: [
      {
        id: 'concept',
        tier: 'core',
        kind: 'frq',
        prompt: {
          base: `The area is the length times the width, and both are growing over time. Why isn't the speed the area grows simply the length's speed times the width's speed? What do you have to combine?`,
          story: `Both sides of the rectangle are stretching at once. What two effects together decide how fast the area grows?`,
        },
        rubric: `You can't just multiply the two rates. By the product rule the area's rate of change with respect to time is (the length's rate × the current width) PLUS (the width's rate × the current length); the two contributions are added.`,
        fallbackKeywords: [
          ['both', 'two', 'add', 'sum', 'plus', 'each', 'and'],
          ['length', 'side'],
          ['width', 'side', 'other'],
        ],
        idealAnswer: `Right — add the length's rate (times the current width) to the width's rate (times the current length).`,
        hints: [
          `If only the length grew, the area would climb one way; if only the width grew, another. Both happen at once.`,
          `Combine: (length's rate × current width) + (width's rate × current length).`,
        ],
      },
      {
        id: 'derive',
        tier: 'scaffold',
        kind: 'expression',
        builder: true,
        prompt: `Build a formula for how fast the area is changing over time (as an expression in x).`,
        trueCoefficients: areaDeriv,
        hints: [
          `First multiply length by width to get the area, then find how fast that changes.`,
          `Multiply the two formulas, then bring each power down and lower it by one.`,
        ],
      },
      {
        id: 'final',
        tier: 'core',
        kind: 'number',
        prompt: `In ${timeUnit} ${x0}, how fast is the area growing? (square metres per ${timeUnit})`,
        expected: areaRate,
        hints: [`Put x = ${x0} into the rate formula you built.`],
      },
    ],
  }
}

const product: ScenarioTopicDef = {
  id: 's2-product',
  label: 'Two sides changing at once',
  generate: genProduct,
}

export const lesson4Scenarios: ScenarioLessonGroup = {
  lessonId: 'exponents-product-rule',
  lessonTitle: 'Exponents & the Product Rule',
  topics: [growth, product],
}
