/**
 * Soft pastel "sticky note" colors used as the backing for each sticker.
 *
 * The color is derived deterministically from the sticker id so two places agree
 * without any extra persisted field:
 *   - StickerLayer paints the note in `bg`, and
 *   - the image prompt tells the model to AVOID `avoid` so the drawing contrasts
 *     pleasantly with its note (basic complementary color theory).
 */

export interface NoteColor {
  /** Human color name fed into the image prompt to steer/avoid. */
  name: string
  /** Color name(s) the drawing should avoid (so it pops against the note). */
  avoid: string
  /** Suggested drawing palette that contrasts with the note. */
  prefer: string
  /** Pastel background for the note surface. */
  bg: string
  /** Slightly deeper shade for the note's folded corner / edge. */
  edge: string
}

export const NOTE_COLORS: readonly NoteColor[] = [
  {
    name: 'pastel yellow',
    avoid: 'yellow',
    prefer: 'blue, purple, and green',
    bg: '#fff3b0',
    edge: '#f4e08a',
  },
  {
    name: 'pastel blue',
    avoid: 'blue',
    prefer: 'orange, red, and warm brown',
    bg: '#cfe8ff',
    edge: '#aed6f7',
  },
  {
    name: 'pastel pink',
    avoid: 'pink and magenta',
    prefer: 'green, teal, and blue',
    bg: '#ffd6e6',
    edge: '#f7bcd3',
  },
  {
    name: 'pastel green',
    avoid: 'green',
    prefer: 'red, pink, and purple',
    bg: '#cdf2d6',
    edge: '#aee3bb',
  },
  {
    name: 'pastel peach',
    avoid: 'orange and peach',
    prefer: 'blue, teal, and purple',
    bg: '#ffe0c4',
    edge: '#f7caa3',
  },
  {
    name: 'pastel lavender',
    avoid: 'purple and violet',
    prefer: 'yellow, green, and orange',
    bg: '#e6d8ff',
    edge: '#d2bdf7',
  },
]

/** Stable, well-distributed hash of a string id. */
function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0 // force 32-bit
  }
  return Math.abs(hash)
}

/** Pick a deterministic pastel note color for a sticker id. */
export function noteColorFor(id: string): NoteColor {
  return NOTE_COLORS[hashId(id) % NOTE_COLORS.length]
}
