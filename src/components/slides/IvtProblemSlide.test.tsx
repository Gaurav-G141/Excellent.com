import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IvtProblemSlide } from './IvtProblemSlide'
import { lessons } from '../../lessons'
import type { ProblemSlide } from '../../types/lesson'

const ivtSlide = lessons['related-rates'].slides.find(
  (s) => s.component === 'ivtProblem',
) as ProblemSlide

describe('IvtProblemSlide (L3S6)', () => {
  it('hides the equation and the plotted curve (endpoints only)', () => {
    const { container } = render(<IvtProblemSlide slide={ivtSlide} onCorrect={() => {}} />)

    // The misleading "f(x) = …" equation must not be shown anymore.
    expect(screen.queryByText(/f\(x\)\s*=/i)).not.toBeInTheDocument()
    // f(a) and f(b) are still shown numerically.
    expect(screen.getByText(/f\(a\)\s*=/i)).toBeInTheDocument()
    expect(screen.getByText(/f\(b\)\s*=/i)).toBeInTheDocument()
    // The curve path is hidden so the graph can't reveal where the function goes.
    expect(container.querySelector('.graph-curve')).toBeNull()
    // The A and B endpoint dots are still drawn.
    expect(container.querySelectorAll('.graph-target-dot').length).toBe(2)
  })

  it('completes after the correct multiple-choice — no second "find an x" step', async () => {
    const user = userEvent.setup()
    render(<IvtProblemSlide slide={ivtSlide} onCorrect={() => {}} />)

    // guaranteedValue is 1 in the lesson config.
    await user.click(screen.getByRole('button', { name: '1' }))

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    expect(screen.queryByText(/find an x/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/which value is f guaranteed/i)).not.toBeInTheDocument()
  })

  it('keeps the question open and explains the IVT bound when wrong', async () => {
    const user = userEvent.setup()
    render(<IvtProblemSlide slide={ivtSlide} onCorrect={() => {}} />)

    await user.click(screen.getByRole('button', { name: '6' }))

    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
    expect(screen.getByText(/only guarantees values/i)).toBeInTheDocument()
  })
})
