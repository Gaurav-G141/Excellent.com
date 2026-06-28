/**
 * Scenarios for Lesson 3 (Related Rates and Motion), paper-box style:
 *   - s3-peak: a projectile whose height is a quadratic in time. The learner has
 *     to realize that at the very top the height is momentarily not changing
 *     (velocity = 0) and solve for that moment.
 *   - s3-ivt: an endpoints-only "a value that must occur" problem. With only two
 *     readings and the fact that the quantity changes smoothly, the learner
 *     reasons that every value in between must have occurred (the Intermediate
 *     Value Theorem — never named). There is NO equation or graph: the reasoning
 *     is purely about the two endpoint values and continuity.
 *
 * Code owns the math; the AI restates only the title/prompt wording, and only the
 * FRQ steps are AI-graded. Calculus is never named.
 */

import { formatPolynomial, pick, randInt, shuffle, uniqueId } from '../helpers'
import type { ScenarioLessonGroup, ScenarioProblem, ScenarioTopicDef } from '../scenarioTypes'

interface MotionTheme {
  title: string
  object: string
  /** The distinctive head noun the rewrite must keep (matches the steps). */
  key: string
  launcher: string
}

const MOTION_THEMES: MotionTheme[] = [
  { title: 'Water rocket', object: 'water rocket', key: 'rocket', launcher: 'A student' },
  { title: 'Kicked soccer ball', object: 'soccer ball', key: 'ball', launcher: 'A player' },
  { title: 'Tossed beanbag', object: 'beanbag', key: 'beanbag', launcher: 'A camper' },
  { title: 'Launched drone toy', object: 'toy drone', key: 'drone', launcher: 'A hobbyist' },
  { title: 'Popped cork', object: 'cork', key: 'cork', launcher: 'A waiter' },
  { title: 'Model rocket', object: 'model rocket', key: 'rocket', launcher: 'A club member' },
  { title: 'Tossed apple', object: 'apple', key: 'apple', launcher: 'An orchard picker' },
  { title: 'Juggled club', object: 'juggling club', key: 'club', launcher: 'A juggler' },
  { title: 'Lobbed water balloon', object: 'water balloon', key: 'balloon', launcher: 'A counsellor' },
  { title: 'Flipped coin', object: 'coin', key: 'coin', launcher: 'A referee' },
]

function genPeak(): ScenarioProblem {
  const theme = pick(MOTION_THEMES)
  const a = pick([1, 2, 3])
  const tStar = randInt(2, 5) // the peak time (a clean integer)
  const b = 2 * a * tStar // so h'(x) = -2a·x + b = 0 at x = tStar
  const c = randInt(5, 20) // launch height

  // h(x) = -a·x² + b·x + c (metres) after x seconds; coeffs low-to-high.
  const coeffs = [c, b, -a]
  // h'(x) = -2a·x + b — the vertical speed; coeffs low-to-high.
  const velCoeffs = [b, -2 * a]

  const { object, launcher } = theme

  return {
    id: uniqueId('s3-peak'),
    topicId: 's3-peak',
    title: theme.title,
    // The steps name the object, so the rewrite must keep referring to it.
    subjectTerms: [theme.key],
    prompt: `${launcher} sends a ${object} straight up. Its height in metres after x seconds follows the formula below. When does the ${object} reach its highest point?`,
    given: `h(x) = ${formatPolynomial(coeffs, 'x')}`,
    idealAnswer: `At the top the height stops rising for an instant, so its speed is zero there. Build the speed formula, set it to zero, and solve for the time.`,
    steps: [
      {
        id: 'warmup',
        tier: 'guide',
        kind: 'number',
        prompt: `Warm up: how high is the ${object} at the instant it is released? (metres)`,
        expected: c,
        hints: [`That's the height at x = 0 — put 0 into the formula.`],
      },
      {
        id: 'concept',
        tier: 'core',
        kind: 'frq',
        prompt: {
          base: `At the very top of its flight, what is true about how the ${object}'s height is changing? Explain in your own words.`,
          story: `Think about the instant the ${object} is at its highest. What is happening to its height right then?`,
        },
        rubric: `At the highest point the height is momentarily not changing — its rate of change (vertical speed / velocity) is exactly zero before it starts falling.`,
        fallbackKeywords: [
          ['top', 'peak', 'highest', 'momentar', 'instant', 'turn', 'turning'],
          ['zero', '0', 'not chang', 'stop', 'still', 'nothing', 'no chang', 'flat'],
        ],
        idealAnswer: `Exactly — at the top its upward speed is zero for an instant.`,
        hints: [
          `It's done going up but hasn't started coming down — so for an instant it isn't moving up or down.`,
          `That means its vertical speed is zero right at the top.`,
        ],
      },
      {
        id: 'derive',
        tier: 'scaffold',
        kind: 'expression',
        builder: true,
        prompt: `Build a formula for the ${object}'s vertical speed at time x (as an expression in x).`,
        trueCoefficients: velCoeffs,
        hints: [
          `Bring each power down in front and lower the power by one.`,
          `The x² term becomes a 2x-style term and the constant drops out.`,
        ],
      },
      {
        id: 'final',
        tier: 'core',
        kind: 'number',
        prompt: `So at what time does the ${object} reach its highest point? (seconds)`,
        expected: tStar,
        tolerance: 0.05,
        hints: [
          `Set the speed formula equal to zero and solve for x.`,
          `That's the only moment the upward speed is zero.`,
        ],
      },
    ],
  }
}

const peak: ScenarioTopicDef = {
  id: 's3-peak',
  label: 'Reaching the top',
  generate: genPeak,
}

// ── s3-ivt — a value that must occur (endpoints + smooth change only) ─────────
interface IvtTheme {
  title: string
  /** The distinctive noun the rewrite must keep + that the sticker reads. */
  key: string
  /** The everyday quantity that changes, e.g. 'pace'. */
  quantity: string
  /** Units of that quantity, e.g. 'minutes per mile'. */
  unit: string
  /** A noun phrase naming the quantity that contains `key`. */
  quantityPhrase: string
  /** A short opening sentence that sets the scene. */
  scene: string
  /** Who makes the in-between claim. */
  claimer: string
}

const IVT_THEMES: IvtTheme[] = [
  {
    title: 'A runner who slows down',
    key: 'runner',
    quantity: 'pace',
    unit: 'minutes per mile',
    quantityPhrase: "the runner's pace",
    scene: 'A runner sets out on a long, steady training loop.',
    claimer: 'Jordan',
  },
  {
    title: 'A hike that warms up',
    key: 'hiker',
    quantity: 'temperature',
    unit: 'degrees',
    quantityPhrase: 'the temperature around the hiker',
    scene: 'A hiker climbs a winding trail as the morning wears on.',
    claimer: 'Mia',
  },
  {
    title: 'A car between two readings',
    key: 'car',
    quantity: 'speed',
    unit: 'miles per hour',
    quantityPhrase: "the car's speed",
    scene: 'A car cruises along a quiet stretch of highway.',
    claimer: 'Devon',
  },
  {
    title: 'A balloon that rises',
    key: 'balloon',
    quantity: 'altitude',
    unit: 'metres',
    quantityPhrase: "the balloon's altitude",
    scene: 'A hot-air balloon drifts up over the valley.',
    claimer: 'Priya',
  },
  {
    title: 'A diver going deeper',
    key: 'diver',
    quantity: 'depth',
    unit: 'metres',
    quantityPhrase: "the diver's depth",
    scene: 'A scuba diver descends slowly along a reef wall.',
    claimer: 'Sam',
  },
]

/**
 * An endpoints-only "must this value have occurred?" problem. Two readings of a
 * smoothly-changing quantity are given; because it cannot jump, every value
 * between the two readings must occur at some moment (IVT — never named). The
 * choice step's correct answer is the single reading strictly between the two
 * endpoints; every distractor sits strictly OUTSIDE the endpoint range, so the
 * interior value is the only one guaranteed to occur.
 */
function genIvt(): ScenarioProblem {
  const theme = pick(IVT_THEMES)
  const lo = randInt(3, 9)
  const span = randInt(4, 8)
  const hi = lo + span

  // Interior values (strictly between the two endpoints). There are span - 1 of
  // them (>= 3 here), enough for a distinct "claimed" and "guaranteed" value.
  const interior: number[] = []
  for (let v = lo + 1; v <= hi - 1; v++) interior.push(v)
  const shuffledInterior = shuffle(interior)
  const claimed = shuffledInterior[0]
  const guaranteed = shuffledInterior[1]

  // Distractors strictly OUTSIDE [lo, hi]: one below, two above. lo >= 3 keeps
  // the below-distractor positive.
  const below = lo - randInt(1, 2)
  const above1 = hi + randInt(1, 2)
  const above2 = hi + randInt(3, 5)
  const options = shuffle([guaranteed, below, above1, above2])

  const { key, quantity, unit, quantityPhrase, scene, claimer } = theme

  return {
    id: uniqueId('s3-ivt'),
    topicId: 's3-ivt',
    title: theme.title,
    // Set to the concrete noun of the theme so the rewrite keeps the subject and
    // the sticker agent gets a sensible thing to draw.
    subjectTerms: [key],
    prompt: `${scene} At one moment ${quantityPhrase} read ${lo} ${unit}, and a while later it read ${hi} ${unit}. ${claimer} insists ${quantityPhrase} must have been exactly ${claimed} ${unit} at some instant in between. Is ${claimer} right, and why or why not?`,
    idealAnswer: `Yes — ${quantityPhrase} changes smoothly, with no sudden jumps, so on its way from ${lo} to ${hi} ${unit} it must pass through every value in between, including ${claimed} ${unit}.`,
    steps: [
      {
        id: 'concept',
        tier: 'core',
        kind: 'frq',
        prompt: {
          base: `Is ${claimer} right that ${quantityPhrase} must have reached ${claimed} ${unit} at some moment between the two readings? Explain why or why not.`,
          story: `Picture ${quantityPhrase} moving from ${lo} to ${hi} ${unit}. Must it have hit ${claimed} ${unit} somewhere along the way? Say why.`,
        },
        rubric: `Yes. The ${quantity} changes smoothly and continuously, never jumping, so going from ${lo} to ${hi} ${unit} it has to take every value in between at some point — and ${claimed} ${unit} is in between, so it must occur.`,
        fallbackKeywords: [
          ['yes', 'right', 'correct', 'must', 'has to', 'true', 'agree', 'guarantee'],
          ['continu', 'smooth', 'gradual', 'pass', 'through', 'every value', 'in between', 'jump', 'skip', 'no sudden'],
        ],
        idealAnswer: `Exactly — it changes smoothly from ${lo} to ${hi} ${unit}, so it has to hit ${claimed} ${unit} somewhere in between.`,
        hints: [
          `It can't jump straight from ${lo} to ${hi} ${unit} — it slides through the values in between.`,
          `Because ${claimed} sits between ${lo} and ${hi}, the value has to land on it at some moment.`,
        ],
      },
      {
        id: 'guaranteed',
        tier: 'core',
        kind: 'choice',
        prompt: `Which one of these readings is the ${quantity} guaranteed to have hit at some moment between the two? (${unit})`,
        options,
        correct: guaranteed,
        hints: [
          `A reading is guaranteed only if it lies between the two endpoints, ${lo} and ${hi} ${unit}.`,
          `Pick the one value that falls strictly between ${lo} and ${hi}.`,
        ],
      },
    ],
  }
}

const ivt: ScenarioTopicDef = {
  id: 's3-ivt',
  label: 'A value that must occur',
  generate: genIvt,
}

export const lesson3Scenarios: ScenarioLessonGroup = {
  lessonId: 'related-rates',
  lessonTitle: 'Related Rates and Motion',
  topics: [peak, ivt],
}
