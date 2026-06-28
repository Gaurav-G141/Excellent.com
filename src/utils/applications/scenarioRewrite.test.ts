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
