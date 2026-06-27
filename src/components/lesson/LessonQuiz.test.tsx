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
  it('advances only after each question is solved and calls onPass at the end', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    const questions = [mcQuestion('q1', 'alpha'), mcQuestion('q2', 'beta')]
    render(<LessonQuiz questions={questions} onPass={onPass} />)

    expect(screen.getByText('Quiz · Question 1 of 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'alpha' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByText('Quiz · Question 2 of 2')).toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'beta' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(onPass).toHaveBeenCalledTimes(1)
  })

  it('does not advance on a wrong answer (no skipping)', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    const questions = [mcQuestion('q1', 'alpha'), mcQuestion('q2', 'beta')]
    render(<LessonQuiz questions={questions} onPass={onPass} />)

    await user.click(screen.getByRole('button', { name: 'nope' }))

    expect(screen.getByText('Quiz · Question 1 of 2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
  })
})
