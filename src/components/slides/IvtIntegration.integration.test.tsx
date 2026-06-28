import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IvtProblemSlide } from './IvtProblemSlide'
import { GraphCanvas } from '../graph/GraphCanvas'
import { lesson3Practice } from '../../utils/practice/lesson3'
import { evaluatePoly } from '../../utils/polynomial'
import type { ProblemSlide } from '../../types/lesson'

const ivtTopic = lesson3Practice.topics.find((t) => t.id === 'l3-ivt')!

interface IvtCfg {
  coefficients: number[]
  ax: number
  bx: number
  guaranteedValue: number
  distractors: number[]
}

describe('IvtProblemSlide — generated problems hide the curve/equation but keep endpoints', () => {
  it('renders no equation text and no .graph-curve, but shows f(a)/f(b) and two dots', () => {
    const slide = ivtTopic.generate() as ProblemSlide
    const { container } = render(<IvtProblemSlide slide={slide} onCorrect={() => {}} />)

    // No misleading equation.
    expect(screen.queryByText(/f\(x\)\s*=/i)).not.toBeInTheDocument()
    // No plotted curve path.
    expect(container.querySelector('.graph-curve')).toBeNull()
    // f(a) and f(b) are still shown.
    expect(screen.getByText(/f\(a\)\s*=/i)).toBeInTheDocument()
    expect(screen.getByText(/f\(b\)\s*=/i)).toBeInTheDocument()
    // Exactly the two endpoint dots are drawn.
    expect(container.querySelectorAll('.graph-target-dot').length).toBe(2)
  })

  it('solves when the guaranteed value is picked', async () => {
    const user = userEvent.setup()
    const slide = ivtTopic.generate() as ProblemSlide
    const { guaranteedValue } = slide.config as unknown as IvtCfg
    render(<IvtProblemSlide slide={slide} onCorrect={() => {}} />)

    await user.click(screen.getByRole('button', { name: String(guaranteedValue) }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('shows feedback and stays open when a distractor is picked', async () => {
    const user = userEvent.setup()
    const slide = ivtTopic.generate() as ProblemSlide
    const { distractors } = slide.config as unknown as IvtCfg
    render(<IvtProblemSlide slide={slide} onCorrect={() => {}} />)

    await user.click(screen.getByRole('button', { name: String(distractors[0]) }))
    expect(screen.getByText(/only guarantees values/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })

  it('builds well-posed problems: guaranteed value strictly inside, distractors outside', () => {
    for (let i = 0; i < 300; i++) {
      const slide = ivtTopic.generate() as ProblemSlide
      const c = slide.config as unknown as IvtCfg
      const fa = evaluatePoly(c.coefficients, Math.min(c.ax, c.bx))
      const fb = evaluatePoly(c.coefficients, Math.max(c.ax, c.bx))
      const lo = Math.min(fa, fb)
      const hi = Math.max(fa, fb)
      expect(c.guaranteedValue).toBeGreaterThan(lo)
      expect(c.guaranteedValue).toBeLessThan(hi)
      for (const d of c.distractors) {
        expect(d < lo || d > hi).toBe(true)
      }
      // All three options distinct.
      const all = [c.guaranteedValue, ...c.distractors]
      expect(new Set(all).size).toBe(all.length)
    }
  })
})

describe('GraphCanvas — hideCurve regression guard', () => {
  const vp = { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }

  it('draws the .graph-curve by default (hideCurve omitted)', () => {
    const { container } = render(<GraphCanvas coefficients={[0, 0, 1]} viewport={vp} />)
    expect(container.querySelector('.graph-curve')).not.toBeNull()
  })

  it('hides the curve only when hideCurve is explicitly set', () => {
    const { container } = render(
      <GraphCanvas coefficients={[0, 0, 1]} viewport={vp} hideCurve />,
    )
    expect(container.querySelector('.graph-curve')).toBeNull()
  })
})
