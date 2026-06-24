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
