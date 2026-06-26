import type { ProblemSlide } from '../../types/lesson'
import { derivativeCoefficients, evaluatePoly } from '../polynomial'
import {
  formatMonomial,
  formatPolynomial,
  pick,
  randInt,
  shuffle,
  superscript,
  uniqueId,
} from './helpers'
import type { PracticeLessonGroup } from './types'

/** Topic 1 — Power rule, matched as four function/derivative pairs. */
function generatePowerMatch(): ProblemSlide {
  const pairs: { prompt: string; answer: string }[] = []
  const seenPrompts = new Set<string>()
  const seenAnswers = new Set<string>()

  // Build four distinct monomials whose derivatives are also distinct strings.
  while (pairs.length < 4) {
    const c = randInt(1, 6)
    const n = randInt(2, 6)
    const prompt = formatMonomial(c, n)
    const answer = formatMonomial(c * n, n - 1)
    if (seenPrompts.has(prompt) || seenAnswers.has(answer)) continue
    seenPrompts.add(prompt)
    seenAnswers.add(answer)
    pairs.push({ prompt, answer })
  }

  return {
    id: uniqueId('l2-power'),
    type: 'problem',
    component: 'dragMatch',
    title: 'Match each function to its derivative',
    body: 'Apply the power rule, then pair each function with the correct derivative.',
    config: { pairs },
    feedback: {
      correct: '',
      wrong: 'Some matches are off. Remember: the exponent comes down and the power drops by one.',
    },
    attempts: 'unlimited',
  }
}

/** Topic 2 — Sum rule, differentiate a genuine sum of power terms. */
function generateSum(): ProblemSlide {
  // Draw 2-4 distinct powers from {1,2,3,4} so it's really a sum, and ensure
  // at least two nonzero terms with power >= 1.
  const availablePowers = [1, 2, 3, 4]
  // Fisher–Yates shuffle in place.
  for (let i = availablePowers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[availablePowers[i], availablePowers[j]] = [availablePowers[j], availablePowers[i]]
  }
  const termCount = randInt(2, 4)
  const chosenPowers = availablePowers.slice(0, Math.max(2, termCount))

  const coefficients = [0, 0, 0, 0, 0]
  for (const p of chosenPowers) {
    coefficients[p] = randInt(1, 6)
  }
  // Optionally add a constant term (doesn't affect the derivative, but exercises grading).
  if (Math.random() < 0.5) {
    coefficients[0] = randInt(1, 6)
  }

  // Trim trailing zeros so formatPolynomial stays tidy.
  while (coefficients.length > 1 && coefficients[coefficients.length - 1] === 0) {
    coefficients.pop()
  }

  return {
    id: uniqueId('l2-sum'),
    type: 'problem',
    component: 'typeInDerivative',
    title: 'Differentiate the sum',
    body: 'Use the power rule on each term, then add. Any equivalent form is accepted.',
    config: {
      coefficients,
      display: formatPolynomial(coefficients),
      prompt: 'f\u2032(x) =',
      placeholder: 'type a polynomial in x',
    },
    feedback: {
      correct: '',
      wrong: 'Differentiate each term separately and add them up.',
    },
    attempts: 'unlimited',
  }
}

/** Topic 3 — Chain rule on (a·x + b)^p, expanded coefficients supplied. */
function generateChain(): ProblemSlide {
  const a = randInt(1, 4)
  const b = randInt(1, 5)
  const p = pick([2, 3])

  let coefficients: number[]
  if (p === 2) {
    // (ax + b)² = a²x² + 2ab·x + b²
    coefficients = [b * b, 2 * a * b, a * a]
  } else {
    // (ax + b)³ = a³x³ + 3a²b·x² + 3ab²·x + b³
    coefficients = [b * b * b, 3 * a * b * b, 3 * a * a * b, a * a * a]
  }

  const display = `(${formatMonomial(a, 1)} + ${b})${superscript(p)}`

  return {
    id: uniqueId('l2-chain'),
    type: 'problem',
    component: 'typeInDerivative',
    title: 'Differentiate the composite',
    body: 'Apply the chain rule. You can leave it factored or expand it. Either form is accepted.',
    config: {
      coefficients,
      display,
      prompt: 'f\u2032(x) =',
      placeholder: 'factored or expanded is fine',
    },
    feedback: {
      correct: '',
      wrong: 'Outer first, then multiply by the derivative of the inside.',
    },
    attempts: 'unlimited',
  }
}

/**
 * Topic 4 — Mean Value Theorem on a GENERAL cubic f(x) = A·x³ + B·x² + C·x + D.
 *
 * Built backwards so a clean, "findable" MVT point c is guaranteed:
 *   - f'(x) = 3A·x² + 2B·x + C
 *   - secant slope over [p, q]:  S = A(p² + pq + q²) + B(p + q) + C
 *   - MVT point c satisfies f'(c) = S, i.e. 3A·c² + 2B·c = A(p²+pq+q²) + B(p+q)
 *     ⇒ B = A·(p² + pq + q² − 3c²) / (2c − p − q)   (C and D cancel out, so they
 *       never affect which c works — only the viewport height).
 * Choosing c ≠ midpoint keeps the denominator nonzero. We additionally require the
 * FINAL viewport to be readable: yMax − yMin ≤ 20. To make that likely we keep the
 * interval narrow (width 2–3), A small (±0.25/±0.5), |B| ≤ 3 and a multiple of 0.25,
 * and C,D small. Every candidate is accepted only after re-deriving the exact
 * viewport range used below and confirming it is ≤ 20.
 */
function generateMvt(): ProblemSlide {
  // Safe fallback known to satisfy EVERY constraint:
  //   f(x) = 0.25x³ on [0, 2]. A=0.25, B=0 (multiple of 0.25, |B|≤3).
  //   Clean c: 0.75c² = 0.25·(0²+0·2+2²) ⇒ c² = 4/3 ⇒ c = √(4/3) ≈ 1.155, which is
  //   in (0, 2) and ≠ midpoint 1; f'(c) = 0.75·(4/3) = 1 = secant slope.
  //   Visible range [-1, 3]: f is increasing (f'=0.75x²≥0), so lo=f(-1)=-0.25,
  //   hi=f(3)=6.75 ⇒ yMin=floor(-0.75)=-1, yMax=ceil(7.25)=8 ⇒ range 9 ≤ 20.
  let coefficients: number[] = [0, 0, 0, 0.25]
  let p = 0
  let q = 2

  for (let attempt = 0; attempt < 500; attempt++) {
    const candP = randInt(-1, 2)
    const w = pick([2, 3])
    const candQ = candP + w
    const midpoint = (candP + candQ) / 2

    // Candidate "nice" interior points, excluding the midpoint (where B blows up).
    const candidates = [
      candP + 1,
      candQ - 1,
      candP + 0.5,
      candQ - 0.5,
      candP + 1.5,
      candQ - 1.5,
    ].filter((c) => c > candP && c < candQ && Math.abs(c - midpoint) > 1e-9)
    if (candidates.length === 0) continue

    const c = pick(candidates)
    const A = pick([0.25, -0.25, 0.5, -0.5])

    const numerator = A * (candP * candP + candP * candQ + candQ * candQ - 3 * c * c)
    const denominator = 2 * c - candP - candQ
    const B = numerator / denominator

    // Keep B a clean multiple of 0.25 and modest in size.
    if (Math.abs(B * 4 - Math.round(B * 4)) > 1e-9) continue
    if (Math.abs(B) > 3) continue

    const C = randInt(-2, 2)
    const D = randInt(-2, 2)
    const candidateCoefficients = [D, C, B, A]

    // Re-derive the exact viewport range used below and require it readable.
    const sampleMin = candP - 1
    const sampleMax = candQ + 1
    let candLo = Infinity
    let candHi = -Infinity
    for (let i = 0; i <= 60; i++) {
      const y = evaluatePoly(candidateCoefficients, sampleMin + ((sampleMax - sampleMin) * i) / 60)
      candLo = Math.min(candLo, y)
      candHi = Math.max(candHi, y)
    }
    const candYMin = Math.floor(candLo - 0.5)
    const candYMax = Math.ceil(candHi + 0.5)
    if (candYMax - candYMin > 20) continue

    coefficients = candidateCoefficients
    p = candP
    q = candQ
    break
  }

  const ax = p
  const bx = q

  // Fit the viewport to the curve across the visible range, with a little pad.
  const xMin = p - 1
  const xMax = q + 1
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i <= 60; i++) {
    const y = evaluatePoly(coefficients, xMin + ((xMax - xMin) * i) / 60)
    lo = Math.min(lo, y)
    hi = Math.max(hi, y)
  }

  return {
    id: uniqueId('l2-mvt'),
    type: 'problem',
    component: 'mvtMultiPart',
    title: 'Apply the Mean Value Theorem',
    body: 'Points A and B sit on the curve. Use the given f(x) and f\u2032(x) equations to work through the two parts.',
    config: {
      coefficients,
      viewport: {
        xMin,
        xMax,
        yMin: Math.floor(lo - 0.5),
        yMax: Math.ceil(hi + 0.5),
      },
      ax,
      bx,
      functionDisplay: formatPolynomial(coefficients),
      derivativeDisplay: formatPolynomial(derivativeCoefficients(coefficients)),
      slopeTolerance: 0.1,
      cTolerance: 0.2,
      derivativeTolerance: 0.12,
    },
    feedback: {
      correct: '',
      wrong: 'Recall that secant slope = (f(b) \u2212 f(a)) / (b \u2212 a)',
    },
    attempts: 'unlimited',
  }
}

/**
 * Topic 5 — Combine chain, power, and sum rules on a randomly-structured
 * composite: a chain term (a·x + b)^p (p ∈ {2, 3}) PLUS 1–2 extra power terms
 * Σ kᵢ·x^(eᵢ) with distinct exponents.
 *
 * The expanded `coefficients` array is the single source of truth, built
 * programmatically; the `display` string is assembled from the very same a, b,
 * p, and (kᵢ, eᵢ) pieces, so the shown expression and `coefficients` are
 * guaranteed to be the SAME polynomial.
 */
function generateCombine(): ProblemSlide {
  const a = randInt(1, 3)
  const b = randInt(1, 4)
  const p = pick([2, 3])

  // 1. Binomial expansion of (a·x + b)^p, low-to-high (index = power):
  //    p=2 → [b², 2ab, a²];  p=3 → [b³, 3ab², 3a²b, a³].
  const coefficients =
    p === 2
      ? [b * b, 2 * a * b, a * a]
      : [b * b * b, 3 * a * b * b, 3 * a * a * b, a * a * a]

  // 2. Add 1–2 extra power terms k·x^e with distinct exponents from {1,2,3,4}.
  const extraTerms = shuffle([1, 2, 3, 4])
    .slice(0, randInt(1, 2))
    .map((e) => ({ k: randInt(1, 4), e }))
  for (const { k, e } of extraTerms) {
    while (coefficients.length <= e) coefficients.push(0)
    coefficients[e] += k
  }

  // 3. Display reads as the SAME function: factored chain term + each extra term,
  //    in the exact order the extra terms were added to `coefficients`.
  const chainDisplay = `(${formatMonomial(a, 1)} + ${b})${superscript(p)}`
  const display = [chainDisplay, ...extraTerms.map(({ k, e }) => formatMonomial(k, e))].join(' + ')

  return {
    id: uniqueId('l2-combine'),
    type: 'problem',
    component: 'typeInDerivative',
    title: 'Combine the rules',
    body: 'This one needs the chain rule, the power rule, and the sum rule together. Any equivalent form is accepted.',
    config: {
      coefficients,
      display,
      prompt: 'f\u2032(x) =',
      placeholder: 'type a polynomial in x',
    },
    feedback: {
      correct: '',
      wrong: 'Differentiate each piece: chain rule on the square, power rule on the other term, then add.',
    },
    attempts: 'unlimited',
  }
}

export const lesson2Practice: PracticeLessonGroup = {
  lessonId: 'derivative-rules',
  lessonTitle: 'Rules of Derivatives',
  topics: [
    { id: 'l2-power', label: 'Power rule', generate: generatePowerMatch },
    { id: 'l2-sum', label: 'Sum rule', generate: generateSum },
    { id: 'l2-chain', label: 'Chain rule', generate: generateChain },
    { id: 'l2-mvt', label: 'Mean Value Theorem', generate: generateMvt },
    { id: 'l2-combine', label: 'Combine the rules', generate: generateCombine },
  ],
}
