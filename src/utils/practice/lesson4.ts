import type { ProblemSlide } from '../../types/lesson'
import { multiplyPolynomials } from '../polynomial'
import { formatPolynomial, pick, randInt, shuffle, uniqueId } from './helpers'
import type { PracticeLessonGroup } from './types'

/** Unicode superscript x (matches the eˣ glyph the slides use). */
const SUP_X = '\u02e3'

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

/** Topic 3 — differentiate the exponential nˣ (multiple choice). */
function generateNPower(): ProblemSlide {
  const n = pick([2, 3, 5])

  const correct = `ln(${n})\u00b7${n}${SUP_X}`
  const distractors = [
    `${n}\u00b7${n}${SUP_X}`,
    `x\u00b7${n}^(x-1)`,
    `${n}${SUP_X}`,
  ]

  const options = shuffle([correct, ...distractors])
  const correctIndex = options.indexOf(correct)

  return {
    id: uniqueId('l4-npower'),
    type: 'problem',
    component: 'multipleChoice',
    title: 'Differentiate an exponential',
    body: 'Pick the correct derivative. The derivative of an exponential bˣ is ln(b)\u00b7bˣ.',
    config: {
      prompt: `d/dx [ ${n}${SUP_X} ] = ?`,
      options,
      correctIndex,
    },
    feedback: {
      correct: '',
      wrong: 'd/dx [ bˣ ] = ln(b)\u00b7bˣ — the base stays, multiplied by ln of the base.',
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

/** Topic 4 — product rule, worked through in parts. */
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

/** Topic 5 — expand a product, then differentiate (type-in). */
function generateProductExpand(): ProblemSlide {
  const a = pick([-3, -2, -1, 1, 2, 3])
  const b = randInt(-4, 4)
  const c = pick([-3, -2, -1, 1, 2, 3])
  const d = randInt(-4, 4)

  // (a x + b)(c x + d) — low-to-high factors, then expanded product.
  const coefficients = multiplyPolynomials([b, a], [d, c])
  const display = formatPolynomial(coefficients)

  return {
    id: uniqueId('l4-product-expand'),
    type: 'problem',
    component: 'typeInDerivative',
    title: 'Expand, then differentiate',
    body: 'Expand the product into a polynomial, then differentiate. Any equivalent form is accepted.',
    config: {
      coefficients,
      display,
      prompt: 'f\u2032(x) =',
      placeholder: 'type a polynomial in x',
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
    { id: 'l4-npower', label: 'Differentiate nˣ', generate: generateNPower },
    { id: 'l4-product', label: 'Product rule', generate: generateProduct },
    { id: 'l4-product-expand', label: 'Expand & differentiate', generate: generateProductExpand },
  ],
}
