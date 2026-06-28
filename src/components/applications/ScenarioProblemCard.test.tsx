import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ScenarioProblem } from '../../utils/applications/scenarioTypes'

// gradeFreeResponse and clarifyQuestion are the AI seams in the card. Drive them
// from the test.
const { gradeMock, clarifyMock } = vi.hoisted(() => ({
  gradeMock: vi.fn(),
  clarifyMock: vi.fn(),
}))
vi.mock('../../lib/aiGrade', () => ({ gradeFreeResponse: gradeMock }))
vi.mock('../../utils/applications/scenarioClarify', () => ({ clarifyQuestion: clarifyMock }))

import { ScenarioProblemCard } from './ScenarioProblemCard'

function makeScenario(): ScenarioProblem {
  return {
    id: 's1',
    topicId: 't1',
    title: 'A Test Scenario',
    prompt: 'Solve the three steps.',
    given: 'P(x) = x',
    steps: [
      {
        id: 'concept',
        tier: 'core',
        kind: 'frq',
        prompt: 'Explain the idea.',
        rubric: 'the idea',
        fallbackKeywords: [['idea']],
      },
      { id: 'value', tier: 'core', kind: 'number', prompt: 'Enter the number.', expected: 12 },
      {
        id: 'pick',
        tier: 'core',
        kind: 'choice',
        prompt: 'Pick the right one.',
        options: [3, 6, 9],
        correct: 6,
      },
    ],
  }
}

// Two consecutive FRQ steps, used to exercise clarify state across step changes.
function makeTwoFrqScenario(): ScenarioProblem {
  return {
    id: 's2',
    topicId: 't2',
    title: 'Two FRQ Scenario',
    prompt: 'Answer both questions.',
    steps: [
      {
        id: 'q1',
        tier: 'core',
        kind: 'frq',
        prompt: 'First question.',
        rubric: 'r1',
        fallbackKeywords: [['alpha']],
      },
      {
        id: 'q2',
        tier: 'core',
        kind: 'frq',
        prompt: 'Second question.',
        rubric: 'r2',
        fallbackKeywords: [['beta']],
      },
    ],
  }
}

beforeEach(() => {
  gradeMock.mockReset()
  clarifyMock.mockReset()
})

describe('ScenarioProblemCard', () => {
  it('walks through FRQ → number → choice and reports solved', async () => {
    gradeMock.mockResolvedValue({ correct: true, feedback: 'Great.' })
    const onSolved = vi.fn()
    const user = userEvent.setup()

    render(
      <ScenarioProblemCard problem={makeScenario()} level={1} onSolved={onSolved} />,
    )

    // Step 1: free response.
    await user.type(screen.getByPlaceholderText(/explain your thinking/i), 'my idea here')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Step 2: numeric — appears once the FRQ is accepted.
    const numberInput = await screen.findByPlaceholderText(/enter a number/i)
    await user.type(numberInput, '12')
    await user.click(screen.getByRole('button', { name: /check answer/i }))

    // Step 3: multiple choice.
    await screen.findByText('Pick the right one.')
    await user.click(screen.getByRole('button', { name: '6' }))
    await user.click(screen.getByRole('button', { name: /check answer/i }))

    await waitFor(() => expect(onSolved).toHaveBeenCalledTimes(1))
    expect(onSolved.mock.calls[0][0]).toMatchObject({ solved: true, skipped: false })
  })

  it('reports a wrong attempt and shows a hint, without advancing', async () => {
    gradeMock.mockResolvedValue({ correct: true, feedback: 'ok' })
    const onWrongAttempt = vi.fn()
    const onSolved = vi.fn()
    const user = userEvent.setup()

    render(
      <ScenarioProblemCard
        problem={makeScenario()}
        level={1}
        onSolved={onSolved}
        onWrongAttempt={onWrongAttempt}
      />,
    )

    // Clear the FRQ step first.
    await user.type(screen.getByPlaceholderText(/explain your thinking/i), 'my idea here')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Wrong number → wrong-attempt callback fires and we stay on the number step.
    const numberInput = await screen.findByPlaceholderText(/enter a number/i)
    await user.type(numberInput, '99')
    await user.click(screen.getByRole('button', { name: /check answer/i }))

    await waitFor(() => expect(onWrongAttempt).toHaveBeenCalledTimes(1))
    expect(onSolved).not.toHaveBeenCalled()
    expect(screen.getByPlaceholderText(/enter a number/i)).toBeTruthy()
  })

  it('falls back to the local keyword check when AI grading is unavailable', async () => {
    gradeMock.mockResolvedValue(null) // AI off
    const onSolved = vi.fn()
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={makeScenario()} level={1} onSolved={onSolved} />)

    // Answer hits the fallback keyword "idea" → accepted, advances to the number step.
    await user.type(screen.getByPlaceholderText(/explain your thinking/i), 'the key idea is balance')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByPlaceholderText(/enter a number/i)).toBeTruthy()
  })

  it('clarify button replaces the FRQ wording with the reworded version', async () => {
    clarifyMock.mockResolvedValue('A clearer version of the question.')
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={makeScenario()} level={1} onSolved={vi.fn()} />)

    expect(screen.getByText('Explain the idea.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /clarify question/i }))

    expect(await screen.findByText('A clearer version of the question.')).toBeTruthy()
    expect(screen.queryByText('Explain the idea.')).toBeNull()
    expect(screen.getByText(/reworded for clarity/i)).toBeTruthy()
    // The button now offers another reword.
    expect(screen.getByRole('button', { name: /reword again/i })).toBeTruthy()
  })

  it('keeps the original wording when clarify is unavailable', async () => {
    clarifyMock.mockResolvedValue(null)
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={makeScenario()} level={1} onSolved={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /clarify question/i }))

    // Original stays; a gentle note is shown via the feedback popup.
    expect(await screen.findByText(/could not be reworded/i)).toBeTruthy()
    expect(screen.getByText('Explain the idea.')).toBeTruthy()
  })

  it('only offers clarify on the FRQ step, not code-graded steps', async () => {
    clarifyMock.mockResolvedValue('x')
    gradeMock.mockResolvedValue({ correct: true, feedback: 'ok' })
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={makeScenario()} level={1} onSolved={vi.fn()} />)

    // Advance past the FRQ into the numeric step.
    await user.type(screen.getByPlaceholderText(/explain your thinking/i), 'my idea here')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    await screen.findByPlaceholderText(/enter a number/i)

    expect(screen.queryByRole('button', { name: /clarify question/i })).toBeNull()
  })

  it('rewords again from the original wording, never compounding on the clarified text', async () => {
    clarifyMock
      .mockResolvedValueOnce('Clarified version one.')
      .mockResolvedValueOnce('Clarified version two.')
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={makeScenario()} level={1} onSolved={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /clarify question/i }))
    expect(await screen.findByText('Clarified version one.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reword again/i }))
    expect(await screen.findByText('Clarified version two.')).toBeInTheDocument()
    expect(screen.queryByText('Clarified version one.')).toBeNull()

    // Both reword requests must use the ORIGINAL question, not the prior reword,
    // so repeated clarifies never drift away from what was actually asked.
    expect(clarifyMock).toHaveBeenCalledTimes(2)
    expect(clarifyMock.mock.calls[0][0]).toMatchObject({ question: 'Explain the idea.' })
    expect(clarifyMock.mock.calls[1][0]).toMatchObject({ question: 'Explain the idea.' })
  })

  it('resets clarify state when advancing to the next step', async () => {
    clarifyMock.mockResolvedValue('Clarified first question.')
    gradeMock.mockResolvedValue({ correct: true, feedback: 'ok' })
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={makeTwoFrqScenario()} level={1} onSolved={vi.fn()} />)

    // Clarify the first FRQ step.
    await user.click(screen.getByRole('button', { name: /clarify question/i }))
    expect(await screen.findByText('Clarified first question.')).toBeInTheDocument()
    expect(screen.getByText(/reworded for clarity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reword again/i })).toBeInTheDocument()

    // Answer step 1, advancing to step 2.
    await user.type(screen.getByPlaceholderText(/explain your thinking/i), 'alpha answer')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Step 2 starts fresh: its original wording, no "reworded" note, and the
    // button is back to the initial "Clarify question" affordance.
    expect(await screen.findByText('Second question.')).toBeInTheDocument()
    expect(screen.queryByText(/reworded for clarity/i)).toBeNull()
    expect(screen.getByRole('button', { name: /clarify question/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reword again/i })).toBeNull()
  })

  it('disables the clarify button while an FRQ answer is being graded', async () => {
    let resolveGrade: (v: { correct: boolean; feedback: string }) => void = () => {}
    gradeMock.mockReturnValue(
      new Promise<{ correct: boolean; feedback: string }>((resolve) => {
        resolveGrade = resolve
      }),
    )
    clarifyMock.mockResolvedValue('should never be requested while grading')
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={makeScenario()} level={1} onSolved={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/explain your thinking/i), 'my idea here')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Grading is in flight (the promise is still pending): clarify is locked out.
    const clarifyBtn = screen.getByRole('button', { name: /clarify question/i })
    await waitFor(() => expect(clarifyBtn).toBeDisabled())

    // Let grading settle (wrong) — the same step stays, clarify re-enables.
    resolveGrade({ correct: false, feedback: 'nope' })
    await waitFor(() => expect(clarifyBtn).not.toBeDisabled())
    expect(clarifyMock).not.toHaveBeenCalled()
  })

  it('ignores an in-flight clarify that resolves after the step has advanced', async () => {
    let resolveClarify: (v: string | null) => void = () => {}
    clarifyMock.mockReturnValue(
      new Promise<string | null>((resolve) => {
        resolveClarify = resolve
      }),
    )
    gradeMock.mockResolvedValue({ correct: true, feedback: 'ok' })
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={makeTwoFrqScenario()} level={1} onSolved={vi.fn()} />)

    // Start a clarify on step 1 that has not resolved yet.
    await user.click(screen.getByRole('button', { name: /clarify question/i }))
    expect(screen.getByRole('button', { name: /rewording/i })).toBeInTheDocument()

    // Advance to step 2 before the clarify comes back.
    await user.type(screen.getByPlaceholderText(/explain your thinking/i), 'alpha answer')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(await screen.findByText('Second question.')).toBeInTheDocument()

    // The stale clarify resolves now — it must NOT replace step 2's wording.
    await act(async () => {
      resolveClarify('Stale clarified text for step 1.')
      await Promise.resolve()
    })

    expect(screen.queryByText('Stale clarified text for step 1.')).toBeNull()
    expect(screen.getByText('Second question.')).toBeInTheDocument()
    // Step 2's clarify affordance is untouched (still the initial state).
    expect(screen.getByRole('button', { name: /clarify question/i })).toBeInTheDocument()
  })
})
