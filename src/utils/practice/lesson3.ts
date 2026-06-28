import type {
  ProblemSlide,
  RelatedRatesProblem,
  RelatedRatesShape,
  Viewport,
} from '../../types/lesson'
import { buildRelatedRatesProblem } from '../generateQuestion'
import { evaluatePoly } from '../polynomial'
import { formatPolynomial, pick, randInt, uniqueId } from './helpers'
import type { PracticeLessonGroup } from './types'

/**
 * Topic 1 — Related rates.
 *
 * We keep delegating to the shared `buildRelatedRatesProblem` (which guarantees
 * a correct `exact` rate) part of the time, but also build extra problems of the
 * SAME `RelatedRatesProblem` shape across the three supported shapes with wider
 * size/rate ranges so the parameter space is much larger. The derivation panel
 * in the slide is keyed off `shape`, so every problem we build here matches the
 * derivation the component will display:
 *   - sphere: V = 4/3·πr³  →  dV/dt = 4πr²·(dr/dt)
 *   - square: A = s²       →  dA/dt = 2s·(ds/dt)
 *   - cube:   V = s³       →  dV/dt = 3s²·(ds/dt)
 */
function buildVariedRelatedRates(): RelatedRatesProblem {
  // Occasionally fall back to the shared builder for its exact phrasing.
  if (Math.random() < 0.3) return buildRelatedRatesProblem(Math.random)

  const shape = pick<RelatedRatesShape>(['sphere', 'square', 'cube'])
  const size = randInt(2, 8)
  const rate = randInt(1, 5)

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

function generateRelatedRates(): ProblemSlide {
  return {
    id: uniqueId('l3-related'),
    type: 'problem',
    component: 'relatedRates',
    title: 'Relate the rates',
    body: 'Differentiate the measure with respect to its changing dimension, then multiply by the given rate.',
    config: { problem: buildVariedRelatedRates() },
    feedback: {
      correct: '',
      wrong: 'Differentiate the measure with respect to its dimension, then multiply by the given rate.',
    },
    attempts: 'unlimited',
  }
}

/**
 * Topic 2 — Acceleration as the second derivative of a general position s(t).
 *
 * s(t) is a degree-3 OR degree-4 polynomial with a zero constant term (so the
 * bug starts at position 0). The leading coefficient is always non-zero, so the
 * `display` is never "0", and coefficients stay small so the acceleration value
 * is reasonable. The component computes s″(t0) itself, so we only supply the
 * coefficients.
 */
function generateAcceleration(): ProblemSlide {
  const degree = pick([3, 4])
  const c1 = randInt(0, 3)
  const c2 = randInt(0, 3)
  const c3 = degree === 3 ? pick([1, 2]) : randInt(0, 3)
  const coefficients = degree === 3 ? [0, c1, c2, c3] : [0, c1, c2, c3, pick([1, 2])]

  const t0 = randInt(1, 4)
  const tMax = Math.max(t0 + 1, 4)
  const display = formatPolynomial(coefficients, 't')

  return {
    id: uniqueId('l3-accel'),
    type: 'problem',
    component: 'secondDerivative',
    title: 'Acceleration at an instant',
    body: "The bug's position along the track is s(t). Find its acceleration at the given time.",
    config: {
      coefficients,
      display,
      t0,
      tMax,
      unit: 'm',
      prompt: `Acceleration at t = ${t0} (m/s²)`,
      placeholder: 'enter a number',
    },
    feedback: {
      correct: '',
      wrong: 'a(t) = s\u2033(t). Differentiate s(t) twice, then substitute the time.',
    },
    attempts: 'unlimited',
  }
}

interface IvtParams {
  coefficients: number[]
  ax: number
  bx: number
  guaranteedValue: number
  distractors: number[]
  viewport: Viewport
}

/**
 * Build a well-posed IVT problem on a general quadratic/cubic, or return null so
 * the caller can retry. Invariants guaranteed when non-null:
 *   - fa, fb are integers (integer coeffs + integer endpoints),
 *   - guaranteedValue is an integer STRICTLY between min(fa,fb) and max(fa,fb),
 *   - both distractors are integers STRICTLY outside [min(fa,fb), max(fa,fb)],
 *   - all three option values are distinct.
 */
function tryBuildIvt(): IvtParams | null {
  // Favour quadratics (3:1) — they keep the curve's vertical span tame far more
  // reliably than cubics, which is what lets us hit `yMax - yMin <= 20` often.
  const degree = pick([2, 2, 2, 3])
  // Small leading coefficients (|a| = 1) so the curve does not shoot off-screen.
  const leading = pick([1, -1])

  const coefficients: number[] = []
  coefficients[0] = randInt(-3, 3) // constant
  coefficients[1] = randInt(-2, 2) // linear (tightened)
  if (degree === 2) {
    coefficients[2] = leading
  } else {
    coefficients[2] = randInt(-1, 1) // quadratic term (tightened)
    coefficients[3] = leading
  }

  // Narrow integer intervals keep the sampled y-range small; cubics get the
  // tightest widths since they grow fastest.
  const ax = randInt(-2, 1)
  const bx = ax + (degree === 3 ? randInt(2, 3) : randInt(2, 4)) // width 2..4 (2..3 for cubics)

  const fa = evaluatePoly(coefficients, ax)
  const fb = evaluatePoly(coefficients, bx)
  if (!Number.isInteger(fa) || !Number.isInteger(fb)) return null

  const lo = Math.min(fa, fb)
  const hi = Math.max(fa, fb)
  // Need room for an interior integer plus separation so the question reads well.
  if (hi - lo < 3) return null

  const guaranteedValue = randInt(lo + 1, hi - 1)
  const distractors = [lo - pick([1, 2, 3]), hi + pick([1, 2, 3])]

  // Sanity: all distinct and strictly outside (true by construction, but assert).
  const all = [guaranteedValue, ...distractors]
  if (new Set(all).size !== all.length) return null
  if (distractors[0] >= lo || distractors[1] <= hi) return null

  // Fit the viewport to the curve over [ax-1, bx+1] with padding.
  let yLo = Infinity
  let yHi = -Infinity
  const xLo = ax - 1
  const xHi = bx + 1
  for (let i = 0; i <= 60; i++) {
    const x = xLo + ((xHi - xLo) * i) / 60
    const y = evaluatePoly(coefficients, x)
    yLo = Math.min(yLo, y)
    yHi = Math.max(yHi, y)
  }

  const viewport: Viewport = {
    xMin: xLo,
    xMax: xHi,
    yMin: Math.floor(yLo) - 1,
    yMax: Math.ceil(yHi) + 1,
  }

  // Keep the y-axis readable: reject anything whose final viewport spans more
  // than 20 units vertically (forces the caller to retry with new parameters).
  if (viewport.yMax - viewport.yMin > 20) return null

  return { coefficients, ax, bx, guaranteedValue, distractors, viewport }
}

/** Topic 3 — Intermediate Value Theorem on a general quadratic/cubic. */
function generateIvt(): ProblemSlide {
  let params: IvtParams | null = null
  for (let i = 0; i < 500 && !params; i++) {
    params = tryBuildIvt()
  }
  // Extremely unlikely fallback so we always return a valid, well-posed slide.
  // Self-consistent safe fallback: f(x) = x² on [0, 3].
  //   - Sampling over [ax-1, bx+1] = [-1, 4] gives yLo = 0 (vertex) and
  //     yHi = f(4) = 16, so yMin = floor(0)-1 = -1 and yMax = ceil(16)+1 = 17.
  //     Range = 17 - (-1) = 18 ≤ 20, and the viewport fully contains the curve.
  //   - f(0) = 0, f(3) = 9 ⇒ lo = 0, hi = 9 (hi - lo = 9 ≥ 3); both endpoints
  //     are integers. guaranteedValue ∈ [1, 8] is strictly inside (0, 9), and the
  //     distractors -1 and 11 are strictly outside [0, 9]; all three are distinct.
  if (!params) {
    const coefficients = [0, 0, 1] // f(x) = x²
    params = {
      coefficients,
      ax: 0,
      bx: 3,
      guaranteedValue: randInt(1, 8),
      distractors: [-1, 11],
      viewport: { xMin: -1, xMax: 4, yMin: -1, yMax: 17 },
    }
  }

  const { coefficients, ax, bx, guaranteedValue, distractors, viewport } = params

  return {
    id: uniqueId('l3-ivt'),
    type: 'problem',
    component: 'ivtProblem',
    title: 'Apply the Intermediate Value Theorem',
    body: 'Points A and B mark the start and end values. The function moves continuously from one to the other. Which value must it take somewhere in between?',
    config: {
      coefficients,
      viewport,
      ax,
      bx,
      guaranteedValue,
      distractors,
      cTolerance: 0.25,
      hideCurve: true,
    },
    feedback: {
      correct: '',
      wrong: 'The IVT only guarantees values that lie between f(a) and f(b).',
    },
    attempts: 'unlimited',
  }
}

export const lesson3Practice: PracticeLessonGroup = {
  lessonId: 'related-rates',
  lessonTitle: 'Related Rates and Motion',
  topics: [
    { id: 'l3-related', label: 'Related rates', generate: generateRelatedRates },
    { id: 'l3-accel', label: 'Acceleration', generate: generateAcceleration },
    { id: 'l3-ivt', label: 'Intermediate Value Theorem', generate: generateIvt },
  ],
}
