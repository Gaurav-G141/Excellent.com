import type { ProblemSlide } from '../types/lesson'
import {
  derivativeCoefficients,
  evaluateDerivative,
  interpolatePolynomial,
} from './polynomial'

type QuestionKind = 'greatest' | 'zoom' | 'tangent' | 'critical'

function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)]
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
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
function generateGreatest(id: string): ProblemSlide {
  const xs = [-1, 0.5, 2, 3.2]
  const labels = ['A', 'B', 'C', 'D']

  let ys = xs.map(() => Math.round(Math.random() * 7))
  for (let attempt = 0; attempt < 60; attempt++) {
    const coeffs = interpolatePolynomial(xs.map((x, i) => ({ x, y: ys[i] })))
    const derivs = xs.map((x) => evaluateDerivative(coeffs, x))
    const sorted = [...derivs].sort((a, b) => b - a)
    if (sorted[0] > 0.5 && sorted[0] - sorted[1] > 0.8) break
    ys = xs.map(() => Math.round(Math.random() * 7))
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
      correct: '',
      wrong: 'At {correct answer}, the curve climbs more steeply than at {answer}. The greatest derivative is at {correct answer}.',
    },
    attempts: 'unlimited',
  }
}

/** Gentle quadratic with a clean derivative m at an integer point. */
function buildQuadratic() {
  const targetX = pick([1, 2])
  const m = pick([0.5, 1, 1.5, 2])
  const a = 0.25
  const b = m - 2 * a * targetX
  const targetY = pick([2, 3])
  const c = targetY - a * targetX * targetX - b * targetX
  return { coefficients: [c, b, a], targetX, targetY, slope: m }
}

function generateZoom(id: string): ProblemSlide {
  const { coefficients, targetX } = buildQuadratic()
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

function generateTangent(id: string): ProblemSlide {
  const { coefficients, targetX } = buildQuadratic()
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
function generateCritical(id: string): ProblemSlide {
  const r1 = pick([0.5, 1])
  const r2 = pick([2, 2.5])
  const a = pick([0.5, 1])
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

function generateByKind(kind: QuestionKind, id: string): ProblemSlide {
  switch (kind) {
    case 'greatest':
      return generateGreatest(id)
    case 'zoom':
      return generateZoom(id)
    case 'tangent':
      return generateTangent(id)
    case 'critical':
      return generateCritical(id)
  }
}

/** Pick `count` distinct problem types and generate fresh polynomials for each. */
export function generateEndingQuestions(count: number): ProblemSlide[] {
  const kinds: QuestionKind[] = ['greatest', 'zoom', 'tangent', 'critical']
  const chosen = shuffle(kinds).slice(0, count)
  return chosen.map((kind, i) => generateByKind(kind, `ending-${i}-${kind}`))
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

/** A related-rates question — the component randomizes its own shape and values. */
function makeRelatedRatesQuestion(id: string): ProblemSlide {
  return {
    id,
    type: 'problem',
    component: 'relatedRates',
    title: 'Relate the rates',
    body: 'Differentiate the measure with respect to the changing dimension, then multiply by the given rate.',
    config: {},
    feedback: { correct: '', wrong: '' },
    attempts: 'unlimited',
  }
}

/** A kinematics question: random position s(t); ask acceleration at t0. */
function makeKinematicsQuestion(id: string): ProblemSlide {
  const a = pick([1, 2])
  const b = pick([1, 2, 3])
  const c = pick([0, 1, 2])
  const coefficients = [0, c, b, a] // s(t) = a t³ + b t² + c t
  const t0 = pick([1, 2, 3])
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

/** Two on-topic review questions: one related-rates, one kinematics. */
export function generateLesson3Questions(count: number): ProblemSlide[] {
  const builders = [makeRelatedRatesQuestion, makeKinematicsQuestion]
  return Array.from({ length: count }, (_, i) =>
    builders[i % builders.length](`l3-review-${i}`),
  )
}
