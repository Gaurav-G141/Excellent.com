/**
 * Applications — Lesson 2: "Rules of Derivatives".
 *
 * Randomized, self-contained word problems that exercise the differentiation
 * rules through real-world framing. Expression answers are always written in x
 * (the grader samples x only). Phrasing deliberately avoids calculus jargon.
 */
import {
  formatMonomial,
  formatPolynomial,
  pick,
  randInt,
  superscript,
  uniqueId,
} from './helpers'
import { derivativeCoefficients } from '../polynomial'
import type {
  ApplicationLessonGroup,
  ApplicationTopicDef,
  WordProblem,
} from './types'

/** Sum two low-to-high coefficient arrays, padding the shorter one with zeros. */
function addCoeffs(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length)
  return Array.from({ length: len }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0))
}

// ── Topic: Power rule ───────────────────────────────────────────────────────
const powerThemes = [
  {
    title: 'Pizza dough cost',
    fnName: 'C',
    sym: 'r',
    prompt: (u0: number) =>
      `A pizzeria's dough cost in dollars for a pie of radius r inches follows the rule shown below. How fast is the cost climbing right when the radius reaches ${u0} inches?`,
    label: (u0: number) => `Extra dollars per additional inch at radius ${u0}`,
  },
  {
    title: 'Model detail',
    fnName: 'P',
    sym: 'd',
    prompt: (u0: number) =>
      `In a 3D editor, the polygon count of a model at detail level d follows the rule shown below. How fast is the polygon count rising right at detail level ${u0}?`,
    label: (u0: number) => `Extra polygons per additional detail level at level ${u0}`,
  },
  {
    title: 'Panel paint',
    fnName: 'V',
    sym: 's',
    prompt: (u0: number) =>
      `The paint in liters needed to coat a square panel of side s feet follows the rule shown below. How fast is the paint requirement growing right when the side is ${u0} feet?`,
    label: (u0: number) => `Extra liters per additional foot at size ${u0}`,
  },
  {
    title: 'Kinetic energy',
    fnName: 'E',
    sym: 'v',
    prompt: (u0: number) =>
      `A cart's kinetic energy in joules at speed v meters per second follows the rule shown below. How fast is the energy increasing right at a speed of ${u0} meters per second?`,
    label: (u0: number) => `Extra joules per additional m/s at speed ${u0}`,
  },
]

function generatePower(): WordProblem {
  const theme = pick(powerThemes)
  const n = pick([2, 3])
  const k = n === 3 ? pick([1, 2]) : pick([0.5, 1, 2])
  const u0 = randInt(3, 8)
  const expected = k * n * u0 ** (n - 1)

  return {
    id: uniqueId('a2-power'),
    topicId: 'a2-power',
    title: theme.title,
    prompt: theme.prompt(u0),
    given: `${theme.fnName}(${theme.sym}) = ${formatMonomial(k, n, theme.sym)}`,
    fields: [
      {
        kind: 'number',
        label: theme.label(u0),
        expected,
      },
    ],
    hint: 'How fast is this single term growing right at that input?',
  }
}

// ── Topic: Sum rule ─────────────────────────────────────────────────────────
const sumThemes = [
  {
    title: 'Boutique revenue',
    fnName: 'R',
    prompt:
      'A boutique models its weekly revenue (in dollars) when it stocks x featured items by the rule shown below. Write how much each extra item adds to revenue at stock level x.',
  },
  {
    title: 'Factory output',
    fnName: 'Q',
    prompt:
      'A factory models its daily output (in units) when it runs x extra machines by the rule shown below. Write how much each extra machine adds to output at level x.',
  },
  {
    title: 'App revenue',
    fnName: 'A',
    prompt:
      'A studio models its monthly revenue (in dollars) from x thousand installs by the rule shown below. Write how much each extra thousand installs adds at level x.',
  },
  {
    title: 'Toll income',
    fnName: 'T',
    prompt:
      'A toll road models its hourly income (in dollars) when x hundred cars pass by the rule shown below. Write how much each extra hundred cars adds at level x.',
  },
]

function generateSum(): WordProblem {
  const theme = pick(sumThemes)
  const c1 = randInt(1, 6)
  const c2 = randInt(1, 6)
  const c3 = randInt(1, 6)
  const c0 = randInt(0, 9)
  const coeffs = [c0, c1, c2, c3]
  const trueCoefficients = derivativeCoefficients(coeffs)

  return {
    id: uniqueId('a2-sum'),
    topicId: 'a2-sum',
    title: theme.title,
    prompt: theme.prompt,
    given: `${theme.fnName}(x) = ${formatPolynomial(coeffs)}`,
    fields: [
      {
        kind: 'expression',
        label: 'Amount each extra unit adds at level x (expression in x)',
        trueCoefficients,
        placeholder: 'polynomial in x',
      },
    ],
    hint: 'Handle each term on its own, then add the pieces.',
  }
}

// ── Topic: Chain rule ───────────────────────────────────────────────────────
const chainThemes = [
  {
    title: 'Nitro meter',
    fnName: 'N',
    prompt:
      "A racing game's nitro energy meter reads the rule shown below when the boost dial is set to x. Write how fast the reading changes as x changes.",
  },
  {
    title: 'Packed tent volume',
    fnName: 'V',
    prompt:
      'A pop-up tent packs to the volume shown below (in liters) at frame setting x. Write how fast the packed volume changes as x changes.',
  },
  {
    title: 'Signal strength',
    fnName: 'S',
    prompt:
      "A receiver's signal strength follows the rule shown below at gain level x. Write how fast the strength changes as x changes.",
  },
  {
    title: 'Lens zoom area',
    fnName: 'A',
    prompt:
      'A camera lens covers the focus area shown below (in square millimeters) at zoom ring position x. Write how fast the area changes as x changes.',
  },
]

function generateChain(): WordProblem {
  const theme = pick(chainThemes)
  const a = randInt(1, 4)
  const b = randInt(1, 4)
  const n = pick([2, 3])
  const trueCoefficients =
    n === 2 ? [2 * a * b, 2 * a * a] : [3 * a * b * b, 6 * a * a * b, 3 * a * a * a]

  return {
    id: uniqueId('a2-chain'),
    topicId: 'a2-chain',
    title: theme.title,
    prompt: theme.prompt,
    given: `${theme.fnName}(x) = (${formatMonomial(a, 1)} + ${b})${superscript(n)}`,
    fields: [
      {
        kind: 'expression',
        label: 'Rate of change (expression in x)',
        trueCoefficients,
        placeholder: 'polynomial in x',
      },
    ],
    hint: 'Differentiate the outer power, then multiply by how fast the inside changes.',
  }
}

// ── Topic: Matching the average ─────────────────────────────────────────────
const mvtThemes = [
  {
    title: 'Speed camera zone',
    fnName: 'd',
    prompt: (p: number, q: number) =>
      `On a monitored highway stretch, the distance a car has covered (in meters) after x seconds follows the rule shown below, tracked between x = ${p} and x = ${q} seconds.`,
  },
  {
    title: 'Freight elevator',
    fnName: 'h',
    prompt: (p: number, q: number) =>
      `A freight elevator's height (in meters) after x seconds follows the rule shown below, observed between x = ${p} and x = ${q} seconds.`,
  },
  {
    title: 'Conveyor travel',
    fnName: 's',
    prompt: (p: number, q: number) =>
      `A box on a conveyor has traveled the distance (in meters) shown below after x seconds, watched between x = ${p} and x = ${q} seconds.`,
  },
  {
    title: 'Drone travel',
    fnName: 'x',
    prompt: (p: number, q: number) =>
      `A drone's horizontal travel (in meters) after x seconds follows the rule shown below, logged between x = ${p} and x = ${q} seconds.`,
  },
]

function generateMvt(): WordProblem {
  const theme = pick(mvtThemes)
  const a = pick([1, 2, 3])
  const p = randInt(0, 2)
  const q = p + pick([2, 4])
  const average = a * (p + q)
  const moment = (p + q) / 2

  return {
    id: uniqueId('a2-mvt'),
    topicId: 'a2-mvt',
    title: theme.title,
    prompt: theme.prompt(p, q),
    given: `${theme.fnName}(x) = ${formatMonomial(a, 2)}   on   [${p}, ${q}]`,
    fields: [
      {
        kind: 'number',
        label: 'Average rate across the zone',
        expected: average,
      },
      {
        kind: 'number',
        label: 'The single moment it equals that (x = ?)',
        expected: moment,
      },
    ],
    hint: 'Find the overall average first, then find where the instantaneous speed equals that average.',
  }
}

// ── Topic: Combining the rules ──────────────────────────────────────────────
const combineThemes = [
  {
    title: 'Spaceship power',
    fnName: 'P',
    prompt:
      'A spaceship draws total power (in kilowatts) at throttle x as a cell stage plus a reactor stage, shown below. Write how fast the total power changes as x changes.',
  },
  {
    title: 'Robot energy',
    fnName: 'E',
    prompt:
      'A factory robot uses total energy (in joules) at effort x from a drive stage plus a booster stage, shown below. Write how fast the total energy changes as x changes.',
  },
  {
    title: 'Data center load',
    fnName: 'L',
    prompt:
      'A data center carries total load (in units) at demand x from a base stage plus a burst stage, shown below. Write how fast the total load changes as x changes.',
  },
  {
    title: 'Hybrid car power',
    fnName: 'P',
    prompt:
      'A hybrid car delivers total power (in kilowatts) at pedal position x from a motor stage plus an engine stage, shown below. Write how fast the total power changes as x changes.',
  },
]

function generateCombine(): WordProblem {
  const theme = pick(combineThemes)
  const a = randInt(1, 3)
  const b = randInt(1, 3)
  const n = pick([2, 3])
  const c = randInt(1, 3)
  const m = pick([2, 3])

  const chainDeriv =
    n === 2 ? [2 * a * b, 2 * a * a] : [3 * a * b * b, 6 * a * a * b, 3 * a * a * a]
  const powerDeriv = m === 2 ? [0, 2 * c] : [0, 0, 3 * c]
  const trueCoefficients = addCoeffs(chainDeriv, powerDeriv)

  return {
    id: uniqueId('a2-combine'),
    topicId: 'a2-combine',
    title: theme.title,
    prompt: theme.prompt,
    given: `${theme.fnName}(x) = (${formatMonomial(a, 1)} + ${b})${superscript(n)} + ${formatMonomial(c, m)}`,
    fields: [
      {
        kind: 'expression',
        label: 'Total rate of change (expression in x)',
        trueCoefficients,
        placeholder: 'polynomial in x',
      },
    ],
    hint: 'Break it into two pieces, find how fast each changes, then add.',
  }
}

const topics: ApplicationTopicDef[] = [
  { id: 'a2-power', label: 'Power rule', generate: generatePower },
  { id: 'a2-sum', label: 'Sum rule', generate: generateSum },
  { id: 'a2-chain', label: 'Chain rule', generate: generateChain },
  { id: 'a2-mvt', label: 'Matching the average', generate: generateMvt },
  { id: 'a2-combine', label: 'Combining the rules', generate: generateCombine },
]

export const lesson2Applications: ApplicationLessonGroup = {
  lessonId: 'derivative-rules',
  lessonTitle: 'Rules of Derivatives',
  topics,
}
