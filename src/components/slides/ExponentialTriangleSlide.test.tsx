import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { matchesNumber } from '../../utils/expression'
import {
  ExponentialTriangleSlide,
  ExponentialTriangleQuestionSlide,
  evalForVariant,
  trueSlope,
  correctIntercept,
  constructedSlope,
  type ExponentialTriangleConfig,
} from './ExponentialTriangleSlide'
import type { DemoSlide, ProblemSlide } from '../../types/lesson'

function demoSlide(config: ExponentialTriangleConfig): DemoSlide {
  return {
    id: 'demo',
    type: 'demo',
    component: 'exponentialTriangle',
    title: 'Slope of an exponential',
    body: 'Drag the point.',
    config: config as unknown as Record<string, unknown>,
  }
}

function problemSlide(config: ExponentialTriangleConfig): ProblemSlide {
  return {
    id: 'q',
    type: 'problem',
    component: 'exponentialTriangleQuestion',
    title: 'Find the slope',
    body: 'Build the triangle.',
    config: config as unknown as Record<string, unknown>,
    feedback: { correct: 'Yes!', wrong: 'Try again.' },
    attempts: 'unlimited',
  }
}

const expViewport = { xMin: -2, xMax: 2, yMin: -0.5, yMax: 4 }
const lnViewport = { xMin: -1, xMax: 5, yMin: -1.5, yMax: 3 }

describe('true-derivative + geometry helpers', () => {
  it('exp: f(x) = eˣ, f′(x) = eˣ, tangent x-intercept = x − 1', () => {
    expect(evalForVariant('exp', 0)).toBeCloseTo(1)
    expect(trueSlope('exp', 0)).toBeCloseTo(1)
    expect(trueSlope('exp', 1)).toBeCloseTo(Math.E)
    expect(correctIntercept('exp', 0)).toBeCloseTo(-1)
    // At the correct intercept the constructed slope equals the true slope.
    expect(constructedSlope('exp', 0, correctIntercept('exp', 0))).toBeCloseTo(1)
    expect(constructedSlope('exp', 1, correctIntercept('exp', 1))).toBeCloseTo(Math.E)
  })

  it('ln: f(x) = ln x (NaN for x ≤ 0), f′(x) = 1/x, tangent y-intercept = ln x − 1', () => {
    expect(evalForVariant('ln', Math.E)).toBeCloseTo(1)
    expect(Number.isNaN(evalForVariant('ln', 0))).toBe(true)
    expect(trueSlope('ln', 2)).toBeCloseTo(0.5)
    expect(correctIntercept('ln', 2)).toBeCloseTo(Math.log(2) - 1)
    expect(constructedSlope('ln', 2, correctIntercept('ln', 2))).toBeCloseTo(0.5)
  })
})

describe('grading accepts the true slope and rejects wrong answers', () => {
  it('exp at x = 0: accepts 1, rejects 3', () => {
    const expected = trueSlope('exp', 0)
    expect(matchesNumber('1', expected, 0.1)).toBe(true)
    expect(matchesNumber('3', expected, 0.1)).toBe(false)
  })

  it('ln at x = 2: accepts 0.5 and ".5", rejects 2', () => {
    const expected = trueSlope('ln', 2)
    expect(matchesNumber('0.5', expected, 0.1)).toBe(true)
    expect(matchesNumber('.5', expected, 0.1)).toBe(true) // leading-dot regression
    expect(matchesNumber('1/2', expected, 0.1)).toBe(true)
    expect(matchesNumber('2', expected, 0.1)).toBe(false)
  })
})

describe('renders + interaction', () => {
  it('demo: exp variant renders', () => {
    render(
      <ExponentialTriangleSlide
        slide={demoSlide({ variant: 'exp', viewport: expViewport, initialX: 1 })}
        onContinue={() => {}}
      />,
    )
    expect(screen.getByText('Slope of an exponential')).toBeInTheDocument()
  })

  it('demo: ln variant has a reflect button', () => {
    render(
      <ExponentialTriangleSlide
        slide={demoSlide({ variant: 'ln', viewport: { xMin: -1, xMax: 6, yMin: -2, yMax: 6 }, initialX: 2 })}
        onContinue={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: /reflect/i })).toBeInTheDocument()
  })

  it('problem: the triangle + readout are visible BEFORE solving, with a draggable intercept', () => {
    render(
      <ExponentialTriangleQuestionSlide
        slide={problemSlide({ variant: 'exp', viewport: expViewport, initialX: 0, tolerance: 0.1 })}
        onCorrect={() => {}}
      />,
    )
    expect(screen.getByTestId('constructed-readout')).toBeInTheDocument()
    const handle = screen.getByRole('slider', { name: /intercept/i })
    expect(handle).toBeInTheDocument()
    expect(handle).toHaveAttribute('tabindex', '0')
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })

  it('problem exp (x = 0): accepts typed slope 1 and reveals Continue', async () => {
    const user = userEvent.setup()
    render(
      <ExponentialTriangleQuestionSlide
        slide={problemSlide({ variant: 'exp', viewport: expViewport, initialX: 0, tolerance: 0.1 })}
        onCorrect={() => {}}
      />,
    )
    await user.type(screen.getByRole('textbox'), '1')
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('problem exp (x = 0): rejects a wrong slope and keeps asking', async () => {
    const user = userEvent.setup()
    render(
      <ExponentialTriangleQuestionSlide
        slide={problemSlide({ variant: 'exp', viewport: expViewport, initialX: 0, tolerance: 0.1 })}
        onCorrect={() => {}}
      />,
    )
    await user.type(screen.getByRole('textbox'), '3')
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByText('Try again.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })

  it('problem ln (x = 2): accepts typed ".5" and reveals Continue', async () => {
    const user = userEvent.setup()
    render(
      <ExponentialTriangleQuestionSlide
        slide={problemSlide({ variant: 'ln', viewport: lnViewport, initialX: 2, tolerance: 0.1 })}
        onCorrect={() => {}}
      />,
    )
    await user.type(screen.getByRole('textbox'), '.5')
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('problem: dragging the intercept to the answer (keyboard) then Check accepts it', async () => {
    const user = userEvent.setup()
    const dragTol = 0.25
    render(
      <ExponentialTriangleQuestionSlide
        slide={problemSlide({ variant: 'exp', viewport: expViewport, initialX: 0, tolerance: dragTol })}
        onCorrect={() => {}}
      />,
    )
    const handle = screen.getByRole('slider', { name: /intercept/i })
    handle.focus()
    // Move the x-intercept toward x − 1 = −1 (where slope = 1).
    for (let i = 0; i < 120; i++) {
      const now = Number(handle.getAttribute('aria-valuenow'))
      if (now >= -1) break
      await user.keyboard('{ArrowRight}')
    }
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('problem: a correctly built triangle passes even with stale wrong text in the input', async () => {
    const user = userEvent.setup()
    const dragTol = 0.25
    render(
      <ExponentialTriangleQuestionSlide
        slide={problemSlide({ variant: 'exp', viewport: expViewport, initialX: 0, tolerance: dragTol })}
        onCorrect={() => {}}
      />,
    )
    await user.type(screen.getByRole('textbox'), '2') // stale wrong value
    const handle = screen.getByRole('slider', { name: /intercept/i })
    handle.focus()
    for (let i = 0; i < 120; i++) {
      const now = Number(handle.getAttribute('aria-valuenow'))
      if (now >= -1) break
      await user.keyboard('{ArrowRight}')
    }
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})
