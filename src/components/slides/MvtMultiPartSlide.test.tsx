import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MvtMultiPartSlide } from './MvtMultiPartSlide'
import { lessons } from '../../lessons'
import type { ProblemSlide } from '../../types/lesson'

const mvtSlide = lessons['derivative-rules'].slides.find(
  (s) => s.component === 'mvtMultiPart',
) as ProblemSlide

describe('MvtMultiPartSlide (L2S7)', () => {
  it('on a wrong Part 2 answer, asks which x makes f′(x) equal the secant slope', async () => {
    const user = userEvent.setup()
    render(<MvtMultiPartSlide slide={mvtSlide} onCorrect={() => {}} />)

    // f(x) = 0.25x² on [0, 4] ⇒ secant slope = 1. Answer Part 1 correctly to advance.
    await user.type(screen.getByRole('textbox'), '1')
    await user.click(screen.getByRole('button', { name: /check/i }))

    // Part 2: enter a value with the wrong slope.
    await user.type(screen.getByRole('textbox'), '9')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByText('What value of x would make 0.5x equal to 1')).toBeInTheDocument()
  })

  it('Part 2 prompt states the endpoints are not valid answers', async () => {
    const user = userEvent.setup()
    render(<MvtMultiPartSlide slide={mvtSlide} onCorrect={() => {}} />)

    // Advance past Part 1 (secant slope = 1 on [0, 4]).
    await user.type(screen.getByRole('textbox'), '1')
    await user.click(screen.getByRole('button', { name: /check/i }))

    // ax = 0, bx = 4, so the Part 2 prompt must forbid those endpoints.
    expect(
      screen.getByText(/You cannot enter 0 or 4/),
    ).toBeInTheDocument()
  })
})
