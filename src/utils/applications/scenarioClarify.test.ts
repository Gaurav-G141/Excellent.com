import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// getJsonModel is the AI seam: clarifyQuestion returns null (keep original) when
// it returns null, otherwise drives model.generateContent. Keep the real Schema.
const { getJsonModelMock } = vi.hoisted(() => ({ getJsonModelMock: vi.fn() }))

vi.mock('../../lib/ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/ai')>()
  return { ...actual, getJsonModel: getJsonModelMock }
})

import { clarifyQuestion, validateClarify } from './scenarioClarify'

function modelReturningText(text: string) {
  return { generateContent: vi.fn(async () => ({ response: { text: () => text } })) }
}

function modelReturningJson(obj: unknown) {
  return modelReturningText(JSON.stringify(obj))
}

const BASE_ARGS = {
  question: 'What has to be true for the colony to hold steady?',
  scenarioTitle: 'Meadow',
  scenarioPrompt: 'A colony grows over time.',
  forbiddenNumbers: [37, 6],
}

beforeEach(() => {
  getJsonModelMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('validateClarify', () => {
  it('accepts a clean reword', () => {
    expect(
      validateClarify({ question: 'In plain terms, what keeps the colony from changing?' }, BASE_ARGS),
    ).toBe('In plain terms, what keeps the colony from changing?')
  })

  it('rejects non-object / missing field', () => {
    expect(validateClarify(null, BASE_ARGS)).toBeNull()
    expect(validateClarify({}, BASE_ARGS)).toBeNull()
    expect(validateClarify({ question: 42 }, BASE_ARGS)).toBeNull()
  })

  it('rejects banned jargon', () => {
    expect(
      validateClarify({ question: 'What is the rate of change of the colony?' }, BASE_ARGS),
    ).toBeNull()
  })

  it('rejects a reword that leaks an answer number absent from the original', () => {
    expect(validateClarify({ question: 'Is the steady count 37 here?' }, BASE_ARGS)).toBeNull()
  })

  it('rejects a story-band reword that reintroduces an operation giveaway', () => {
    const args = { ...BASE_ARGS, level: 14 }
    expect(validateClarify({ question: 'How fast does the colony change?' }, args)).toBeNull()
  })

  it('allows a giveaway phrase below the story band', () => {
    const args = { ...BASE_ARGS, level: 8 }
    expect(validateClarify({ question: 'How fast does the colony change?' }, args)).toBe(
      'How fast does the colony change?',
    )
  })

  it('allows a story-band giveaway when the original already used it', () => {
    const args = { ...BASE_ARGS, question: 'How fast does it move?', level: 14 }
    expect(validateClarify({ question: 'How fast is it moving along?' }, args)).toBe(
      'How fast is it moving along?',
    )
  })

  it('allows a number that was already in the original question', () => {
    const args = { ...BASE_ARGS, question: 'On day 6, what keeps it steady?', forbiddenNumbers: [6] }
    // 6 already appears in the original, so it is whitelisted, not a leak.
    expect(validateClarify({ question: 'On day 6, what would hold the colony steady?' }, args)).toBe(
      'On day 6, what would hold the colony steady?',
    )
  })
})

describe('clarifyQuestion', () => {
  it('returns null when AI is unavailable', async () => {
    getJsonModelMock.mockReturnValue(null)
    expect(await clarifyQuestion(BASE_ARGS)).toBeNull()
  })

  it('returns the reworded question on a valid response', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({ question: 'What would keep the colony from growing or shrinking?' }),
    )
    expect(await clarifyQuestion(BASE_ARGS)).toBe(
      'What would keep the colony from growing or shrinking?',
    )
  })

  it('returns null on non-JSON output', async () => {
    getJsonModelMock.mockReturnValue(modelReturningText('not json {'))
    expect(await clarifyQuestion(BASE_ARGS)).toBeNull()
  })

  it('returns null on unsafe (answer-leaking) output', async () => {
    getJsonModelMock.mockReturnValue(modelReturningJson({ question: 'Is it exactly 37?' }))
    expect(await clarifyQuestion(BASE_ARGS)).toBeNull()
  })

  it('never throws when generateContent throws', async () => {
    getJsonModelMock.mockReturnValue({
      generateContent: vi.fn(async () => {
        throw new Error('network down')
      }),
    })
    expect(await clarifyQuestion(BASE_ARGS)).toBeNull()
  })

  it('falls back to null on timeout', async () => {
    vi.useFakeTimers()
    getJsonModelMock.mockReturnValue({ generateContent: vi.fn(() => new Promise(() => {})) })
    const pending = clarifyQuestion(BASE_ARGS)
    await vi.advanceTimersByTimeAsync(8000)
    expect(await pending).toBeNull()
  })
})
