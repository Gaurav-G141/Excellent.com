import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import type { ScenarioProblem } from './scenarioTypes'

// Mock the AI layer. getJsonModel is the seam: rewriteScenario falls back to the
// base scenario whenever it returns null, otherwise drives model.generateContent.
// Keep the real Schema export (scenarioRewrite builds its schema at load).
const { getJsonModelMock } = vi.hoisted(() => ({ getJsonModelMock: vi.fn() }))

vi.mock('../../lib/ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/ai')>()
  return { ...actual, getJsonModel: getJsonModelMock }
})

import { rewriteScenario } from './scenarioRewrite'

function makeScenario(): ScenarioProblem {
  return {
    id: 's1',
    topicId: 't1',
    title: 'Base Title',
    prompt: 'A colony grows along a known path. How many helpers keep it steady on day 5?',
    given: 'P(x) = 2x^2 + 5x',
    idealAnswer: 'Stay steady means removing as fast as it grows.',
    steps: [
      {
        id: 'concept',
        tier: 'core',
        kind: 'frq',
        prompt: 'What must be true to stay steady?',
        rubric: 'removal equals growth',
      },
      {
        id: 'evaluate',
        tier: 'scaffold',
        kind: 'number',
        prompt: 'How fast is it changing on day 5?',
        expected: 37,
      },
      {
        id: 'final',
        tier: 'core',
        kind: 'choice',
        prompt: 'How many helpers?',
        options: [3, 6, 9],
        correct: 6,
      },
    ],
  }
}

const VALID_OUTPUT = {
  title: 'Meadow Balance',
  prompt: 'A meadow hums with life. How many songbirds settle things on the fifth morning?',
}

function modelReturningText(text: string) {
  return { generateContent: vi.fn(async () => ({ response: { text: () => text } })) }
}

function modelReturningJson(obj: unknown) {
  return modelReturningText(JSON.stringify(obj))
}

beforeEach(() => {
  getJsonModelMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('rewriteScenario: fallback when AI is unavailable', () => {
  it('returns the SAME scenario object when getJsonModel returns null', async () => {
    getJsonModelMock.mockReturnValue(null)
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 7)).toBe(scenario)
  })
})

describe('rewriteScenario: successful rewrite preserves all math', () => {
  it('returns a clone with new title/prompt but identical steps/given', async () => {
    getJsonModelMock.mockReturnValue(modelReturningJson(VALID_OUTPUT))
    const scenario = makeScenario()
    const original = makeScenario()

    const result = await rewriteScenario(scenario, 9)

    expect(result).not.toBe(scenario)
    expect(result.title).toBe(VALID_OUTPUT.title)
    expect(result.prompt).toBe(VALID_OUTPUT.prompt)
    // Steps, given, and identity are untouched.
    expect(result.steps).toEqual(original.steps)
    expect(result.given).toBe(original.given)
    expect(result.id).toBe(original.id)
    expect(result.topicId).toBe(original.topicId)
  })

  it('does not mutate the original scenario', async () => {
    getJsonModelMock.mockReturnValue(modelReturningJson(VALID_OUTPUT))
    const scenario = makeScenario()
    const snapshot = JSON.parse(JSON.stringify(scenario))
    await rewriteScenario(scenario, 5)
    expect(JSON.parse(JSON.stringify(scenario))).toEqual(snapshot)
  })
})

describe('rewriteScenario: fallback on bad / unsafe output', () => {
  it('falls back on non-JSON text', async () => {
    getJsonModelMock.mockReturnValue(modelReturningText('not json {'))
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 8)).toBe(scenario)
  })

  it('falls back when output contains banned jargon', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({ ...VALID_OUTPUT, prompt: 'Find the rate of change of the colony.' }),
    )
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 8)).toBe(scenario)
  })

  it('falls back when a high-band rewrite still names the operation', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({ ...VALID_OUTPUT, prompt: 'How fast does the meadow change?' }),
    )
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 14)).toBe(scenario)
  })

  it('falls back when the rewrite leaks a step answer absent from the base', async () => {
    // The number step answer is 37; the base prose carries only {5}. A leaked 37
    // must be rejected.
    getJsonModelMock.mockReturnValue(
      modelReturningJson({ ...VALID_OUTPUT, prompt: 'On day 5 the meadow counted 37 visitors.' }),
    )
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 9)).toBe(scenario)
  })

  it('falls back when the rewrite leaks a choice option absent from the base', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({ ...VALID_OUTPUT, prompt: 'On day 5, exactly 9 friends arrived.' }),
    )
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 9)).toBe(scenario)
  })

  it('accepts a rewrite that reuses a base number that is not an answer', async () => {
    // 5 appears in the base prompt/given, so reusing it as flavor is whitelisted.
    getJsonModelMock.mockReturnValue(
      modelReturningJson({ ...VALID_OUTPUT, prompt: 'The meadow had been calm for 5 mornings.' }),
    )
    const scenario = makeScenario()
    const result = await rewriteScenario(scenario, 9)
    expect(result).not.toBe(scenario)
    expect(result.prompt).toBe('The meadow had been calm for 5 mornings.')
  })

  it('falls back when the rewrite drops/renames a required subject', async () => {
    // The steps talk about a "beanbag"; a rewrite that swaps it for a "guitar
    // pick" would leave the prompt and steps describing different objects.
    const scenario = { ...makeScenario(), subjectTerms: ['beanbag'] }
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        title: 'Backstage Toss',
        prompt: 'A roadie flicks a guitar pick straight up. When is it highest?',
      }),
    )
    expect(await rewriteScenario(scenario, 9)).toBe(scenario)
  })

  it('accepts a reskin that keeps the required subject', async () => {
    const scenario = { ...makeScenario(), subjectTerms: ['beanbag'] }
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        title: 'Backstage Toss',
        prompt: 'Between sets, a roadie tosses a beanbag straight up. When is it highest?',
      }),
    )
    const result = await rewriteScenario(scenario, 9)
    expect(result).not.toBe(scenario)
    expect(result.prompt).toContain('beanbag')
  })

  it('never throws when generateContent throws', async () => {
    getJsonModelMock.mockReturnValue({
      generateContent: vi.fn(async () => {
        throw new Error('network down')
      }),
    })
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 8)).toBe(scenario)
  })
})

describe('rewriteScenario: full step rewrite (re-theming)', () => {
  const themed = {
    title: 'Ladybug Garden',
    prompt: 'Ladybugs settle across a rose bed. How many helpers keep the count steady on the fifth day?',
    steps: [
      { question: 'What has to be true for the ladybug count to hold steady?', hints: ['Think about balance.'] },
      { question: 'How quickly is the number of ladybugs shifting on the fifth day?', hints: [] },
      { question: 'So how many helpers are needed?', hints: ['Use your last result.'] },
    ],
  }

  it('rewrites every step prompt/hints while preserving all answers', async () => {
    getJsonModelMock.mockReturnValue(modelReturningJson(themed))
    const scenario = makeScenario()
    const original = makeScenario()

    const result = await rewriteScenario(scenario, 6)

    expect(result.prompt).toBe(themed.prompt)
    expect(result.steps[0].prompt).toBe(themed.steps[0].question)
    expect(result.steps[1].prompt).toBe(themed.steps[1].question)
    expect(result.steps[2].prompt).toBe(themed.steps[2].question)
    // Hints rewritten where provided; left untouched where the rewrite gave none.
    expect(result.steps[0].hints).toEqual(['Think about balance.'])
    // Every code-owned answer field is preserved exactly.
    expect((result.steps[1] as { expected: number }).expected).toBe(37)
    expect((result.steps[2] as { options: number[] }).options).toEqual([3, 6, 9])
    expect((result.steps[2] as { correct: number }).correct).toBe(6)
    expect((result.steps[0] as { rubric: string }).rubric).toBe(
      (original.steps[0] as { rubric: string }).rubric,
    )
  })

  it('allows recasting the subject when the steps are rewritten too', async () => {
    // With a full step rewrite the prompt+steps are re-themed together, so the
    // original subject ("beanbag") need not survive.
    const scenario = { ...makeScenario(), subjectTerms: ['beanbag'] }
    getJsonModelMock.mockReturnValue(modelReturningJson(themed))
    const result = await rewriteScenario(scenario, 6)
    expect(result).not.toBe(scenario)
    expect(result.prompt).toBe(themed.prompt)
  })

  it('falls back when a rewritten STEP leaks a step answer', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...themed,
        steps: [
          themed.steps[0],
          { question: 'The count jumped by 37 today — is it still shifting?', hints: [] },
          themed.steps[2],
        ],
      }),
    )
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 6)).toBe(scenario)
  })

  it('falls back when a rewritten HINT contains banned jargon', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...themed,
        steps: [
          { question: themed.steps[0].question, hints: ['Use the derivative here.'] },
          themed.steps[1],
          themed.steps[2],
        ],
      }),
    )
    const scenario = makeScenario()
    expect(await rewriteScenario(scenario, 6)).toBe(scenario)
  })

  it('ignores a step list whose length does not match (keeps original steps)', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({ ...themed, steps: [themed.steps[0]] }),
    )
    const scenario = makeScenario()
    const original = makeScenario()
    const result = await rewriteScenario(scenario, 6)
    // Title/prompt still applied; steps untouched because the count was wrong.
    expect(result.prompt).toBe(themed.prompt)
    expect(result.steps).toEqual(original.steps)
  })

  it('appends "expression in x" to a rewritten expression step that omits it', async () => {
    const scenario: ScenarioProblem = {
      id: 'e1',
      topicId: 't',
      title: 'Base',
      prompt: 'Build a thing.',
      given: 'A(x) = 2x^2 + 5x',
      steps: [
        {
          id: 'derive',
          tier: 'scaffold',
          kind: 'expression',
          prompt: 'Build the rate formula (as an expression in x).',
          trueCoefficients: [5, 4],
          builder: true,
        },
      ],
    }
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        title: 'Themed',
        prompt: 'A themed setup.',
        steps: [{ question: 'Build the speed formula for the ladybug.', hints: [] }],
      }),
    )
    const result = await rewriteScenario(scenario, 6)
    expect(result.steps[0].prompt.toLowerCase()).toContain('expression in x')
  })
})

describe('rewriteScenario: fallback on timeout', () => {
  it('falls back when the model never resolves in time', async () => {
    vi.useFakeTimers()
    getJsonModelMock.mockReturnValue({
      generateContent: vi.fn(() => new Promise(() => {})),
    })
    const scenario = makeScenario()
    const pending = rewriteScenario(scenario, 10)
    await vi.advanceTimersByTimeAsync(9000)
    expect(await pending).toBe(scenario)
  })
})
