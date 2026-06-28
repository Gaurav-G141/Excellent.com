import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecantZoomDerivativeSlide } from './SecantZoomDerivativeSlide'
import { lessons } from '../../lessons'
import type { ProblemSlide } from '../../types/lesson'
import { evaluatePoly } from '../../utils/polynomial'

const zoomSlide = lessons['derivatives-basics'].slides.find(
  (s) => s.component === 'secantZoomDerivative',
) as ProblemSlide

const cfg = zoomSlide.config as unknown as {
  coefficients: number[]
  targetX: number
  referenceX: number
}

const secantSlope =
  (evaluatePoly(cfg.coefficients, cfg.referenceX) - evaluatePoly(cfg.coefficients, cfg.targetX)) /
  (cfg.referenceX - cfg.targetX)

describe('SecantZoomDerivativeSlide (L1S4)', () => {
  it('gates on zoom before grading: shows the zoom message even for a correct answer when zoomed out', async () => {
    const user = userEvent.setup()
    render(<SecantZoomDerivativeSlide slide={zoomSlide} onCorrect={() => {}} />)

    // Zoom slider stays at its minimum (1). Enter the *correct* secant slope.
    await user.type(screen.getByLabelText(/estimated slope/i), String(secantSlope))
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(
      screen.getByText(
        'Please zoom in further: The function should look almost like a straight line',
      ),
    ).toBeInTheDocument()
    // Not graded yet: no Continue button.
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })

  it('explains slope = rise/run for a wrong answer once the learner has zoomed in enough', async () => {
    const user = userEvent.setup()
    render(<SecantZoomDerivativeSlide slide={zoomSlide} onCorrect={() => {}} />)

    fireEvent.change(screen.getByLabelText(/zoom in on the point/i), { target: { value: '5' } })
    await user.type(screen.getByLabelText(/estimated slope/i), '99')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(
      screen.getByText(/Recall that a derivative is the slope of the tangent line/i),
    ).toBeInTheDocument()
  })

  it('accepts the secant slope (not the analytic derivative) once zoomed in enough', async () => {
    const user = userEvent.setup()
    render(<SecantZoomDerivativeSlide slide={zoomSlide} onCorrect={() => {}} />)

    fireEvent.change(screen.getByLabelText(/zoom in on the point/i), { target: { value: '5' } })
    await user.type(screen.getByLabelText(/estimated slope/i), String(secantSlope))
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})
