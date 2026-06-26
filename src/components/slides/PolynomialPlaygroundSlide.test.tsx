import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolynomialPlaygroundSlide } from './PolynomialPlaygroundSlide'
import type { DemoSlide } from '../../types/lesson'

const slide: DemoSlide = {
  id: 'l4-playground',
  type: 'demo',
  component: 'polynomialPlayground',
  title: 'Polynomial playground',
  body: 'Build u and v, then watch the product rule unfold.',
  config: {},
}

describe('PolynomialPlaygroundSlide', () => {
  it('keeps Play disabled until both factors are non-zero', () => {
    render(<PolynomialPlaygroundSlide slide={slide} onContinue={() => {}} />)
    expect(screen.getByRole('button', { name: /play/i })).toBeDisabled()
  })

  it('derives (uv)′ = 2x for u = x, v = x by stepping through with Next', async () => {
    const user = userEvent.setup()
    render(<PolynomialPlaygroundSlide slide={slide} onContinue={() => {}} />)

    const uBuilder = screen.getByRole('group', { name: 'u(x)' })
    const vBuilder = screen.getByRole('group', { name: 'v(x)' })

    for (const builder of [uBuilder, vBuilder]) {
      await user.click(within(builder).getByRole('button', { name: 'digit 1' }))
      await user.click(within(builder).getByRole('button', { name: 'increase power' }))
      await user.click(within(builder).getByRole('button', { name: /add term/i }))
    }

    expect(screen.getByRole('button', { name: /play/i })).toBeEnabled()

    // Step through all six stages (rule → u′,v′ → substitute → simplify → sum).
    const next = screen.getByRole('button', { name: /next/i })
    for (let i = 0; i < 5; i++) await user.click(next)

    expect(screen.getByText('2x')).toBeInTheDocument()
  })
})
