import { describe, expect, it } from 'vitest'
import { MAX_INTERESTS, sanitizeInterests } from './interests'

describe('sanitizeInterests', () => {
  it('trims, collapses whitespace, and drops empties', () => {
    expect(sanitizeInterests(['  space  exploration ', '', '   '])).toEqual([
      'space exploration',
    ])
  })

  it('de-duplicates case-insensitively, keeping first form', () => {
    expect(sanitizeInterests(['Basketball', 'basketball', 'BASKETBALL'])).toEqual([
      'Basketball',
    ])
  })

  it('drops non-strings and non-array input', () => {
    expect(sanitizeInterests(['ok', 5, null, {}, undefined])).toEqual(['ok'])
    expect(sanitizeInterests('not an array')).toEqual([])
    expect(sanitizeInterests(null)).toEqual([])
  })

  it('caps the list length', () => {
    const many = Array.from({ length: MAX_INTERESTS + 5 }, (_, i) => `interest ${i}`)
    expect(sanitizeInterests(many)).toHaveLength(MAX_INTERESTS)
  })

  it('clips each interest to the max length', () => {
    const long = 'x'.repeat(200)
    const [only] = sanitizeInterests([long])
    expect(only.length).toBeLessThanOrEqual(60)
  })
})
