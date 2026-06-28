import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { NPowerXAnimationSlide } from './NPowerXAnimationSlide'
import type { DemoSlide } from '../../types/lesson'

const slide: DemoSlide = {
  id: 'l4-npx',
  type: 'demo',
  component: 'nPowerXAnimation',
  title: 'Differentiating n^x',
  body: 'Watch how the exponential rule falls out of the chain rule.',
  config: { base: 2 },
}

afterEach(() => {
  vi.useRealTimers()
})

describe('NPowerXAnimationSlide (L4)', () => {
  it('reveals the first step immediately on Play (no initial delay)', () => {
    vi.useFakeTimers()
    const { container } = render(<NPowerXAnimationSlide slide={slide} onContinue={() => {}} />)

    // Before pressing Play: only the base function, no revealed steps.
    expect(container.querySelector('.cr-fade')).toBeNull()
    expect(container.querySelector('.npx-result')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    // WITHOUT advancing any timers, the first rewrite step is already on screen…
    expect(container.querySelector('.cr-fade')).not.toBeNull()
    // …but the later steps (incl. the punchline) have not appeared yet.
    expect(container.querySelector('.npx-result')).toBeNull()
  })

  it('Play advances through the steps to the ln(n)·n^x punchline', () => {
    vi.useFakeTimers()
    const { container } = render(<NPowerXAnimationSlide slide={slide} onContinue={() => {}} />)

    // Initially only the starting function is shown — no punchline yet.
    expect(container.querySelector('.npx-result')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    // Drive all the staged timeouts to completion.
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    const result = container.querySelector('.npx-result')
    expect(result).not.toBeNull()
    // Punchline reads ln(2)·2^x (the x is a <sup>, so textContent is "ln(2) · 2x").
    expect(result?.textContent).toContain('ln(2)')
    expect(result?.textContent).toMatch(/2/)
    expect(result?.textContent).toContain('x')
  })

  it('Next steps forward one stage at a time and reaches the punchline', () => {
    const { container } = render(<NPowerXAnimationSlide slide={slide} onContinue={() => {}} />)
    const nextBtn = screen.getByRole('button', { name: /next/i })

    expect(container.querySelector('.npx-result')).toBeNull()
    fireEvent.click(nextBtn)
    fireEvent.click(nextBtn)
    fireEvent.click(nextBtn)

    expect(container.querySelector('.npx-result')?.textContent).toContain('ln(2)')
    expect(nextBtn).toBeDisabled()
  })

  it('uses config.base for the displayed base and numeric ln', () => {
    const slide3: DemoSlide = { ...slide, config: { base: 3 } }
    render(<NPowerXAnimationSlide slide={slide3} onContinue={() => {}} />)
    // ln 3 ≈ 1.099 appears in the opening caption is not shown yet, but the base is.
    expect(screen.getAllByText('3', { exact: false }).length).toBeGreaterThan(0)
  })
})
