import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductRuleMultiPartSlide } from './ProductRuleMultiPartSlide'
import type { ProblemSlide } from '../../types/lesson'
import {
  addPolynomials,
  derivativeCoefficients,
  multiplyPolynomials,
  polynomialsEqual,
} from '../../utils/polynomial'

// Sample factors used across the grading-truth tests.
// u(x) = x + 1, v(x) = x² + 2.
const u = [1, 1]
const v = [2, 0, 1]

describe('product-rule grading truths', () => {
  const uPrime = derivativeCoefficients(u)
  const vPrime = derivativeCoefficients(v)
  const sum = addPolynomials(multiplyPolynomials(uPrime, v), multiplyPolynomials(u, vPrime))
  const total = derivativeCoefficients(multiplyPolynomials(u, v))

  it('part (a): derivatives of each factor', () => {
    expect(polynomialsEqual(uPrime, [1])).toBe(true)
    expect(polynomialsEqual(vPrime, [0, 2])).toBe(true)
  })

  it('part (b): u′·v + u·v′ equals 3x² + 2x + 2', () => {
    expect(polynomialsEqual(sum, [2, 2, 3])).toBe(true)
  })

  it('part (c): the simplified total derivative matches part (b)', () => {
    expect(polynomialsEqual(total, [2, 2, 3])).toBe(true)
    expect(polynomialsEqual(total, sum)).toBe(true)
  })

  it('rejects an incorrect product-rule sum', () => {
    expect(polynomialsEqual(sum, [2, 2, 1])).toBe(false)
  })
})

// Mirrors the shipped lesson JSON (content/lessons/exponents-product-rule.json):
// u(x) = 2x + 1 → [1, 2], v(x) = x² + 3 → [3, 0, 1].
describe('product-rule grading truths for the shipped JSON config', () => {
  const ju = [1, 2]
  const jv = [3, 0, 1]
  const uPrime = derivativeCoefficients(ju)
  const vPrime = derivativeCoefficients(jv)
  const sum = addPolynomials(multiplyPolynomials(uPrime, jv), multiplyPolynomials(ju, vPrime))
  const total = derivativeCoefficients(multiplyPolynomials(ju, jv))

  it('part (a): u′ = [2], v′ = [0, 2]', () => {
    expect(uPrime).toEqual([2])
    expect(vPrime).toEqual([0, 2])
  })

  it('part (b): u′·v + u·v′ = [6, 2, 6]', () => {
    expect(sum).toEqual([6, 2, 6])
  })

  it('part (c): (uv)′ = [6, 2, 6] and equals part (b)', () => {
    expect(total).toEqual([6, 2, 6])
    expect(polynomialsEqual(total, sum)).toBe(true)
  })
})

const slide: ProblemSlide = {
  id: 'l4-product-rule',
  type: 'problem',
  component: 'productRuleMultiPart',
  title: 'Product rule',
  body: 'Differentiate u·v step by step.',
  config: { u, v },
  feedback: { correct: 'Nice!', wrong: 'Not quite — re-apply the rule.' },
  attempts: 'unlimited',
}

describe('ProductRuleMultiPartSlide', () => {
  it('shows the given factors and the first prompt', () => {
    render(<ProductRuleMultiPartSlide slide={slide} onCorrect={() => {}} />)
    expect(screen.getByText(/Part \(a\)/)).toBeInTheDocument()
    expect(screen.getByText('x + 1')).toBeInTheDocument()
    expect(screen.getByText('x\u00b2 + 2')).toBeInTheDocument()
  })

  it('advances from part (a) once u′ and v′ are built correctly', async () => {
    const user = userEvent.setup()
    render(<ProductRuleMultiPartSlide slide={slide} onCorrect={() => {}} />)

    const uBuilder = screen.getByRole('group', { name: /^u/ })
    const vBuilder = screen.getByRole('group', { name: /^v/ })

    // u′(x) = 1 (constant)
    await user.click(within(uBuilder).getByRole('button', { name: 'digit 1' }))
    await user.click(within(uBuilder).getByRole('button', { name: /add term/i }))

    // v′(x) = 2x
    await user.click(within(vBuilder).getByRole('button', { name: 'digit 2' }))
    await user.click(within(vBuilder).getByRole('button', { name: 'increase power' }))
    await user.click(within(vBuilder).getByRole('button', { name: /add term/i }))

    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByText(/Part \(b\)/)).toBeInTheDocument()
  })

  it('shows wrong feedback when part (a) is incorrect', async () => {
    const user = userEvent.setup()
    const onCorrect = vi.fn()
    render(<ProductRuleMultiPartSlide slide={slide} onCorrect={onCorrect} />)

    // u′ wrong (9), but v′ correct (2x) so only u′ should light up red.
    const uBuilder = screen.getByRole('group', { name: /^u/ })
    await user.click(within(uBuilder).getByRole('button', { name: 'digit 9' }))
    await user.click(within(uBuilder).getByRole('button', { name: /add term/i }))

    const vBuilder = screen.getByRole('group', { name: /^v/ })
    await user.click(within(vBuilder).getByRole('button', { name: 'digit 2' }))
    await user.click(within(vBuilder).getByRole('button', { name: 'increase power' }))
    await user.click(within(vBuilder).getByRole('button', { name: /add term/i }))

    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByText('Not quite — re-apply the rule.')).toBeInTheDocument()
    expect(onCorrect).not.toHaveBeenCalled()
    // The wrong calculator (u′) lights up red; the correct v′ does not.
    expect(screen.getByRole('group', { name: /^u/ })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('group', { name: /^v/ })).not.toHaveAttribute('aria-invalid')
  })

  // End-to-end of the three graded parts using the SHIPPED JSON config
  // (u = 2x + 1, v = x² + 3): u′=[2], v′=[0,2], sum=[6,2,6], total=[6,2,6].
  it('grades parts a/b/c with the JSON config and reveals Continue', async () => {
    const user = userEvent.setup()
    const onCorrect = vi.fn()
    const jsonSlide: ProblemSlide = {
      ...slide,
      config: { u: [1, 2], v: [3, 0, 1], uDisplay: '2x + 1', vDisplay: 'x\u00b2 + 3' },
    }
    render(<ProductRuleMultiPartSlide slide={jsonSlide} onCorrect={onCorrect} />)

    // Builds coeff·x^power in a given builder element.
    async function addTerm(builder: HTMLElement, coeff: number, power: number) {
      for (const digit of String(coeff)) {
        await user.click(within(builder).getByRole('button', { name: `digit ${digit}` }))
      }
      for (let p = 0; p < power; p++) {
        await user.click(within(builder).getByRole('button', { name: 'increase power' }))
      }
      await user.click(within(builder).getByRole('button', { name: /add term/i }))
    }

    // Part (a): u′ = 2, v′ = 2x.
    await addTerm(screen.getByRole('group', { name: /^u/ }), 2, 0)
    await addTerm(screen.getByRole('group', { name: /^v/ }), 2, 1)
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByText(/Part \(b\)/)).toBeInTheDocument()

    // Part (b): two separate calculators.
    //   u′·v = 2·(x² + 3) = 2x² + 6
    //   u·v′ = (2x + 1)·2x = 4x² + 2x
    const uPVBuilder = screen.getByRole('group', { name: 'u\u2032\u00b7v' })
    await addTerm(uPVBuilder, 6, 0)
    await addTerm(uPVBuilder, 2, 2)
    const uVPBuilder = screen.getByRole('group', { name: 'u\u00b7v\u2032' })
    await addTerm(uVPBuilder, 2, 1)
    await addTerm(uVPBuilder, 4, 2)
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByText(/Part \(c\)/)).toBeInTheDocument()

    // Part (c): the simplified total derivative = 6x² + 2x + 6.
    let totalBuilder = screen.getByRole('group')
    await addTerm(totalBuilder, 6, 0)
    totalBuilder = screen.getByRole('group')
    await addTerm(totalBuilder, 2, 1)
    totalBuilder = screen.getByRole('group')
    await addTerm(totalBuilder, 6, 2)
    await user.click(screen.getByRole('button', { name: /check/i }))

    const continueBtn = await screen.findByRole('button', { name: /continue/i })
    await user.click(continueBtn)
    expect(onCorrect).toHaveBeenCalled()
  })
})
