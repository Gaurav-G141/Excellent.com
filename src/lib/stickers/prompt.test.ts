import { describe, it, expect } from 'vitest'

import { buildStickerPrompt } from './prompt'
import { NOTE_COLORS } from './palette'

// buildStickerPrompt is pure: it wraps a subject in the fixed crayon style
// scaffold. We assert the subject is interpolated and that the constant
// children's-drawing scaffold + "no text/watermark" guardrails survive.
describe('buildStickerPrompt', () => {
  it('includes the subject (interpolated twice)', () => {
    const prompt = buildStickerPrompt('red rocket')
    expect(prompt).toContain('red rocket')
    // The scaffold mentions the subject in both the opening and the "one single"
    // clause, so it should appear at least twice.
    const occurrences = prompt.split('red rocket').length - 1
    expect(occurrences).toBeGreaterThanOrEqual(2)
  })

  it('contains the crayon-style scaffold text', () => {
    const prompt = buildStickerPrompt('owl')
    expect(prompt).toContain('crayon')
    expect(prompt).toContain('Thick, uneven, wobbly black outlines')
    expect(prompt).toContain('Plain simple background, no scenery')
  })

  it('forbids text, letters, numbers, signatures, and watermarks', () => {
    const prompt = buildStickerPrompt('trophy')
    expect(prompt).toContain('No text')
    expect(prompt).toContain('no letters')
    expect(prompt).toContain('no numbers')
    expect(prompt).toContain('no signature')
    expect(prompt).toContain('no watermark')
  })

  it('never returns an empty string, even for an empty subject', () => {
    expect(buildStickerPrompt('').length).toBeGreaterThan(0)
  })

  it('adds transparency/blend + color guidance when a note color is given', () => {
    const note = NOTE_COLORS[0]
    const prompt = buildStickerPrompt('owl', note)
    // Either transparent OR the matching note color as the background.
    expect(prompt).toContain('transparent')
    expect(prompt).toContain(note.name)
    expect(prompt).toContain(note.bg)
    // The drawing itself must avoid the note color and use the opposite palette.
    expect(prompt).toContain(`Do NOT make the owl or its main colors ${note.avoid}`)
    expect(prompt).toContain(note.prefer)
    // The crayon scaffold still survives alongside the new guidance.
    expect(prompt).toContain('crayon')
  })

  it('omits the note guidance when no color is given', () => {
    const prompt = buildStickerPrompt('owl')
    expect(prompt).not.toContain('transparent')
    expect(prompt).not.toContain('The image is placed on a')
  })
})
