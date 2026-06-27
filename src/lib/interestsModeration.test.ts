import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the AI layer so the orchestration is tested deterministically. Schema is
// referenced at module load (MODERATION_SCHEMA), so it must be present.
const getJsonModel = vi.fn()
vi.mock('./ai', () => ({
  aiConfigured: true,
  getJsonModel: (...args: unknown[]) => getJsonModel(...args),
  Schema: {
    object: () => ({}),
    string: () => ({}),
    boolean: () => ({}),
    array: () => ({}),
  },
}))

import {
  BLOCKED_MESSAGE,
  ERROR_MESSAGE,
  LOCAL_BLOCKLIST,
  matchesLocalBlocklist,
  moderateInterest,
} from './interestsModeration'

/** A fake model whose single response is `content`. */
function modelReturning(content: string) {
  return { generateContent: vi.fn().mockResolvedValue({ response: { text: () => content } }) }
}

afterEach(() => {
  vi.clearAllMocks()
})

// ── Local blocklist (pure, offline) ─────────────────────────────────────────

describe('matchesLocalBlocklist: blocks blatant terms', () => {
  const blatant = [
    'cocaine',
    'I sell cocaine',
    'heroin',
    'crystal meth',
    'meth',
    'fentanyl',
    'porn',
    'watching pornography',
    'how to make a bomb',
    'school shooting',
    'getting high',
  ]
  for (const term of blatant) {
    it(`blocks "${term}"`, () => {
      expect(matchesLocalBlocklist(term)).toBe(true)
    })
  }

  it('is case-insensitive', () => {
    expect(matchesLocalBlocklist('COCAINE')).toBe(true)
    expect(matchesLocalBlocklist('Crystal Meth')).toBe(true)
  })
})

describe('matchesLocalBlocklist: no false positives (Scunthorpe-safe)', () => {
  const benign = [
    'basketball',
    'baking',
    'space exploration',
    'anime',
    'methodology', // contains "meth"
    'mathematics',
    'cocktail recipes', // not "cocaine"
    'classical music',
    "assassin's creed", // a game; substring "ass"
    'grasshoppers',
    'photography', // substring "porn"-ish? no
    'basketball shooting practice', // "shooting" but not "school/mass shooting"
    'shooting hoops',
    'therapy dogs',
    'analysis of poems',
    'scunthorpe united',
    'boxing',
    'true crime podcasts',
    'call of duty',
    'world war 2 history',
    'hunting and fishing',
  ]
  for (const term of benign) {
    it(`allows "${term}"`, () => {
      expect(matchesLocalBlocklist(term)).toBe(false)
    })
  }

  it('ignores empty / whitespace', () => {
    expect(matchesLocalBlocklist('')).toBe(false)
    expect(matchesLocalBlocklist('   ')).toBe(false)
  })

  it('keeps the blocklist small and unambiguous', () => {
    // Guard against future additions sneaking in ambiguous, false-positive-prone
    // words; nuanced cases belong to the AI classifier, not this list.
    expect(LOCAL_BLOCKLIST).not.toContain('shooting')
    expect(LOCAL_BLOCKLIST).not.toContain('crime')
    expect(LOCAL_BLOCKLIST).not.toContain('war')
    expect(LOCAL_BLOCKLIST).not.toContain('gun')
    expect(LOCAL_BLOCKLIST).not.toContain('weed')
  })
})

// ── moderateInterest orchestration ───────────────────────────────────────────

describe('moderateInterest: local layer short-circuits the AI', () => {
  it('blocks a blocklisted term without calling the model', async () => {
    const result = await moderateInterest('cocaine dealing')
    expect(result).toEqual({ status: 'blocked', reason: BLOCKED_MESSAGE })
    expect(getJsonModel).not.toHaveBeenCalled()
  })

  it('treats empty input as ok', async () => {
    expect(await moderateInterest('   ')).toEqual({ status: 'ok' })
  })
})

describe('moderateInterest: AI not configured', () => {
  it('allows anything the local list did not catch', async () => {
    getJsonModel.mockReturnValue(null)
    expect(await moderateInterest('boxing')).toEqual({ status: 'ok' })
  })
})

describe('moderateInterest: AI verdicts', () => {
  it('allows when the model says appropriate', async () => {
    getJsonModel.mockReturnValue(modelReturning('{"appropriate":true,"category":"none"}'))
    expect(await moderateInterest('true crime podcasts')).toEqual({ status: 'ok' })
  })

  it('blocks when the model says inappropriate', async () => {
    getJsonModel.mockReturnValue(modelReturning('{"appropriate":false,"category":"drugs"}'))
    expect(await moderateInterest('using illegal drugs')).toEqual({
      status: 'blocked',
      reason: BLOCKED_MESSAGE,
    })
  })

  it('requests deterministic output (temperature 0)', async () => {
    getJsonModel.mockReturnValue(modelReturning('{"appropriate":true,"category":"none"}'))
    await moderateInterest('chess')
    expect(getJsonModel).toHaveBeenCalledWith(expect.anything(), { temperature: 0 })
  })
})

describe('moderateInterest: fails closed (retryable) on any AI problem', () => {
  it('errors on malformed JSON', async () => {
    getJsonModel.mockReturnValue(modelReturning('not json'))
    expect(await moderateInterest('chess')).toEqual({ status: 'error' })
  })

  it('errors on a missing/non-boolean field', async () => {
    getJsonModel.mockReturnValue(modelReturning('{"category":"none"}'))
    expect(await moderateInterest('chess')).toEqual({ status: 'error' })
  })

  it('errors on an empty response', async () => {
    getJsonModel.mockReturnValue(modelReturning('   '))
    expect(await moderateInterest('chess')).toEqual({ status: 'error' })
  })

  it('errors when the model throws', async () => {
    getJsonModel.mockReturnValue({
      generateContent: vi.fn().mockRejectedValue(new Error('network')),
    })
    expect(await moderateInterest('chess')).toEqual({ status: 'error' })
  })

  it('keeps a friendly, distinct error message', () => {
    expect(ERROR_MESSAGE).not.toEqual(BLOCKED_MESSAGE)
    expect(ERROR_MESSAGE.length).toBeGreaterThan(0)
  })
})

describe('moderateInterest: timeout', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('errors if the model never responds', async () => {
    getJsonModel.mockReturnValue({
      generateContent: vi.fn().mockReturnValue(new Promise(() => {})),
    })
    const pending = moderateInterest('chess')
    await vi.advanceTimersByTimeAsync(8000)
    expect(await pending).toEqual({ status: 'error' })
  })
})
