import { describe, it, expect, vi, afterEach } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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

afterEach(() => {
  vi.useRealTimers()
})

describe('PolynomialPlaygroundSlide', () => {
  it('keeps Play disabled until both factors are non-zero', () => {
    render(<PolynomialPlaygroundSlide slide={slide} onContinue={() => {}} />)
    expect(screen.getByRole('button', { name: /play/i })).toBeDisabled()
  })

  it('reveals the first step immediately on Play (no initial delay)', () => {
    vi.useFakeTimers()
    const { container } = render(<PolynomialPlaygroundSlide slide={slide} onContinue={() => {}} />)

    const uBuilder = screen.getByRole('group', { name: 'u(x)' })
    const vBuilder = screen.getByRole('group', { name: 'v(x)' })

    // Build u = x and v = x with synchronous fireEvent clicks (no timers).
    for (const builder of [uBuilder, vBuilder]) {
      fireEvent.click(within(builder).getByRole('button', { name: 'digit 1' }))
      fireEvent.click(within(builder).getByRole('button', { name: 'increase power' }))
      fireEvent.click(within(builder).getByRole('button', { name: /add term/i }))
    }

    // The product-rule line is not shown until Play.
    expect(screen.queryByText('u\u2032\u00b7v + u\u00b7v\u2032')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    // WITHOUT advancing the 1500ms timer, the first stage (the rule) is visible…
    expect(screen.getByText('u\u2032\u00b7v + u\u00b7v\u2032')).toBeInTheDocument()
    // …and the final simplified result has NOT appeared yet.
    expect(container.querySelector('.cr-result')).toBeNull()
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
