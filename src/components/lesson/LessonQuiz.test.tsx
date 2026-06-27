import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LessonQuiz } from './LessonQuiz'
import type { ProblemSlide } from '../../types/lesson'

// A minimal interactive problem the SlideRenderer knows how to render+grade.
function mcQuestion(id: string, correct: string): ProblemSlide {
  return {
    id,
    type: 'problem',
    component: 'multipleChoice',
    title: 'Question',
    body: '',
    config: { prompt: 'Pick the right one', options: ['nope', correct], correctIndex: 1 },
    feedback: { correct: '', wrong: 'Not quite.' },
    attempts: 'unlimited',
  }
}

describe('LessonQuiz', () => {
  it('passes when every question is solved on the first try', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    const generate = () => [mcQuestion('q1', 'alpha'), mcQuestion('q2', 'beta')]
    render(<LessonQuiz generate={generate} onPass={onPass} />)

    expect(screen.getByText(/Question 1 of 2/)).toBeInTheDocument()
    expect(screen.getByText(/0\/2 on first try/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'alpha' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByText(/Question 2 of 2/)).toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'beta' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(onPass).toHaveBeenCalledTimes(1)
  })

  it('does not advance on a wrong answer (no skipping)', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    const generate = () => [mcQuestion('q1', 'alpha'), mcQuestion('q2', 'beta')]
    render(<LessonQuiz generate={generate} onPass={onPass} />)

    await user.click(screen.getByRole('button', { name: 'nope' }))

    expect(screen.getByText(/Question 1 of 2/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
  })

  it('a first-try miss fails mastery and offers a fresh quiz', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    const generate = vi.fn(() => [mcQuestion('q1', 'alpha')])
    render(<LessonQuiz generate={generate} onPass={onPass} />)

    // Miss once, dismiss the hint, then solve the same question.
    await user.click(screen.getByRole('button', { name: 'nope' }))
    await user.click(screen.getByRole('button', { name: /try again/i }))
    await user.click(screen.getByRole('button', { name: 'alpha' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Solved, but not on the first try -> not mastered.
    expect(onPass).not.toHaveBeenCalled()
    expect(screen.getByText(/Almost there/)).toBeInTheDocument()
    expect(screen.getByText(/right on the first try/i)).toHaveTextContent('0 of 1')

    // Retake generates a fresh quiz and returns to question 1.
    await user.click(screen.getByRole('button', { name: /try a new quiz/i }))
    expect(generate).toHaveBeenCalledTimes(2)
    expect(screen.getByText(/Question 1 of 1/)).toBeInTheDocument()
  })
})
