import { describe, it, expect } from 'vitest'

import { NOTE_COLORS, noteColorFor } from './palette'

describe('noteColorFor', () => {
  it('is deterministic for a given id', () => {
    const a = noteColorFor('abc-123')
    const b = noteColorFor('abc-123')
    expect(a).toBe(b)
  })

  it('always returns a color from the palette', () => {
    for (const id of ['', 'x', 'a-very-long-uuid-like-string-0000', '🎉']) {
      expect(NOTE_COLORS).toContain(noteColorFor(id))
    }
  })

  it('distributes across the palette for varied ids', () => {
    const seen = new Set(
      Array.from({ length: 200 }, (_, i) => noteColorFor(`id-${i}`).name),
    )
    // Not a strict guarantee, but a healthy hash should hit most buckets.
    expect(seen.size).toBeGreaterThanOrEqual(NOTE_COLORS.length - 1)
  })
})
