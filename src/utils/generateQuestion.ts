import type { ProblemSlide, RelatedRatesProblem, RelatedRatesShape } from '../types/lesson'
import {
  derivativeCoefficients,
  evaluateDerivative,
  interpolatePolynomial,
} from './polynomial'
import { mulberry32 } from './random'

type QuestionKind = 'greatest' | 'zoom' | 'tangent' | 'critical'

/** A source of random floats in [0, 1). Defaults to Math.random when unseeded. */
type Rng = () => number

function pick<T>(values: T[], rng: Rng): T {
  return values[Math.floor(rng() * values.length)]
}

function shuffle<T>(values: T[], rng: Rng): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Build an RNG from an optional seed; unseeded falls back to Math.random. */
function rngFromSeed(seed?: number): Rng {
  return seed === undefined ? Math.random : mulberry32(seed)
}

/** Integer-padded y-bounds of a polynomial over [xMin, xMax]. */
function curveBounds(coefficients: number[], xMin: number, xMax: number, pad = 0.5) {
  let lo = Infinity
  let hi = -Infinity
  const steps = 80
  for (let i = 0; i <= steps; i++) {
    const x = xMin + ((xMax - xMin) * i) / steps
    const y = coefficients.reduce((sum, c, power) => sum + c * x ** power, 0)
    lo = Math.min(lo, y)
    hi = Math.max(hi, y)
  }
  return { yMin: Math.floor(lo - pad), yMax: Math.ceil(hi + pad) }
}

/** A cubic through 4 labeled points with a clear, positive steepest slope. */
function generateGreatest(id: string, rng: Rng): ProblemSlide {
  const labels = ['A', 'B', 'C', 'D']

  // Non-overlapping slots keep the four x-positions strictly increasing and
  // comfortably spread across the viewport while still randomizing each one.
  const slots: [number, number][] = [
    [-1.8, -0.9],
    [-0.4, 0.6],
    [1.1, 2.0],
    [2.5, 3.6],
  ]
  const pickXs = () =>
    slots.map(([lo, hi]) => Math.round((lo + rng() * (hi - lo)) * 10) / 10)
  const pickYs = () => Array.from({ length: 4 }, () => Math.floor(rng() * 9)) // 0..8

  // Replicate exactly how the component finds the steepest point: interpolate a
  // cubic through the four points and compare f'(x) at each x. Require one point
  // to be unambiguously steepest (margin >= 1.5, a clear visual gap between the
  // two steepest arrows) and clearly increasing (steepest > 1.0). Track the best
  // vetted candidate seen — among sets whose steepest derivative is positive, so
  // the steepest point is always genuinely unique — and fall back to it if no
  // set clears the strict threshold, so we always return a gradeable problem.
  let xs = pickXs()
  let ys = pickYs()
  let bestXs = xs
  let bestYs = ys
  let bestMargin = -Infinity
  for (let attempt = 0; attempt < 200; attempt++) {
    const coeffs = interpolatePolynomial(xs.map((x, i) => ({ x, y: ys[i] })))
    const derivs = xs.map((x) => evaluateDerivative(coeffs, x))
    const sorted = [...derivs].sort((a, b) => b - a)
    const steepest = sorted[0]
    const margin = sorted[0] - sorted[1]
    if (steepest > 0 && margin > bestMargin) {
      bestMargin = margin
      bestXs = xs
      bestYs = ys
    }
    if (steepest > 1.0 && margin >= 1.5) break
    xs = pickXs()
    ys = pickYs()
  }
  xs = bestXs
  ys = bestYs

  const xMin = Math.floor(Math.min(...xs) - 1)
  const xMax = Math.ceil(Math.max(...xs) + 1)
  const yMin = Math.min(...ys) - 2
  const yMax = Math.max(...ys) + 2

  return {
    id,
    type: 'problem',
    component: 'greatestDerivative',
    title: 'Where is the derivative greatest?',
    body: 'Tap the point where the function is increasing fastest.',
    config: {
      viewport: { xMin, xMax, yMin, yMax },
      options: labels.map((label, i) => ({ label, x: xs[i], y: ys[i] })),
    },
    feedback: {
      correct:
        'Notice how at {correct answer}, the arrow is more steeply pointed up than at {point}. Therefore, the greatest derivative is at {correct answer}',
      wrong: 'There is a point more steep than {point}',
    },
    attempts: 'unlimited',
  }
}

/** Gentle quadratic with a clean derivative m at an integer point. */
function buildQuadratic(rng: Rng) {
  // targetX stays an integer so the zoom slide's grid-snapped label (minor grid
  // step 0.2) reads exactly on the marked point. Vary curvature, sign, the clean
  // (half-step) slope, and the height of the marked point for a wide problem set.
  const targetX = pick([1, 2, 3], rng)
  // Curvature is restricted to EXACT binary fractions (and an optional sign).
  // With an integer targetX, every product a*targetX^k is then exact in IEEE-754,
  // so evaluatePoly(coefficients, targetX) equals the integer targetY with zero
  // float error. The secant→tangent slide renders that raw value as the fixed
  // point's label, so this avoids artifacts like "(2, 2.9999999996)". (0.2/0.3
  // are NOT exact binary fractions and would reintroduce the artifact.)
  const a = pick([0.25, 0.5, 0.125, 0.75], rng) * pick([1, -1], rng)
  // Slopes are multiples of 0.5 so the answer is enterable within tolerance 0.15;
  // f'(targetX) is forced to exactly this value below.
  const m = pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2], rng)
  const b = m - 2 * a * targetX
  const targetY = pick([1, 2, 3, 4], rng)
  const c = targetY - a * targetX * targetX - b * targetX
  return { coefficients: [c, b, a], targetX, targetY, slope: m }
}

function generateZoom(id: string, rng: Rng): ProblemSlide {
  const { coefficients, targetX } = buildQuadratic(rng)
  const xMin = targetX - 3
  const xMax = targetX + 3
  const { yMin, yMax } = curveBounds(coefficients, xMin, xMax)

  return {
    id,
    type: 'problem',
    component: 'secantZoomDerivative',
    title: 'Estimate the derivative',
    body: 'Zoom in on the marked point. When the curve looks straight, estimate its slope.',
    config: {
      coefficients,
      viewport: { xMin, xMax, yMin, yMax },
      targetX,
      referenceX: targetX + 0.4,
      minorGridStep: 0.2,
      zoomLevels: 5,
      tolerance: 0.15,
    },
    feedback: {
      correct: '',
      wrong: 'Look again at {x value to find derivative at}. Zoom in until the curve is nearly straight, then read its slope.',
    },
    attempts: 'unlimited',
  }
}

function generateTangent(id: string, rng: Rng): ProblemSlide {
  const { coefficients, targetX } = buildQuadratic(rng)
  const xMin = targetX - 2
  const xMax = targetX + 3
  const { yMin, yMax } = curveBounds(coefficients, xMin, xMax)

  return {
    id,
    type: 'problem',
    component: 'secantToTangent',
    title: 'Approach the fixed point',
    body: 'Drag point P toward the fixed point. When the two points are very close, the secant slope approximates the derivative.',
    config: {
      coefficients,
      viewport: { xMin, xMax, yMin, yMax },
      targetX,
      initialVariableX: targetX + 1.5,
      minorGridStep: 0.2,
      coincidentThreshold: 0.08,
      tolerance: 0.15,
    },
    feedback: {
      correct: '',
      wrong: 'Drag P closer to the fixed point, then estimate the slope of the secant line.',
    },
    attempts: 'unlimited',
  }
}

/** Cubic with two clean critical points (a max and a min). */
function generateCritical(id: string, rng: Rng): ProblemSlide {
  // f'(x) = a(x - r1)(x - r2). Roots are separated by gap >= 1.5, far more than
  // 2 * selectTolerance (0.5), so the two zeros never share a tap window.
  const r1 = pick([-1, -0.5, 0, 0.5, 1], rng)
  const gap = pick([1.5, 2, 2.5], rng)
  const r2 = r1 + gap
  const a = pick([0.5, 0.75, 1], rng) * pick([1, -1], rng)
  const c0 = pick([-1, 0, 1, 2], rng)

  // Integrate f'(x) = a(x - r1)(x - r2) for f(x) (low-to-high coefficients).
  const coefficients = [c0, a * r1 * r2, (-a * (r1 + r2)) / 2, a / 3]
  const derivativeCoeffs = derivativeCoefficients(coefficients)

  // a > 0 rises before r1 (max), dips between, rises after r2 (min); a < 0 flips
  // which root is the max and which is the min.
  const firstType: 'max' | 'min' = a > 0 ? 'max' : 'min'
  const secondType: 'max' | 'min' = a > 0 ? 'min' : 'max'

  // Fit both graphs and keep both roots comfortably inside the viewport.
  const xMin = Math.floor(r1 - 1)
  const xMax = Math.ceil(r2 + 1)
  const fBounds = curveBounds(coefficients, xMin, xMax)
  const dBounds = curveBounds(derivativeCoeffs, xMin, xMax, 0.4)

  return {
    id,
    type: 'problem',
    component: 'derivativeCriticalPoints',
    title: 'Find every critical point',
    body: "The lower graph shows f\u2032(x). Tap every x-value where f\u2032(x) = 0 — those are the critical points of f.",
    config: {
      coefficients,
      viewport: { xMin, xMax, yMin: fBounds.yMin, yMax: fBounds.yMax },
      derivativeViewport: {
        xMin,
        xMax,
        yMin: Math.min(dBounds.yMin, 0),
        yMax: Math.max(dBounds.yMax, 0),
      },
      criticalPoints: [
        { x: r1, type: firstType },
        { x: r2, type: secondType },
      ],
      selectTolerance: 0.25,
    },
    feedback: {
      correct: '',
      wrong: 'Find every x where f\u2032(x) = 0 on the derivative graph. Tap each zero crossing.',
    },
    attempts: 'unlimited',
  }
}

function generateByKind(kind: QuestionKind, id: string, rng: Rng): ProblemSlide {
  switch (kind) {
    case 'greatest':
      return generateGreatest(id, rng)
    case 'zoom':
      return generateZoom(id, rng)
    case 'tangent':
      return generateTangent(id, rng)
    case 'critical':
      return generateCritical(id, rng)
  }
}

const ALL_KINDS: QuestionKind[] = ['greatest', 'zoom', 'tangent', 'critical']

/**
 * Pick `count` distinct problem types and generate fresh polynomials for each.
 * Pass a `seed` to make the set reproducible (so a resumed lesson shows the
 * same questions at the same indices).
 */
export function generateEndingQuestions(count: number, seed?: number): ProblemSlide[] {
  const rng = rngFromSeed(seed)
  const chosen = shuffle(ALL_KINDS, rng).slice(0, count)
  return chosen.map((kind, i) => generateByKind(kind, `ending-${i}-${kind}`, rng))
}

/** A selectable Lesson 1 practice topic. */
export type PracticeTopic = QuestionKind

/** Lesson 1 practice topics in display order (label shown on the chips). */
export const PRACTICE_TOPICS: { id: PracticeTopic; label: string }[] = [
  { id: 'greatest', label: 'Greatest slope' },
  { id: 'zoom', label: 'Estimate the derivative' },
  { id: 'tangent', label: 'Secant → tangent' },
  { id: 'critical', label: 'Critical points' },
]

let practiceSeq = 0

/**
 * Generate one Lesson 1 practice problem with a fresh random polynomial.
 * Omit `kind` (or pass undefined) for a random "mixed" topic. Each call is
 * unseeded (Math.random) and gets a unique id so it remounts cleanly.
 */
export function generatePracticeProblem(kind?: PracticeTopic): ProblemSlide {
  const rng = rngFromSeed()
  const chosen = kind ?? pick(ALL_KINDS, rng)
  practiceSeq += 1
  return generateByKind(chosen, `practice-${chosen}-${practiceSeq}`, rng)
}

// --- Lesson 3 review questions ---

const SUPERSCRIPTS: Record<string, string> = {
  '0': '\u2070',
  '1': '\u00b9',
  '2': '\u00b2',
  '3': '\u00b3',
  '4': '\u2074',
  '5': '\u2075',
  '6': '\u2076',
  '7': '\u2077',
  '8': '\u2078',
  '9': '\u2079',
}

function superscript(power: number): string {
  return String(power)
    .split('')
    .map((d) => SUPERSCRIPTS[d] ?? d)
    .join('')
}

/** Format a polynomial (low-to-high coefficients) in t with unicode superscripts. */
function formatPolynomialT(coefficients: number[]): string {
  const parts: string[] = []
  for (let power = coefficients.length - 1; power >= 0; power--) {
    const c = coefficients[power]
    if (c === 0) continue
    const abs = Math.abs(c)
    let term: string
    if (power === 0) term = `${abs}`
    else {
      const coeffStr = abs === 1 ? '' : `${abs}`
      const varStr = power === 1 ? 't' : `t${superscript(power)}`
      term = `${coeffStr}${varStr}`
    }
    if (parts.length === 0) parts.push(c < 0 ? `-${term}` : term)
    else parts.push(c < 0 ? `\u2212 ${term}` : `+ ${term}`)
  }
  return parts.length > 0 ? parts.join(' ') : '0'
}

/** Build a related-rates problem deterministically from an RNG. */
export function buildRelatedRatesProblem(rng: Rng = Math.random): RelatedRatesProblem {
  const shape = pick<RelatedRatesShape>(['sphere', 'square', 'cube'], rng)
  const size = 2 + Math.floor(rng() * 4) // 2..5
  const rate = 1 + Math.floor(rng() * 4) // 1..4

  if (shape === 'sphere') {
    return {
      shape,
      prompt: `A sphere's radius grows at dr/dt = ${rate} cm/s. At r = ${size} cm, how fast is its volume changing?`,
      scaffold: 'dV/dt = (dV/dr)(dr/dt),  with  dV/dr = 4πr²',
      exact: 4 * Math.PI * size * size * rate,
      measureUnit: 'cm³/s',
      hint: `dV/dr = 4πr² = 4π·${size}². Multiply by dr/dt = ${rate}. You can answer with π.`,
    }
  }
  if (shape === 'square') {
    return {
      shape,
      prompt: `A square's side grows at ds/dt = ${rate} cm/s. At s = ${size} cm, how fast is its area changing?`,
      scaffold: 'dA/dt = (dA/ds)(ds/dt),  with  dA/ds = 2s',
      exact: 2 * size * rate,
      measureUnit: 'cm²/s',
      hint: `dA/ds = 2s = 2·${size}. Multiply by ds/dt = ${rate}.`,
    }
  }
  return {
    shape,
    prompt: `A cube's edge grows at ds/dt = ${rate} cm/s. At s = ${size} cm, how fast is its volume changing?`,
    scaffold: 'dV/dt = (dV/ds)(ds/dt),  with  dV/ds = 3s²',
    exact: 3 * size * size * rate,
    measureUnit: 'cm³/s',
    hint: `dV/ds = 3s² = 3·${size}². Multiply by ds/dt = ${rate}.`,
  }
}

/** A related-rates question; the problem is fixed at generation time. */
function makeRelatedRatesQuestion(id: string, rng: Rng): ProblemSlide {
  return {
    id,
    type: 'problem',
    component: 'relatedRates',
    title: 'Relate the rates',
    body: 'Differentiate the measure with respect to the changing dimension, then multiply by the given rate.',
    config: { problem: buildRelatedRatesProblem(rng) },
    feedback: { correct: '', wrong: '' },
    attempts: 'unlimited',
  }
}

/** A kinematics question: random position s(t); ask acceleration at t0. */
function makeKinematicsQuestion(id: string, rng: Rng): ProblemSlide {
  const a = pick([1, 2], rng)
  const b = pick([1, 2, 3], rng)
  const c = pick([0, 1, 2], rng)
  const coefficients = [0, c, b, a] // s(t) = a t³ + b t² + c t
  const t0 = pick([1, 2, 3], rng)
  const tMax = Math.max(4, t0 + 1)

  return {
    id,
    type: 'problem',
    component: 'secondDerivative',
    title: 'Find the acceleration',
    body: 'Acceleration is the second derivative of position. Differentiate twice, then plug in the time.',
    config: {
      coefficients,
      display: formatPolynomialT(coefficients),
      t0,
      tMax,
      unit: 'm',
      prompt: `Acceleration at t = ${t0} (m/s²)`,
      placeholder: 'enter a number',
    },
    feedback: {
      correct: '',
      wrong: 'a(t) = s″(t). Differentiate the position twice, then substitute the time.',
    },
    attempts: 'unlimited',
  }
}

/**
 * Two on-topic review questions: one related-rates, one kinematics. Pass a
 * `seed` to make the set reproducible across reloads.
 */
export function generateLesson3Questions(count: number, seed?: number): ProblemSlide[] {
  const rng = rngFromSeed(seed)
  const builders = [makeRelatedRatesQuestion, makeKinematicsQuestion]
  return Array.from({ length: count }, (_, i) =>
    builders[i % builders.length](`l3-review-${i}`, rng),
  )
}
