import type { ProblemSlide } from '../../types/lesson'
import { derivativeCoefficients, multiplyPolynomials } from '../polynomial'
import { formatPolynomial, pick, randInt, shuffle, uniqueId } from './helpers'
import type { PracticeLessonGroup } from './types'

const MID = '\u00b7' // · multiplication dot

/**
 * Assemble a multiple-choice option set: the correct string plus up to three
 * DISTINCT distractors drawn (in order) from `candidates`, then shuffled.
 * Returns the post-shuffle index of the correct string.
 */
function buildOptions(
  correct: string,
  candidates: string[],
): { options: string[]; correctIndex: number } {
  const distractors: string[] = []
  for (const candidate of candidates) {
    if (candidate === correct) continue
    if (distractors.includes(candidate)) continue
    distractors.push(candidate)
    if (distractors.length === 3) break
  }
  const options = shuffle([correct, ...distractors])
  return { options, correctIndex: options.indexOf(correct) }
}

/** Topic 1 — read the slope of eˣ off the slope triangle. */
function generateExpSlope(): ProblemSlide {
  const initialX = pick([-1, -0.5, 0, 0.5, 1])

  return {
    id: uniqueId('l4-exp-slope'),
    type: 'problem',
    component: 'exponentialTriangleQuestion',
    title: 'Slope of eˣ',
    body: 'Drag the intercept to build the slope triangle, then read off f\u2032(x). Remember the slope of eˣ equals its own height.',
    config: {
      variant: 'exp',
      viewport: { xMin: -2, xMax: 2, yMin: -0.5, yMax: 4 },
      initialX,
      tolerance: 0.1,
    },
    feedback: {
      correct: '',
      wrong: 'For f(x) = eˣ the slope equals the height: f\u2032(x) = eˣ.',
    },
    attempts: 'unlimited',
  }
}

/** Topic 2 — read the slope of ln x off the slope triangle. */
function generateLnSlope(): ProblemSlide {
  const initialX = randInt(2, 5)

  return {
    id: uniqueId('l4-ln-slope'),
    type: 'problem',
    component: 'exponentialTriangleQuestion',
    title: 'Slope of ln x',
    body: 'Drag the intercept to build the slope triangle, then read off f\u2032(x). The slope of ln x is 1/x.',
    config: {
      variant: 'ln',
      viewport: { xMin: -1, xMax: 5, yMin: -1.5, yMax: 3 },
      initialX,
      tolerance: 0.1,
    },
    feedback: {
      correct: '',
      wrong: 'For f(x) = ln x the slope is 1/x.',
    },
    attempts: 'unlimited',
  }
}

/**
 * Random inner argument g(x): linear OR quadratic with small integer
 * coefficients and a nonzero leading term (so the exponent/argument is a
 * genuine composite, e.g. `3x − 1` or `x² + 4x + 1`).
 */
function randomInner(): number[] {
  const degree = pick([1, 2])
  if (degree === 1) {
    return [randInt(-4, 4), pick([-3, -2, -1, 1, 2, 3])]
  }
  return [randInt(-4, 4), randInt(-3, 3), pick([-3, -2, -1, 1, 2, 3])]
}

/** g(x) with its constant lowered by one — a "power-rule" style distractor. */
function lowerInner(g: number[]): number[] {
  const lowered = [...g]
  lowered[0] = (lowered[0] ?? 0) - 1
  return lowered
}

/** Topic 3 — differentiate a composite exponential e^g(x) / b^g(x) (multiple choice). */
function generateExpChain(): ProblemSlide {
  const base = pick<'e' | 2 | 3>(['e', 2, 3])
  const g = randomInner()
  const gp = derivativeCoefficients(g)
  const gMinusOne = lowerInner(g)

  const fpG = formatPolynomial(g)
  const fpGp = formatPolynomial(gp)
  const fpGMinusOne = formatPolynomial(gMinusOne)

  let functionString: string
  let correct: string
  let candidates: string[]

  if (base === 'e') {
    functionString = `e^(${fpG})`
    correct = `(${fpGp})${MID}e^(${fpG})`
    candidates = [
      `e^(${fpG})`, // forgot the chain factor
      `(${fpG})${MID}e^(${fpG})`, // used the argument instead of its derivative
      `(${fpGp})${MID}e^(${fpGMinusOne})`, // treated it like a power rule
    ]
  } else {
    const b = base
    functionString = `${b}^(${fpG})`
    correct = `(${fpGp})${MID}ln(${b})${MID}${b}^(${fpG})`
    candidates = [
      `ln(${b})${MID}${b}^(${fpG})`, // forgot the chain factor
      `(${fpGp})${MID}${b}^(${fpG})`, // forgot the ln(b) factor
      `(${fpG})${MID}ln(${b})${MID}${b}^(${fpG})`, // used the argument instead of its derivative
      `(${fpGp})${MID}${b}^(${fpGMinusOne})`, // treated it like a power rule
    ]
  }

  const { options, correctIndex } = buildOptions(correct, candidates)

  return {
    id: uniqueId('l4-exp-chain'),
    type: 'problem',
    component: 'multipleChoice',
    title: 'Differentiate exponentials',
    body: 'Differentiate the function below and choose the matching result.',
    config: {
      prompt: `d/dx [ ${functionString} ] = ?`,
      options,
      correctIndex,
    },
    feedback: {
      correct: '',
      wrong: 'Look carefully at the exponent. Its inside has its own rate of change to account for.',
    },
    attempts: 'unlimited',
  }
}

/** Topic 4 — differentiate a composite logarithm ln(g(x)) (multiple choice). */
function generateLogChain(): ProblemSlide {
  const g = randomInner()
  const gp = derivativeCoefficients(g)

  const fpG = formatPolynomial(g)
  const fpGp = formatPolynomial(gp)

  const correct = `(${fpGp})/(${fpG})`
  const candidates = [
    `1/(${fpG})`, // forgot the chain numerator
    `(${fpG})/(${fpGp})`, // flipped numerator and denominator
    `(${fpGp})${MID}(${fpG})`, // multiplied instead of dividing
    `1/(${fpGp})`, // divided by the wrong polynomial
  ]

  const { options, correctIndex } = buildOptions(correct, candidates)

  return {
    id: uniqueId('l4-log-chain'),
    type: 'problem',
    component: 'multipleChoice',
    title: 'Differentiate logarithms',
    body: 'Differentiate the function below and choose the matching result.',
    config: {
      prompt: `d/dx [ ln(${fpG}) ] = ?`,
      options,
      correctIndex,
    },
    feedback: {
      correct: '',
      wrong: 'The inside of the log is not just x. Its own rate of change belongs on top.',
    },
    attempts: 'unlimited',
  }
}

/** Random low-to-high polynomial of degree 1 or 2 with a nonzero leading term. */
function randomFactor(): number[] {
  const degree = pick([1, 2])
  const coeffs: number[] = []
  coeffs[0] = randInt(-3, 3)
  if (degree === 1) {
    coeffs[1] = pick([-3, -2, -1, 1, 2, 3])
  } else {
    coeffs[1] = randInt(-3, 3)
    coeffs[2] = pick([-3, -2, -1, 1, 2, 3])
  }
  return coeffs
}

/** Topic 5 — product rule, worked through in parts. */
function generateProduct(): ProblemSlide {
  const u = randomFactor()
  const v = randomFactor()

  return {
    id: uniqueId('l4-product'),
    type: 'problem',
    component: 'productRuleMultiPart',
    title: 'Apply the product rule',
    body: 'Work through (u\u00b7v)\u2032 = u\u2032\u00b7v + u\u00b7v\u2032 one part at a time.',
    config: {
      u,
      v,
      uDisplay: formatPolynomial(u),
      vDisplay: formatPolynomial(v),
    },
    feedback: {
      correct: '',
      wrong: 'Remember (u\u00b7v)\u2032 = u\u2032\u00b7v + u\u00b7v\u2032.',
    },
    attempts: 'unlimited',
  }
}

/** A linear factor [b, a] with a nonzero leading coefficient. */
function linearFactor(): number[] {
  return [randInt(-4, 4), pick([-3, -2, -1, 1, 2, 3])]
}

/** A quadratic factor [c, b, a] with a nonzero leading coefficient. */
function quadraticFactor(): number[] {
  return [randInt(-3, 3), randInt(-3, 3), pick([-2, -1, 1, 2])]
}

/**
 * Topic 6 — expand a product, then differentiate (type-in).
 *
 * The student is shown the FACTORED product form, e.g. `(2x + 3)(4x + 1)` (and
 * sometimes one quadratic factor, e.g. `(x² + 2x − 1)(3x + 2)`), so the "expand
 * it yourself" step is preserved. `config.coefficients` stays the EXPANDED
 * product so the component still grades the derivative.
 */
function generateProductExpand(): ProblemSlide {
  // Optionally promote one factor to a quadratic for extra variety.
  const f1 = Math.random() < 0.5 ? quadraticFactor() : linearFactor()
  const f2 = linearFactor()

  const coefficients = multiplyPolynomials(f1, f2)
  const display = `(${formatPolynomial(f1)})(${formatPolynomial(f2)})`

  return {
    id: uniqueId('l4-product-expand'),
    type: 'problem',
    component: 'polynomialDerivative',
    title: 'Expand, then differentiate',
    body: 'Expand the product into a polynomial, then build the derivative in standard form.',
    config: {
      coefficients,
      display,
      prompt: 'f\u2032(x) =',
    },
    feedback: {
      correct: '',
      wrong: 'Multiply the factors out first, then apply the power rule term by term.',
    },
    attempts: 'unlimited',
  }
}

export const lesson4Practice: PracticeLessonGroup = {
  lessonId: 'exponents-product-rule',
  lessonTitle: 'Exponents & the Product Rule',
  topics: [
    { id: 'l4-exp-slope', label: 'Slope of eˣ', generate: generateExpSlope },
    { id: 'l4-ln-slope', label: 'Slope of ln x', generate: generateLnSlope },
    { id: 'l4-exp-chain', label: 'Differentiate exponentials', generate: generateExpChain },
    { id: 'l4-log-chain', label: 'Differentiate logarithms', generate: generateLogChain },
    { id: 'l4-product', label: 'Product rule', generate: generateProduct },
    { id: 'l4-product-expand', label: 'Expand & differentiate', generate: generateProductExpand },
  ],
}
