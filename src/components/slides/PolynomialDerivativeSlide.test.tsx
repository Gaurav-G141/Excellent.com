import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolynomialDerivativeSlide } from './PolynomialDerivativeSlide'
import type { ProblemSlide } from '../../types/lesson'

// f(x) = x² + 3x  ⇒  f′(x) = 2x + 3.
const slide: ProblemSlide = {
  id: 'l2-sum',
  type: 'problem',
  component: 'polynomialDerivative',
  title: 'Differentiate the sum',
  body: 'Use the power rule on each term, then add.',
  config: { coefficients: [0, 3, 1], display: 'x\u00b2 + 3x', prompt: 'f\u2032(x) =' },
  feedback: { correct: '', wrong: 'Not quite — try again.' },
  attempts: 'unlimited',
}

// Builds coeff·x^power into the playground.
async function addTerm(
  user: ReturnType<typeof userEvent.setup>,
  builder: HTMLElement,
  coeff: number,
  power: number,
) {
  for (const digit of String(coeff)) {
    await user.click(within(builder).getByRole('button', { name: `digit ${digit}` }))
  }
  for (let p = 0; p < power; p++) {
    await user.click(within(builder).getByRole('button', { name: 'increase power' }))
  }
  await user.click(within(builder).getByRole('button', { name: /add term/i }))
}

describe('PolynomialDerivativeSlide', () => {
  it('shows the function and a calculator (no free-text box)', () => {
    render(<PolynomialDerivativeSlide slide={slide} onCorrect={() => {}} />)
    expect(screen.getByText('x\u00b2 + 3x')).toBeInTheDocument()
    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('accepts the derivative built in standard form and reveals Continue', async () => {
    const user = userEvent.setup()
    const onCorrect = vi.fn()
    render(<PolynomialDerivativeSlide slide={slide} onCorrect={onCorrect} />)

    const builder = screen.getByRole('group')
    await addTerm(user, builder, 3, 0)
    await addTerm(user, builder, 2, 1)
    await user.click(screen.getByRole('button', { name: /check/i }))

    const continueBtn = await screen.findByRole('button', { name: /continue/i })
    await user.click(continueBtn)
    expect(onCorrect).toHaveBeenCalled()
  })

  it('flags a wrong answer red and does not advance', async () => {
    const user = userEvent.setup()
    const onCorrect = vi.fn()
    render(<PolynomialDerivativeSlide slide={slide} onCorrect={onCorrect} />)

    const builder = screen.getByRole('group')
    await addTerm(user, builder, 9, 1) // 9x — wrong
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByText('Not quite — try again.')).toBeInTheDocument()
    expect(onCorrect).not.toHaveBeenCalled()
    expect(screen.getByRole('group')).toHaveAttribute('aria-invalid', 'true')
  })
})
