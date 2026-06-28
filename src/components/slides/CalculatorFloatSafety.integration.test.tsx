import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolynomialDerivativeSlide } from './PolynomialDerivativeSlide'
import { ProductRuleMultiPartSlide } from './ProductRuleMultiPartSlide'
import { addTermToCoeffs } from '../lesson/PolynomialBuilder'
import {
  addPolynomials,
  derivativeCoefficients,
  multiplyPolynomials,
  polynomialsEqual,
  productRuleDerivative,
} from '../../utils/polynomial'
import type { ProblemSlide } from '../../types/lesson'

type Builder = HTMLElement

/** Drive a single PolynomialBuilder to enter one (coeff, power) term. */
async function enterTerm(
  user: ReturnType<typeof userEvent.setup>,
  builder: Builder,
  coeff: number,
  power: number,
) {
  const q = within(builder)
  const abs = Math.abs(coeff)
  const str = String(abs)
  if (coeff < 0) await user.click(q.getByRole('button', { name: /toggle negative sign/i }))
  for (const ch of str) {
    if (ch === '.') await user.click(q.getByRole('button', { name: 'decimal point' }))
    else await user.click(q.getByRole('button', { name: `digit ${ch}` }))
  }
  for (let p = 0; p < power; p++) {
    await user.click(q.getByRole('button', { name: 'increase power' }))
  }
  await user.click(q.getByRole('button', { name: /add term/i }))
}

/** Enter every nonzero term of a coefficient array into a builder. */
async function buildPolynomial(
  user: ReturnType<typeof userEvent.setup>,
  builder: Builder,
  coeffs: number[],
) {
  for (let power = 0; power < coeffs.length; power++) {
    if (coeffs[power] !== 0) await enterTerm(user, builder, coeffs[power], power)
  }
}

function makeDerivativeSlide(coefficients: number[], display: string): ProblemSlide {
  return {
    id: 'deriv-test',
    type: 'problem',
    component: 'polynomialDerivative',
    title: 'Differentiate',
    body: 'body',
    config: { coefficients, display, prompt: "f\u2032(x) =" },
    feedback: { correct: '', wrong: 'wrong' },
    attempts: 'unlimited',
  }
}

describe('PolynomialDerivativeSlide — decimals & large coefficients grade in context', () => {
  it('grades a 2-decimal derivative coefficient correctly (0.11x³ → 0.33x²)', async () => {
    const user = userEvent.setup()
    // f = 0.11x³ ⇒ f' = 0.33x². Without coefficient rounding this is the classic
    // 0.11*3 = 0.33000000000000007 float-artifact case.
    render(<PolynomialDerivativeSlide slide={makeDerivativeSlide([0, 0, 0, 0.11], '0.11x³')} onCorrect={() => {}} />)
    const builder = screen.getByRole('group', { name: /f\u2032\(x\) =/ })
    await buildPolynomial(user, builder, [0, 0, 0.33])
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('grades a derivative with a large (≤100) coefficient correctly (50x² → 100x)', async () => {
    const user = userEvent.setup()
    render(<PolynomialDerivativeSlide slide={makeDerivativeSlide([0, 0, 50], '50x²')} onCorrect={() => {}} />)
    const builder = screen.getByRole('group', { name: /f\u2032\(x\) =/ })
    await buildPolynomial(user, builder, [0, 100])
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('does NOT mark a clean 0.3 wrong even though 0.1·x³ → 0.3 produces a float tail', async () => {
    const user = userEvent.setup()
    // f = 0.1x³ ⇒ f' coeff = 0.1*3 = 0.30000000000000004 before rounding.
    render(<PolynomialDerivativeSlide slide={makeDerivativeSlide([0, 0, 0, 0.1], '0.1x³')} onCorrect={() => {}} />)
    const builder = screen.getByRole('group', { name: /f\u2032\(x\) =/ })
    await buildPolynomial(user, builder, [0, 0, 0.3])
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})

describe('ProductRuleMultiPartSlide — decimal product-rule grades through all 3 parts', () => {
  it('grades 0.11x² · 3x with 2-decimal terms (0.22, 0.66, 0.33, 0.99) correctly', async () => {
    const user = userEvent.setup()
    // u = 0.11x², v = 3x.
    //   u' = 0.22x,  v' = 3
    //   u'·v = 0.66x²,  u·v' = 0.33x²
    //   (uv)' = 0.99x²
    const slide: ProblemSlide = {
      id: 'pr-test',
      type: 'problem',
      component: 'productRuleMultiPart',
      title: 'Apply the product rule',
      body: 'body',
      config: { u: [0, 0, 0.11], v: [0, 3], uDisplay: '0.11x\u00b2', vDisplay: '3x' },
      feedback: { correct: '', wrong: 'wrong' },
      attempts: 'unlimited',
    }
    render(<ProductRuleMultiPartSlide slide={slide} onCorrect={() => {}} />)

    // Part (a): u′ = 0.22x and v′ = 3.
    await buildPolynomial(user, screen.getByRole('group', { name: 'u\u2032(x)' }), [0, 0.22])
    await buildPolynomial(user, screen.getByRole('group', { name: 'v\u2032(x)' }), [3])
    await user.click(screen.getByRole('button', { name: 'Check' }))

    // Part (b): u′·v = 0.66x² and u·v′ = 0.33x².
    await buildPolynomial(user, screen.getByRole('group', { name: 'u\u2032\u00b7v' }), [0, 0, 0.66])
    await buildPolynomial(user, screen.getByRole('group', { name: 'u\u00b7v\u2032' }), [0, 0, 0.33])
    await user.click(screen.getByRole('button', { name: 'Check' }))

    // Part (c): total (uv)′ = 0.99x².
    await buildPolynomial(user, screen.getByRole('group', { name: '(uv)\u2032' }), [0, 0, 0.99])
    await user.click(screen.getByRole('button', { name: 'Check' }))

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})

/** A learner-buildable answer rounds every coefficient to 2 decimals. */
function simulateBuild(target: number[]): number[] {
  let acc: number[] = []
  for (let power = 0; power < target.length; power++) {
    if (target[power] !== 0) acc = addTermToCoeffs(acc, target[power], power)
  }
  return acc
}

function rand2(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100
}

function randomDecimalPoly(): number[] {
  const degree = Math.floor(Math.random() * 5) // 0..4
  return Array.from({ length: degree + 1 }, () => rand2(-100, 100))
}

function randomIntPoly(): number[] {
  const degree = Math.floor(Math.random() * 5)
  return Array.from({ length: degree + 1 }, () => Math.floor(Math.random() * 201) - 100)
}

describe('float-artifact stress: correct answers are never marked wrong', () => {
  it('derivative grading survives random 2-decimal polynomials (degree 0–4)', () => {
    for (let i = 0; i < 2000; i++) {
      const poly = randomDecimalPoly()
      const target = derivativeCoefficients(poly)
      // The learner builds the mathematically-correct derivative; grading must pass.
      expect(polynomialsEqual(simulateBuild(target), target)).toBe(true)
    }
  })

  it('product-rule grading survives 2-decimal u against integer v', () => {
    for (let i = 0; i < 1000; i++) {
      const u = randomDecimalPoly()
      const v = randomIntPoly()
      const t = productRuleDerivative(u, v)
      for (const target of [t.uPrime, t.vPrime, t.uPrimeV, t.uVPrime, t.sum, t.total]) {
        expect(polynomialsEqual(simulateBuild(target), target)).toBe(true)
      }
      // u'v + uv' must equal the derivative of the expanded product, with no tail.
      expect(polynomialsEqual(t.sum, t.total)).toBe(true)
    }
  })

  it('multiply/add of 2-decimal × integer polys never leave untrimmed float tails', () => {
    for (let i = 0; i < 1000; i++) {
      const a = randomDecimalPoly()
      const b = randomIntPoly()
      const product = multiplyPolynomials(a, b)
      expect(polynomialsEqual(simulateBuild(product), product)).toBe(true)
      const sum = addPolynomials(a, randomDecimalPoly())
      expect(polynomialsEqual(simulateBuild(sum), sum)).toBe(true)
    }
  })
})
