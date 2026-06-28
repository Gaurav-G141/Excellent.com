/**
 * Cross-agent integration check for the NEW endpoints-only IVT scenario
 * (s3-ivt, scenarios/lesson3.ts) rendered through the LIVE ScenarioProblemCard +
 * scenarioGrade path — the exact renderer/grader the Applications tab uses.
 *
 * This guards the seam the unit specs can't: that every step kind the generator
 * emits (an FRQ concept step + a numeric/choice "guaranteed value" step) is
 * actually supported end-to-end by the card, and that the problem grades to a
 * solved outcome without throwing. It also re-asserts the generator invariants
 * over many runs (no GIVEN, strictly-interior guaranteed value, all distractors
 * outside the endpoint range, subject noun present, calculus never named).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SCENARIO_LESSONS } from '../../utils/applications/scenarios'
import { resolveStepPrompt, visibleSteps } from '../../utils/applications/scenarioTypes'
import type { ScenarioProblem, ScenarioTopicDef } from '../../utils/applications/scenarioTypes'

// The two AI seams in the card; drive them from the test so nothing hits a model.
const { gradeMock, clarifyMock } = vi.hoisted(() => ({
  gradeMock: vi.fn(),
  clarifyMock: vi.fn(),
}))
vi.mock('../../lib/aiGrade', () => ({ gradeFreeResponse: gradeMock }))
vi.mock('../../utils/applications/scenarioClarify', () => ({ clarifyQuestion: clarifyMock }))

import { ScenarioProblemCard } from './ScenarioProblemCard'

/** The live s3-ivt topic from the registry (not a hand-built fixture). */
function ivtTopic(): ScenarioTopicDef {
  const topic = SCENARIO_LESSONS.flatMap((g) => g.topics).find((t) => t.id === 's3-ivt')
  if (!topic) throw new Error('s3-ivt topic missing from the registry')
  return topic
}

/** Calculus names that must never reach the learner-facing text. */
const BANNED_TERMS = [
  'derivative',
  'rate of change',
  'integral',
  'mean value theorem',
  'intermediate value theorem',
  'chain rule',
  'power rule',
  'related rates',
  'differentiate',
  'calculus',
  'velocity',
  'acceleration',
  'critical point',
  'tangent',
  'secant',
  'polynomial',
]

/** Every learner-visible string for one problem, across all difficulty bands. */
function learnerFacingText(p: ScenarioProblem): string {
  const parts: string[] = [p.title, p.prompt, p.idealAnswer ?? '']
  for (const lvl of [1, 9, 15]) {
    for (const s of visibleSteps(p.steps, lvl)) {
      parts.push(resolveStepPrompt(s.prompt, lvl))
      for (const h of s.hints ?? []) parts.push(h)
    }
  }
  return parts.join(' \n ').toLowerCase()
}

beforeEach(() => {
  gradeMock.mockReset()
  clarifyMock.mockReset()
})

describe('s3-ivt generator invariants (sampled across regenerations)', () => {
  it('is endpoints-only with a strictly-interior guaranteed value and outside distractors', () => {
    const topic = ivtTopic()
    for (let i = 0; i < 60; i++) {
      const p = topic.generate()

      // Endpoints-only: NO given formula to read.
      expect(p.given).toBeUndefined()

      // Exactly one FRQ concept step + one choice "guaranteed value" step.
      const frqs = p.steps.filter((s) => s.kind === 'frq')
      expect(frqs).toHaveLength(1)
      const choice = p.steps.find((s) => s.kind === 'choice')
      if (!choice || choice.kind !== 'choice') throw new Error('no choice step')

      // The subject noun survives into the prompt (rewrite-guard contract).
      expect(p.subjectTerms?.length).toBeGreaterThan(0)
      for (const term of p.subjectTerms ?? []) {
        expect(p.prompt.toLowerCase()).toContain(term.toLowerCase())
      }

      // The two endpoint readings (lo < hi) appear in the prompt.
      const nums = (p.prompt.match(/\d+/g) ?? []).map(Number)
      const lo = Math.min(...nums)
      const hi = Math.max(...nums)
      expect(hi).toBeGreaterThan(lo)

      // The guaranteed value is STRICTLY between the endpoints...
      expect(choice.correct).toBeGreaterThan(lo)
      expect(choice.correct).toBeLessThan(hi)

      // ...and is the ONLY interior option; every distractor is strictly outside.
      const interior = choice.options.filter((o) => o > lo && o < hi)
      expect(interior).toEqual([choice.correct])
      for (const opt of choice.options) {
        if (opt === choice.correct) continue
        expect(opt < lo || opt > hi).toBe(true)
      }
    }
  })

  it('never names the calculus in any learner-facing text', () => {
    const topic = ivtTopic()
    for (let i = 0; i < 40; i++) {
      const text = learnerFacingText(topic.generate())
      for (const term of BANNED_TERMS) {
        expect(text, `"${term}" leaked into IVT learner text`).not.toContain(term)
      }
    }
  })
})

describe('s3-ivt rendered LIVE through ScenarioProblemCard', () => {
  it('walks FRQ → choice and reports solved end-to-end (every step kind supported)', async () => {
    gradeMock.mockResolvedValue({ correct: true, feedback: 'Nice reasoning.' })
    const problem = ivtTopic().generate()
    const choice = problem.steps.find((s) => s.kind === 'choice')
    if (!choice || choice.kind !== 'choice') throw new Error('no choice step')

    const onSolved = vi.fn()
    const user = userEvent.setup()

    render(<ScenarioProblemCard problem={problem} level={1} onSolved={onSolved} />)

    // The real prompt + subject render without error.
    expect(screen.getByText(problem.title)).toBeInTheDocument()

    // Step 1 — the AI-graded concept FRQ.
    await user.type(
      screen.getByPlaceholderText(/explain your thinking/i),
      'It changes smoothly with no jumps, so it must pass through that value.',
    )
    await user.click(screen.getByRole('button', { name: /submit/i }))

    // Step 2 — the choice "guaranteed value" step. Pick the interior value.
    const correctBtn = await screen.findByRole('button', { name: String(choice.correct) })
    await user.click(correctBtn)
    await user.click(screen.getByRole('button', { name: /check answer/i }))

    await waitFor(() => expect(onSolved).toHaveBeenCalledTimes(1))
    expect(onSolved.mock.calls[0][0]).toMatchObject({ solved: true, skipped: false })
  })

  it('rejects an outside-range distractor and stays on the choice step', async () => {
    gradeMock.mockResolvedValue({ correct: true, feedback: 'ok' })
    const problem = ivtTopic().generate()
    const choice = problem.steps.find((s) => s.kind === 'choice')
    if (!choice || choice.kind !== 'choice') throw new Error('no choice step')
    const distractor = choice.options.find((o) => o !== choice.correct)!

    const onSolved = vi.fn()
    const onWrongAttempt = vi.fn()
    const user = userEvent.setup()

    render(
      <ScenarioProblemCard
        problem={problem}
        level={1}
        onSolved={onSolved}
        onWrongAttempt={onWrongAttempt}
      />,
    )

    await user.type(
      screen.getByPlaceholderText(/explain your thinking/i),
      'It moves continuously between the two readings.',
    )
    await user.click(screen.getByRole('button', { name: /submit/i }))

    const wrongBtn = await screen.findByRole('button', { name: String(distractor) })
    await user.click(wrongBtn)
    await user.click(screen.getByRole('button', { name: /check answer/i }))

    await waitFor(() => expect(onWrongAttempt).toHaveBeenCalledTimes(1))
    expect(onSolved).not.toHaveBeenCalled()
    // Still on the choice step — the guaranteed-value question is still asked.
    expect(screen.getByRole('button', { name: String(choice.correct) })).toBeInTheDocument()
  })

  it('falls back to local keyword grading when the AI grader is unavailable', async () => {
    gradeMock.mockResolvedValue(null) // AI off → heuristic fallback path.
    const problem = ivtTopic().generate()
    const choice = problem.steps.find((s) => s.kind === 'choice')
    if (!choice || choice.kind !== 'choice') throw new Error('no choice step')

    const onSolved = vi.fn()
    const user = userEvent.setup()
    render(<ScenarioProblemCard problem={problem} level={1} onSolved={onSolved} />)

    // Hits both fallback OR-groups ("yes"/"must" and "continu"/"smooth"/"jump").
    await user.type(
      screen.getByPlaceholderText(/explain your thinking/i),
      'Yes, it must be true: the value changes smoothly and continuously with no jump.',
    )
    await user.click(screen.getByRole('button', { name: /submit/i }))

    const correctBtn = await screen.findByRole('button', { name: String(choice.correct) })
    await user.click(correctBtn)
    await user.click(screen.getByRole('button', { name: /check answer/i }))

    await waitFor(() => expect(onSolved).toHaveBeenCalledTimes(1))
  })
})
