import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecantZoomDerivativeSlide } from './SecantZoomDerivativeSlide'
import { SecantToTangentSlide } from './SecantToTangentSlide'
import { generatePracticeProblem } from '../../utils/generateQuestion'
import { evaluateDerivative, evaluatePoly } from '../../utils/polynomial'
import type { ProblemSlide } from '../../types/lesson'

/**
 * Integration coverage for the "estimate the derivative" fixes:
 *  - the zoom slide refuses to grade until zoomed in >= ~60% of full range
 *  - both slides grade against the SECANT slope the learner reads, not f'(x)
 *  - the generator keeps |secant - true derivative| <= 0.1
 *
 * These configs are crafted so the secant slope is FAR from the analytic
 * derivative, which lets us prove which one is actually being graded.
 */

// f(x) = x²; targetX = 2, referenceX = 4.
// secant slope = (16 - 4) / (4 - 2) = 6, while f'(2) = 4 — a 2.0 gap >> tolerance.
function makeZoomSlide(): ProblemSlide {
  return {
    id: 'zoom-test',
    type: 'problem',
    component: 'secantZoomDerivative',
    title: 'Estimate the derivative',
    body: 'body',
    config: {
      coefficients: [0, 0, 1],
      viewport: { xMin: -1, xMax: 5, yMin: -1, yMax: 17 },
      targetX: 2,
      referenceX: 4,
      minorGridStep: 0.2,
      zoomLevels: 5,
      tolerance: 0.15,
    },
    feedback: { correct: '', wrong: 'nudge' },
    attempts: 'unlimited',
  }
}

const ZOOM_THRESHOLD = 1 + (5 - 1) * 0.6 // 3.4

describe('SecantZoomDerivativeSlide — zoom gate + secant grading', () => {
  it('refuses to grade with the exact zoom message until the threshold is reached', async () => {
    const user = userEvent.setup()
    render(<SecantZoomDerivativeSlide slide={makeZoomSlide()} onCorrect={() => {}} />)

    // Just BELOW the 60% threshold (3.4): even the correct secant slope is gated.
    fireEvent.change(screen.getByLabelText(/zoom in on the point/i), {
      target: { value: String(ZOOM_THRESHOLD - 0.1) },
    })
    await user.type(screen.getByLabelText(/estimated slope/i), '6')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(
      screen.getByText(
        'Please zoom in further: The function should look almost like a straight line',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })

  it('grades once zoom reaches the threshold, accepting the secant slope (6) not f′(2)=4', async () => {
    const user = userEvent.setup()
    render(<SecantZoomDerivativeSlide slide={makeZoomSlide()} onCorrect={() => {}} />)

    fireEvent.change(screen.getByLabelText(/zoom in on the point/i), {
      target: { value: String(ZOOM_THRESHOLD) },
    })
    await user.type(screen.getByLabelText(/estimated slope/i), '6')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('rejects the analytic derivative (4) once zoomed in — proving it grades the secant', async () => {
    const user = userEvent.setup()
    render(<SecantZoomDerivativeSlide slide={makeZoomSlide()} onCorrect={() => {}} />)

    fireEvent.change(screen.getByLabelText(/zoom in on the point/i), {
      target: { value: '5' },
    })
    await user.type(screen.getByLabelText(/estimated slope/i), '4')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(
      screen.getByText(/Recall that a derivative is the slope of the tangent line/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })
})

// f(x) = x²; targetX = 2, P starts at 2.8 inside a generous coincidentThreshold.
// secant (2 → 2.8) = (7.84 - 4) / 0.8 = 4.8, while f'(2) = 4 — a clear 0.8 gap.
function makeTangentSlide(): ProblemSlide {
  return {
    id: 'tangent-test',
    type: 'problem',
    component: 'secantToTangent',
    title: 'Approach the fixed point',
    body: 'body',
    config: {
      coefficients: [0, 0, 1],
      viewport: { xMin: 0, xMax: 5, yMin: -1, yMax: 17 },
      targetX: 2,
      initialVariableX: 2.8,
      minorGridStep: 0.2,
      coincidentThreshold: 1, // P starts "close enough" so we can grade immediately
      tolerance: 0.15,
    },
    feedback: { correct: '', wrong: 'drag closer' },
    attempts: 'unlimited',
  }
}

describe('SecantToTangentSlide — grades the drawn secant, not f′(x)', () => {
  it('accepts the secant slope (4.8) the learner reads off the graph', async () => {
    const user = userEvent.setup()
    render(<SecantToTangentSlide slide={makeTangentSlide()} onCorrect={() => {}} />)

    await user.type(screen.getByLabelText(/estimated slope/i), '4.8')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('rejects the analytic derivative (4) — confirming the secant is what is graded', async () => {
    const user = userEvent.setup()
    render(<SecantToTangentSlide slide={makeTangentSlide()} onCorrect={() => {}} />)

    await user.type(screen.getByLabelText(/estimated slope/i), '4')
    await user.click(screen.getByRole('button', { name: /check/i }))

    expect(
      screen.getByText(/The slope of a line is the change in y divided by the change in x/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })
})

// The generator's worst case (a = ±0.25, h = 0.4) lands EXACTLY on 0.1; IEEE-754
// arithmetic can leave a sub-1e-9 tail (e.g. 0.10000000000000064), so compare
// against 0.1 with a float epsilon rather than re-introducing a spurious failure.
const FLOAT_EPS = 1e-9

describe('generator guarantee: |secant slope − true derivative| <= 0.1', () => {
  it('holds across many generated zoom problems', () => {
    for (let i = 0; i < 1000; i++) {
      const slide = generatePracticeProblem('zoom')
      const c = slide.config as unknown as {
        coefficients: number[]
        targetX: number
        referenceX: number
      }
      const secant =
        (evaluatePoly(c.coefficients, c.referenceX) - evaluatePoly(c.coefficients, c.targetX)) /
        (c.referenceX - c.targetX)
      const trueDeriv = evaluateDerivative(c.coefficients, c.targetX)
      expect(Math.abs(secant - trueDeriv)).toBeLessThanOrEqual(0.1 + FLOAT_EPS)
    }
  })

  it('holds across many generated tangent problems (at the closeness boundary)', () => {
    for (let i = 0; i < 1000; i++) {
      const slide = generatePracticeProblem('tangent')
      const c = slide.config as unknown as {
        coefficients: number[]
        targetX: number
        coincidentThreshold: number
      }
      const trueDeriv = evaluateDerivative(c.coefficients, c.targetX)
      // Worst-case secant the learner can submit while still "close enough".
      const vx = c.targetX + c.coincidentThreshold
      const secant =
        (evaluatePoly(c.coefficients, vx) - evaluatePoly(c.coefficients, c.targetX)) /
        (vx - c.targetX)
      expect(Math.abs(secant - trueDeriv)).toBeLessThanOrEqual(0.1 + FLOAT_EPS)
    }
  })
})
