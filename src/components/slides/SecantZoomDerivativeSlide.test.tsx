import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecantZoomDerivativeSlide } from './SecantZoomDerivativeSlide'
import { lessons } from '../../lessons'
import type { ProblemSlide } from '../../types/lesson'

const zoomSlide = lessons['derivatives-basics'].slides.find(
  (s) => s.component === 'secantZoomDerivative',
) as ProblemSlide

describe('SecantZoomDerivativeSlide (L1S4)', () => {
  it('nudges the learner to keep zooming when they answer while zoomed out', async () => {
    const user = userEvent.setup()
    render(<SecantZoomDerivativeSlide slide={zoomSlide} onCorrect={() => {}} />)

    // Zoom slider stays at its minimum (1). Enter a clearly wrong slope.
    await user.type(screen.getByLabelText(/estimated slope/i), '99')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(
      screen.getByText('Zoom in further, the curve should roughly look like a straight line'),
    ).toBeInTheDocument()
  })

  it('explains slope = rise/run once the learner has zoomed in enough', async () => {
    const user = userEvent.setup()
    render(<SecantZoomDerivativeSlide slide={zoomSlide} onCorrect={() => {}} />)

    // Push the zoom slider to its maximum so we are past the "zoomed enough" line.
    fireEvent.change(screen.getByLabelText(/zoom in on the point/i), { target: { value: '5' } })
    await user.type(screen.getByLabelText(/estimated slope/i), '99')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByText(/Recall that a derivative is the slope of the tangent line/i)).toBeInTheDocument()
  })
})
