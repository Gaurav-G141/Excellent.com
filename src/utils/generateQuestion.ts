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
  const xs = [-1, 0.5, 2, 3.2]
  const labels = ['A', 'B', 'C', 'D']

  let ys = xs.map(() => Math.round(rng() * 7))
  for (let attempt = 0; attempt < 60; attempt++) {
    const coeffs = interpolatePolynomial(xs.map((x, i) => ({ x, y: ys[i] })))
    const derivs = xs.map((x) => evaluateDerivative(coeffs, x))
    const sorted = [...derivs].sort((a, b) => b - a)
    if (sorted[0] > 0.5 && sorted[0] - sorted[1] > 0.8) break
    ys = xs.map(() => Math.round(rng() * 7))
  }

  return {
    id,
    type: 'problem',
    component: 'greatestDerivative',
    title: 'Where is the derivative greatest?',
    body: 'Tap the point where the function is increasing fastest.',
    config: {
      viewport: { xMin: -2, xMax: 4, yMin: -2, yMax: 8 },
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
  const targetX = pick([1, 2], rng)
  const m = pick([0.5, 1, 1.5, 2], rng)
  const a = 0.25
  const b = m - 2 * a * targetX
  const targetY = pick([2, 3], rng)
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

/** Cubic with two clean critical points (a max then a min). */
function generateCritical(id: string, rng: Rng): ProblemSlide {
  const r1 = pick([0.5, 1], rng)
  const r2 = pick([2, 2.5], rng)
  const a = pick([0.5, 1], rng)
  const c0 = 2

  // f'(x) = a(x - r1)(x - r2)  ⇒  integrate for f(x)
  const coefficients = [c0, a * r1 * r2, (-a * (r1 + r2)) / 2, a / 3]
  const derivativeCoeffs = derivativeCoefficients(coefficients)

  const xMin = 0
  const xMax = 3
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
        { x: r1, type: 'max' },
        { x: r2, type: 'min' },
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

/**
 * Pick `count` distinct problem types and generate fresh polynomials for each.
 * Pass a `seed` to make the set reproducible (so a resumed lesson shows the
 * same questions at the same indices).
 */
export function generateEndingQuestions(count: number, seed?: number): ProblemSlide[] {
  const rng = rngFromSeed(seed)
  const kinds: QuestionKind[] = ['greatest', 'zoom', 'tangent', 'critical']
  const chosen = shuffle(kinds, rng).slice(0, count)
  return chosen.map((kind, i) => generateByKind(kind, `ending-${i}-${kind}`, rng))
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
