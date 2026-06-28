import { describe, it, expect, beforeEach, vi } from 'vitest'

// getJsonModel is the AI seam: gradeFreeResponse returns null when it returns
// null, otherwise drives model.generateContent. Keep the real Schema.
const { getJsonModelMock } = vi.hoisted(() => ({ getJsonModelMock: vi.fn() }))

vi.mock('./ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./ai')>()
  return { ...actual, getJsonModel: getJsonModelMock }
})

import { gradeFreeResponse } from './aiGrade'

function modelCapturingPrompt() {
  const generateContent = vi.fn(async () => ({
    response: { text: () => JSON.stringify({ verdict: 'correct', feedback: 'Nice.' }) },
  }))
  return { model: { generateContent }, generateContent }
}

const ARGS = {
  question: 'At the very top of its flight, what is true about the height?',
  rubric: 'its rate of change with respect to time is zero',
  answer: 'the height is not changing',
}

beforeEach(() => {
  getJsonModelMock.mockReset()
})

describe('gradeFreeResponse rigor', () => {
  it('returns null when the model is unavailable', async () => {
    getJsonModelMock.mockReturnValue(null)
    expect(await gradeFreeResponse(ARGS)).toBeNull()
  })

  it('omits strictness wording by default (lessons unaffected)', async () => {
    const { model, generateContent } = modelCapturingPrompt()
    getJsonModelMock.mockReturnValue(model)
    await gradeFreeResponse(ARGS)
    const prompt = generateContent.mock.calls[0][0] as string
    expect(prompt).toContain('Informal phrasing is fine.')
    expect(prompt).not.toMatch(/advanced|beginner/i)
  })

  it('adds beginner leniency at lenient rigor', async () => {
    const { model, generateContent } = modelCapturingPrompt()
    getJsonModelMock.mockReturnValue(model)
    await gradeFreeResponse({ ...ARGS, rigor: 'lenient' })
    const prompt = generateContent.mock.calls[0][0] as string
    expect(prompt).toMatch(/beginner/i)
  })

  it('demands a rate-of-change articulation at strict rigor', async () => {
    const { model, generateContent } = modelCapturingPrompt()
    getJsonModelMock.mockReturnValue(model)
    await gradeFreeResponse({ ...ARGS, rigor: 'strict' })
    const prompt = generateContent.mock.calls[0][0] as string
    expect(prompt).toMatch(/advanced/i)
    expect(prompt).toMatch(/rate of change/i)
    expect(prompt).not.toContain('Informal phrasing is fine.')
  })
})
