import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MeanValueTheoremSlide } from './MeanValueTheoremSlide'
import { MvtMultiPartSlide } from './MvtMultiPartSlide'
import { lesson2Practice } from '../../utils/practice/lesson2'
import {
  derivativeCoefficients,
  evaluatePoly,
  findWhereDerivativeEquals,
} from '../../utils/polynomial'
import { isValidMeanValuePoint } from '../../utils/grading'
import type { DemoSlide, ProblemSlide } from '../../types/lesson'

const CUBIC = [2, -1.5, 0, 0.25] // 0.25x³ − 1.5x + 2

function makeMvtDemoSlide(initialAx: number, initialBx: number): DemoSlide {
  return {
    id: 'mvt-demo',
    type: 'demo',
    component: 'meanValueTheorem',
    title: 'The Mean Value Theorem',
    body: 'body',
    config: {
      coefficients: CUBIC,
      viewport: { xMin: -0.5, xMax: 3.2, yMin: -0.5, yMax: 6 },
      initialAx,
      initialBx,
    },
    ctaLabel: 'Continue',
  }
}

describe('MeanValueTheoremSlide — parallel-tangent enable + coincident epsilon', () => {
  it('keeps "Show parallel tangent" enabled for clearly separated points', () => {
    render(<MeanValueTheoremSlide slide={makeMvtDemoSlide(0.3, 2.8)} onContinue={() => {}} />)
    expect(screen.getByRole('button', { name: /show parallel tangent/i })).toBeEnabled()
  })

  it('keeps it enabled for points just past the 0.02 epsilon (0.05 apart)', () => {
    render(<MeanValueTheoremSlide slide={makeMvtDemoSlide(1.0, 1.05)} onContinue={() => {}} />)
    expect(screen.getByRole('button', { name: /show parallel tangent/i })).toBeEnabled()
  })

  it('disables it only when points are essentially identical (within 0.02)', () => {
    render(<MeanValueTheoremSlide slide={makeMvtDemoSlide(1.5, 1.51)} onContinue={() => {}} />)
    expect(screen.getByRole('button', { name: /show parallel tangent/i })).toBeDisabled()
  })

  it('shows the tangent (derivative) slope when the points coincide', () => {
    const { container } = render(
      <MeanValueTheoremSlide slide={makeMvtDemoSlide(1.5, 1.5)} onContinue={() => {}} />,
    )
    // midX = 1.5 → displayed slope must equal f'(1.5), not a degenerate secant.
    const expected = evaluatePoly(derivativeCoefficients(CUBIC), 1.5).toFixed(2)
    expect(container.querySelector('.slide-hint strong')?.textContent).toBe(expected)
  })

  it('reveals a valid interior c when the tangent is requested for separated points', async () => {
    const user = userEvent.setup()
    render(<MeanValueTheoremSlide slide={makeMvtDemoSlide(0.3, 2.8)} onContinue={() => {}} />)
    await user.click(screen.getByRole('button', { name: /show parallel tangent/i }))
    expect(screen.getByText(/tangent at c =/i)).toBeInTheDocument()
  })
})

// f(x) = 0.25x² on non-integer endpoints to prove the prompt prints the REAL
// numeric endpoints (with 2-decimal formatting).
function makeMultiPartSlide(
  coefficients: number[],
  ax: number,
  bx: number,
  derivativeDisplay: string,
): ProblemSlide {
  return {
    id: 'mvt-multipart',
    type: 'problem',
    component: 'mvtMultiPart',
    title: 'Apply the Mean Value Theorem',
    body: 'body',
    config: {
      coefficients,
      viewport: { xMin: -3, xMax: 3, yMin: -10, yMax: 10 },
      ax,
      bx,
      functionDisplay: 'f',
      derivativeDisplay,
      slopeTolerance: 0.1,
      cTolerance: 0.2,
      derivativeTolerance: 0.12,
    },
    feedback: { correct: '', wrong: 'wrong' },
    attempts: 'unlimited',
  }
}

describe('MvtMultiPartSlide — Part 2 prompt + interior-c grading', () => {
  it('Part 2 prompt names the real numeric endpoints (0.50 and 2.50)', async () => {
    const user = userEvent.setup()
    // 0.25x² on [0.5, 2.5]: secant = (1.5625 − 0.0625) / 2 = 0.75.
    render(
      <MvtMultiPartSlide
        slide={makeMultiPartSlide([0, 0, 0.25], 0.5, 2.5, '0.5x')}
        onCorrect={() => {}}
      />,
    )
    await user.type(screen.getByRole('textbox'), '0.75')
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByText(/You cannot enter 0\.50 or 2\.50/)).toBeInTheDocument()
  })

  it('accepts a valid interior c and rejects an endpoint / invalid interior point', async () => {
    const user = userEvent.setup()
    // f(x) = x³ on [−2, 2]: secant = 4, and 3c² = 4 ⇒ c = ±1.1547 (TWO valid c's).
    const cubic = [0, 0, 0, 1]

    // Endpoint 2 is rejected (out of the open interval).
    const { unmount } = render(
      <MvtMultiPartSlide slide={makeMultiPartSlide(cubic, -2, 2, '3x²')} onCorrect={() => {}} />,
    )
    await user.type(screen.getByRole('textbox'), '4')
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.type(screen.getByRole('textbox'), '2')
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
    unmount()

    // The first valid interior c (≈ 1.1547) is accepted.
    const first = render(
      <MvtMultiPartSlide slide={makeMultiPartSlide(cubic, -2, 2, '3x²')} onCorrect={() => {}} />,
    )
    await user.type(first.getByRole('textbox'), '4')
    await user.click(first.getByRole('button', { name: /check/i }))
    await user.type(first.getByRole('textbox'), '1.155')
    await user.click(first.getByRole('button', { name: /check/i }))
    expect(first.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('also accepts the SECOND valid c (≈ −1.1547)', async () => {
    const user = userEvent.setup()
    const cubic = [0, 0, 0, 1]
    render(<MvtMultiPartSlide slide={makeMultiPartSlide(cubic, -2, 2, '3x²')} onCorrect={() => {}} />)
    await user.type(screen.getByRole('textbox'), '4')
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.type(screen.getByRole('textbox'), '-1.155')
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})

describe('isValidMeanValuePoint — accepts any interior c, rejects endpoints', () => {
  it('accepts both roots of f′(c)=S and rejects the endpoints', () => {
    const deriv = derivativeCoefficients([0, 0, 0, 1]) // f = x³ → f' = 3x²
    const S = 4
    expect(isValidMeanValuePoint(1.1547, deriv, S, -2, 2, 0.12)).toBe(true)
    expect(isValidMeanValuePoint(-1.1547, deriv, S, -2, 2, 0.12)).toBe(true)
    expect(isValidMeanValuePoint(2, deriv, S, -2, 2, 0.12)).toBe(false) // endpoint
    expect(isValidMeanValuePoint(-2, deriv, S, -2, 2, 0.12)).toBe(false) // endpoint
    expect(isValidMeanValuePoint(0, deriv, S, -2, 2, 0.12)).toBe(false) // wrong slope
  })
})

describe('generateMvt — endpoints never satisfy f′=S, interior c always exists', () => {
  const mvtTopic = lesson2Practice.topics.find((t) => t.id === 'l2-mvt')!

  it('holds across many generated MVT problems', () => {
    for (let i = 0; i < 400; i++) {
      const slide = mvtTopic.generate()
      const c = slide.config as unknown as {
        coefficients: number[]
        ax: number
        bx: number
        derivativeTolerance: number
      }
      const lo = Math.min(c.ax, c.bx)
      const hi = Math.max(c.ax, c.bx)
      const secant =
        (evaluatePoly(c.coefficients, hi) - evaluatePoly(c.coefficients, lo)) / (hi - lo)
      const deriv = derivativeCoefficients(c.coefficients)
      const tol = c.derivativeTolerance ?? 0.12

      // Neither endpoint may (nearly) satisfy f'(x) = S.
      expect(Math.abs(evaluatePoly(deriv, lo) - secant)).toBeGreaterThan(tol)
      expect(Math.abs(evaluatePoly(deriv, hi) - secant)).toBeGreaterThan(tol)

      // A valid interior c must exist strictly inside (lo, hi).
      const cValue = findWhereDerivativeEquals(c.coefficients, secant, lo, hi)
      expect(cValue).not.toBeNull()
      expect(cValue! > lo && cValue! < hi).toBe(true)
    }
  })
})
