import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GreatestDerivativeSlide } from './GreatestDerivativeSlide'
import { lessons } from '../../lessons'
import type { ProblemSlide } from '../../types/lesson'

const greatestSlide = lessons['derivatives-basics'].slides.find(
  (s) => s.component === 'greatestDerivative',
) as ProblemSlide

describe('GreatestDerivativeSlide (L1S2)', () => {
  it('accepts C as the steepest point without showing a feedback popup', async () => {
    const user = userEvent.setup()
    render(<GreatestDerivativeSlide slide={greatestSlide} onCorrect={() => {}} />)

    await user.click(screen.getByRole('radio', { name: 'Point C' }))
    await user.click(screen.getByRole('button', { name: /check/i }))

    // A correct answer advances to Continue and never pops up explanatory feedback.
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    expect(screen.queryByText(/greatest derivative/i)).not.toBeInTheDocument()
  })

  it('shows "There is a point more steep than {point}" naming the tapped point when wrong', async () => {
    const user = userEvent.setup()
    render(<GreatestDerivativeSlide slide={greatestSlide} onCorrect={() => {}} />)

    await user.click(screen.getByRole('radio', { name: 'Point B' }))
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByText('There is a point more steep than B')).toBeInTheDocument()
  })
})
