import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RelatedRatesProblemSlide } from './RelatedRatesProblemSlide'
import type { ProblemSlide } from '../../types/lesson'

const baseSlide = (config: object): ProblemSlide => ({
  id: 's',
  type: 'problem',
  component: 'relatedRates',
  title: 'Relate the rates',
  body: 'Differentiate…',
  config,
  feedback: { correct: '', wrong: '' },
  attempts: 'unlimited',
})

describe('RelatedRatesProblemSlide', () => {
  it('renders a fallback problem when config is empty [regression: no crash]', () => {
    expect(() =>
      render(<RelatedRatesProblemSlide slide={baseSlide({})} onCorrect={() => {}} />),
    ).not.toThrow()
    // A generated problem always asks "how fast is …".
    expect(screen.getByText(/how fast/i)).toBeInTheDocument()
  })

  it('renders the problem supplied via config', () => {
    const problem = {
      shape: 'square' as const,
      prompt: 'A square grows; how fast is its area changing?',
      scaffold: 'dA/dt = 2s · ds/dt',
      exact: 12,
      measureUnit: 'cm²/s',
      hint: 'dA/ds = 2s',
    }
    render(<RelatedRatesProblemSlide slide={baseSlide({ problem })} onCorrect={() => {}} />)
    expect(screen.getByText(problem.prompt)).toBeInTheDocument()
    expect(screen.getByText(problem.scaffold)).toBeInTheDocument()
  })
})
