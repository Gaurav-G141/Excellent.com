import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecantToTangentSlide } from './SecantToTangentSlide'
import { lessons } from '../../lessons'
import type { ProblemSlide } from '../../types/lesson'
import { evaluateDerivative } from '../../utils/polynomial'

const tangentSlide = lessons['derivatives-basics'].slides.find(
  (s) => s.component === 'secantToTangent',
) as ProblemSlide

const cfg = tangentSlide.config as unknown as {
  coefficients: number[]
  targetX: number
}

// At the fixed point the secant collapses onto the tangent, so the graded
// slope equals the analytic derivative there.
const tangentSlope = evaluateDerivative(cfg.coefficients, cfg.targetX)

describe('SecantToTangentSlide (L1S5)', () => {
  it('blocks grading until P is dragged close to the fixed point', async () => {
    const user = userEvent.setup()
    render(<SecantToTangentSlide slide={tangentSlide} onCorrect={() => {}} />)

    // P starts far away. Entering an answer and checking should nudge to drag closer.
    await user.type(screen.getByLabelText(/estimated slope/i), String(tangentSlope))
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByText(/Drag P closer to the fixed point/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })

  it('accepts the secant slope once P is brought onto the fixed point', async () => {
    const user = userEvent.setup()
    render(<SecantToTangentSlide slide={tangentSlide} onCorrect={() => {}} />)

    // Walk P leftward onto the fixed point using the keyboard slider. Each press
    // moves it by (xMax - xMin) / 50 = 0.1; 15 presses covers the 1.5-unit gap.
    const handle = screen.getByRole('slider', { name: /drag point p/i })
    handle.focus()
    for (let i = 0; i < 15; i++) {
      fireEvent.keyDown(handle, { key: 'ArrowLeft' })
    }

    await user.type(screen.getByLabelText(/estimated slope/i), String(tangentSlope))
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})
