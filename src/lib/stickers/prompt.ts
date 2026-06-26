/**
 * Builds the image-generation prompt for a sticker. The crayon "style scaffold"
 * is constant so every sticker shares one cohesive children's-drawing look; only
 * the subject (and the note-color guidance) changes.
 */

import type { NoteColor } from './palette'

/**
 * Wrap a drawable subject in the fixed crayon-drawing style scaffold.
 *
 * When a `note` color is supplied, the prompt tells the model the image sits on a
 * colored note and gives it two acceptable backgrounds — fully transparent, or
 * the SAME note color so it blends seamlessly (flux often ignores transparency,
 * so the matching-color fallback prevents an ugly white box on the note). It also
 * forbids the drawing itself from being the note color, steering to the opposite
 * (complementary) palette so the subject stays legible.
 */
export function buildStickerPrompt(subject: string, note?: NoteColor): string {
  const base = `A child's hand-drawn crayon picture of ${subject}. Drawn by a 6-8 year old with crayons and colored pencils. Thick, uneven, wobbly black outlines. Asymmetric imperfect shapes, visible crayon strokes, coloring slightly outside the lines. Warm soft pastel colors. One single ${subject}, centered, filling most of the frame, isolated as a sticker cutout. Cheerful, innocent, flat naive front-on perspective. Plain simple background, no scenery. No text, no letters, no numbers, no signature, no watermark, no border.`

  if (!note) return base

  return `${base} The image is placed on a ${note.name} (${note.bg}) background. Either make the background fully transparent (transparent PNG with alpha channel) or fill it with that exact ${note.name} so it blends into the note. Do NOT make the ${subject} or its main colors ${note.avoid}. Instead the main drawing must use colors opposed to ${note.avoid} (complementary): ${note.prefer}.`
}
