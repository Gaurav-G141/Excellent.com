import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultipleChoiceSlide } from './MultipleChoiceSlide'
import type { ProblemSlide } from '../../types/lesson'

const slide: ProblemSlide = {
  id: 'l4-mc',
  type: 'problem',
  component: 'multipleChoice',
  title: 'Closing question',
  body: 'Which derivative is correct?',
  config: {
    prompt: 'What is d/dx[2^x]?',
    options: ['2^x', 'x · 2^(x-1)', 'ln(2) · 2^x', '2^x / ln(2)'],
    correctIndex: 2,
  },
  feedback: {
    correct: 'Exactly — the base-rate factor is ln(2).',
    wrong: 'Remember the ln(n) factor from the chain rule.',
  },
  attempts: 'unlimited',
}

describe('MultipleChoiceSlide (L4)', () => {
  it('reveals Continue after the correct option is chosen', async () => {
    const user = userEvent.setup()
    render(<MultipleChoiceSlide slide={slide} onCorrect={() => {}} />)

    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'ln(2) · 2^x' }))

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('shows feedback and stays open when a wrong option is chosen', async () => {
    const user = userEvent.setup()
    render(<MultipleChoiceSlide slide={slide} onCorrect={() => {}} />)

    await user.click(screen.getByRole('button', { name: '2^x' }))

    expect(screen.getByText(/ln\(n\) factor/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
  })

  it('exposes the options as an accessible group', () => {
    render(<MultipleChoiceSlide slide={slide} onCorrect={() => {}} />)
    expect(screen.getByRole('group')).toBeInTheDocument()
  })
})
