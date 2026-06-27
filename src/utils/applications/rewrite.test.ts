import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import type { WordProblem } from './types'

// Mock the AI layer. getJsonModel is the seam: rewriteProblem falls back to the
// base problem whenever it returns null, and otherwise drives model.generateContent.
// We keep the real Schema export (levelPrompts builds REWRITE_SCHEMA at load).
const { getJsonModelMock } = vi.hoisted(() => ({ getJsonModelMock: vi.fn() }))

vi.mock('../../lib/ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/ai')>()
  return { ...actual, getJsonModel: getJsonModelMock }
})

// Imported after the mock is registered (vi.mock is hoisted regardless).
import { rewriteProblem } from './rewrite'

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeProblem(): WordProblem {
  return {
    id: 'p1',
    topicId: 't1',
    title: 'Base Title',
    prompt: 'A car travels along a known path.',
    given: 'f(t) = 2t^2 + 5t',
    hint: 'Think about how the quantity changes.',
    fields: [
      {
        kind: 'number',
        label: 'Average speed (mph)',
        expected: 42,
        tolerance: 0.1,
        placeholder: '?',
        meaning: 'the average speed in mph',
      },
      {
        kind: 'expression',
        label: 'Growth in terms of x',
        trueCoefficients: [5, 8, 3],
        sampleXs: [1, 2, 3],
        meaning: 'the growth formula',
      },
      {
        kind: 'choice',
        label: 'Which total is right',
        options: [10, 20, 30],
        correct: 20,
        meaning: 'the correct total',
      },
    ],
  }
}

const VALID_OUTPUT = {
  title: 'Weekend Road Trip',
  prompt: 'A family sets out for an afternoon along a winding country road.',
  fieldLabels: [
    'Distance covered each hour',
    'Overall pattern as an expression in x',
    'Which grand total fits',
  ],
}

/** A fake model whose generateContent resolves with the given text. */
function modelReturningText(text: string) {
  return {
    generateContent: vi.fn(async () => ({ response: { text: () => text } })),
  }
}

/** A fake model whose generateContent resolves with JSON-stringified `obj`. */
function modelReturningJson(obj: unknown) {
  return modelReturningText(JSON.stringify(obj))
}

beforeEach(() => {
  getJsonModelMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

// ── Fallback: no model ───────────────────────────────────────────────────────

describe('rewrite: fallback when AI is unavailable', () => {
  it('returns the SAME problem object when getJsonModel returns null', async () => {
    getJsonModelMock.mockReturnValue(null)
    const problem = makeProblem()
    const result = await rewriteProblem(problem, 7)
    expect(result).toBe(problem)
  })
})

// ── Happy path: valid rewrite ────────────────────────────────────────────────

describe('rewrite: successful rewrite preserves all math', () => {
  it('returns a CLONE with new title/prompt/labels but identical answers', async () => {
    getJsonModelMock.mockReturnValue(modelReturningJson(VALID_OUTPUT))
    const problem = makeProblem()
    const original = makeProblem() // pristine reference for comparison

    const result = await rewriteProblem(problem, 9)

    // A new object graph (clone), not the same reference.
    expect(result).not.toBe(problem)
    expect(result.fields).not.toBe(problem.fields)

    // Text was rewritten.
    expect(result.title).toBe(VALID_OUTPUT.title)
    expect(result.prompt).toBe(VALID_OUTPUT.prompt)
    expect(result.fields.map((f) => f.label)).toEqual(VALID_OUTPUT.fieldLabels)

    // Identity fields and the GIVEN formula are untouched.
    expect(result.id).toBe(original.id)
    expect(result.topicId).toBe(original.topicId)
    expect(result.given).toBe(original.given)
    expect(result.hint).toBe(original.hint)
  })

  it('KEY GUARANTEE: every field answer payload is byte-for-byte identical', async () => {
    getJsonModelMock.mockReturnValue(modelReturningJson(VALID_OUTPUT))
    const problem = makeProblem()
    const original = makeProblem()

    const result = await rewriteProblem(problem, 12)

    result.fields.forEach((field, i) => {
      const orig = original.fields[i]
      // The label is the only thing allowed to change...
      expect(field.label).not.toBe(orig.label)
      // ...everything else (kind + the answer payload + meaning) is identical.
      expect({ ...field, label: orig.label }).toEqual(orig)
    })

    // Spell out the answer payloads explicitly for each field kind.
    const [num, expr, choice] = result.fields
    expect(num).toMatchObject({ kind: 'number', expected: 42, tolerance: 0.1 })
    expect(expr).toMatchObject({ kind: 'expression', trueCoefficients: [5, 8, 3] })
    expect(choice).toMatchObject({ kind: 'choice', options: [10, 20, 30], correct: 20 })
  })

  it('does not mutate the original problem object', async () => {
    getJsonModelMock.mockReturnValue(modelReturningJson(VALID_OUTPUT))
    const problem = makeProblem()
    const snapshot = JSON.parse(JSON.stringify(problem))
    await rewriteProblem(problem, 5)
    expect(JSON.parse(JSON.stringify(problem))).toEqual(snapshot)
  })

  it('preserves the answer coefficients even if the model returns a clone of the fields', async () => {
    // Sanity: serialized answers match before vs after.
    getJsonModelMock.mockReturnValue(modelReturningJson(VALID_OUTPUT))
    const problem = makeProblem()
    const before = problem.fields.map((f) => JSON.stringify({ ...f, label: undefined }))
    const result = await rewriteProblem(problem, 3)
    const after = result.fields.map((f) => JSON.stringify({ ...f, label: undefined }))
    expect(after).toEqual(before)
  })
})

// ── Fallback: bad / unsafe model output ──────────────────────────────────────

describe('rewrite: fallback on bad model output', () => {
  it('falls back to the original when the model returns non-JSON text', async () => {
    getJsonModelMock.mockReturnValue(modelReturningText('this is not json {'))
    const problem = makeProblem()
    const result = await rewriteProblem(problem, 8)
    expect(result).toBe(problem)
  })

  it('falls back when the model returns empty text', async () => {
    getJsonModelMock.mockReturnValue(modelReturningText('   '))
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 8)).toBe(problem)
  })

  it('falls back when text() is not a string', async () => {
    getJsonModelMock.mockReturnValue({
      generateContent: vi.fn(async () => ({ response: { text: () => 123 } })),
    })
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 8)).toBe(problem)
  })

  it('falls back when output contains banned jargon', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        title: 'Find the derivative of the trip',
      }),
    )
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 8)).toBe(problem)
  })

  it('falls back when the rewrite leaks a concrete answer value not present in the base', async () => {
    // The number answer is 42; "Base Title"/prompt/given contain only 2 and 5,
    // so a leaked 42 in the prose must be rejected and fall back to base.
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        prompt: 'After the drive, the trip total came out to exactly 42 in the end.',
      }),
    )
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 8)).toBe(problem)
  })

  it('does NOT fall back when the rewrite reuses a number already in the base problem', async () => {
    // 5 appears in the GIVEN ("5t"), so reusing it as flavor is whitelisted and
    // the rewrite is accepted (none of the answers 42/20 are leaked).
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        prompt: 'The family had been driving for 5 days before the trip.',
      }),
    )
    const problem = makeProblem()
    const result = await rewriteProblem(problem, 8)
    expect(result).not.toBe(problem)
    expect(result.prompt).toBe('The family had been driving for 5 days before the trip.')
  })

  it('falls back when fieldLabels length does not match the fields', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({ ...VALID_OUTPUT, fieldLabels: ['only one'] }),
    )
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 8)).toBe(problem)
  })

  it('falls back when a field label is over-long', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        fieldLabels: ['a'.repeat(200), 'b', 'c'],
      }),
    )
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 8)).toBe(problem)
  })

  it('falls back when generateContent throws (never propagates)', async () => {
    getJsonModelMock.mockReturnValue({
      generateContent: vi.fn(async () => {
        throw new Error('network down')
      }),
    })
    const problem = makeProblem()
    let result: WordProblem | undefined
    await expect(
      (async () => {
        result = await rewriteProblem(problem, 8)
      })(),
    ).resolves.toBeUndefined()
    expect(result).toBe(problem)
  })
})

// ── Fallback: timeout ────────────────────────────────────────────────────────

describe('rewrite: fallback on timeout', () => {
  it('falls back to the original when the model never resolves in time', async () => {
    vi.useFakeTimers()
    getJsonModelMock.mockReturnValue({
      generateContent: vi.fn(() => new Promise(() => {})), // never resolves
    })
    const problem = makeProblem()

    const pending = rewriteProblem(problem, 10)
    await vi.advanceTimersByTimeAsync(9000)
    const result = await pending

    expect(result).toBe(problem)
  })
})

// ── Fallback: answer leakage (allowedNumbers derived from the base) ──────────

describe('rewrite: fallback when the model leaks an answer number', () => {
  // The base problem's text/given carry the numbers {2, 5}; its concrete answers
  // are 42 (number) and 20 (choice), neither of which appears in the base. So a
  // rewrite that surfaces 42 or 20 is leaking an answer and must be rejected.
  it('falls back when the rewritten prompt leaks an answer absent from the base', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        prompt: 'A family travels for 42 minutes along a winding country road.',
      }),
    )
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 9)).toBe(problem)
  })

  it('falls back when the leaked answer appears in a field label', async () => {
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        fieldLabels: [
          'Distance covered each hour',
          'Overall pattern as an expression in x',
          'Pick the right one of 20',
        ],
      }),
    )
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 9)).toBe(problem)
  })

  it('falls back when the rewrite mentions a NON-correct choice option absent from the base', async () => {
    // The choice field is options [10, 20, 30] with correct 20. The base text
    // (title/prompt/given) carries only {2, 5}, so 30 — a selectable but
    // non-correct option — is now part of the collision set. A rewrite that
    // surfaces it must fall back even though 30 is not the correct answer.
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        prompt: 'They spotted 30 something interesting birds along the country road.',
      }),
    )
    const problem = makeProblem()
    expect(await rewriteProblem(problem, 11)).toBe(problem)
  })

  it('still succeeds when a non-correct choice option is whitelisted by the base prose', async () => {
    // Same option value (30), but here it already appears in the base prompt, so
    // it is whitelisted via allowedNumbers and reusing it as flavor is accepted.
    const problem = makeProblem()
    problem.prompt = 'A car travels along a road past 30 markers.'
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        prompt: 'The drive passes 30 little markers along the way.',
      }),
    )
    const result = await rewriteProblem(problem, 11)
    expect(result).not.toBe(problem)
    expect(result.prompt).toBe('The drive passes 30 little markers along the way.')
    // The choice answer payload is still untouched.
    expect(result.fields[2]).toMatchObject({ kind: 'choice', options: [10, 20, 30], correct: 20 })
  })

  it('still succeeds when the rewrite reuses a base number that is not an answer', async () => {
    // 5 appears in the GIVEN ("5t") so it is whitelisted; it is not an answer, so
    // a rewrite mentioning 5 should be accepted, not treated as leakage.
    getJsonModelMock.mockReturnValue(
      modelReturningJson({
        ...VALID_OUTPUT,
        prompt: 'A family heads out for about 5 hours along a country road.',
      }),
    )
    const problem = makeProblem()
    const result = await rewriteProblem(problem, 9)
    expect(result).not.toBe(problem)
    expect(result.prompt).toBe('A family heads out for about 5 hours along a country road.')
    // Answers are still preserved verbatim.
    expect(result.fields.map((f) => (f as { expected?: number }).expected)[0]).toBe(42)
  })
})

// ── Robustness: never throws across the matrix ───────────────────────────────

describe('rewrite: never throws', () => {
  it('resolves for every degenerate model shape', async () => {
    const cases = [
      null,
      modelReturningText(''),
      modelReturningText('garbage'),
      modelReturningJson({ title: 'X' }), // missing fieldLabels
      modelReturningJson({ ...VALID_OUTPUT, prompt: '' }),
    ]
    for (const c of cases) {
      getJsonModelMock.mockReturnValue(c as never)
      const problem = makeProblem()
      await expect(rewriteProblem(problem, 6)).resolves.toBeDefined()
    }
  })
})
