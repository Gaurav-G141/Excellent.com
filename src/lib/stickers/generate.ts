/**
 * Generates a sticker image for a subject and returns a renderable URL.
 *
 * Image provider: Pollinations — a keyless image URL that renders directly with
 * no extra round trip and requires no Firebase Storage. We use it exclusively
 * because Firebase Storage is unavailable on the Spark (free) plan, so there is
 * nowhere to persist an OpenAI-generated PNG.
 *
 * This never throws: callers always receive a usable `src`.
 */

import { noteColorFor } from './palette'
import { buildStickerPrompt } from './prompt'
import type { StickerProvider } from './types'

/** Build a reproducible keyless Pollinations URL for a prompt. */
function buildPollinationsUrl(prompt: string): string {
  const seed = Math.floor(Math.random() * 1_000_000_000)
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&model=flux&nologo=true`
}

/**
 * Generate a sticker image for `subject`. Returns a keyless Pollinations URL.
 *
 * The image's pastel note color is derived from `itemId` (the same derivation
 * StickerLayer uses to paint the note), so the prompt can ask the drawing to
 * contrast with — and stay transparent against — its note. `uid` is accepted for
 * call-site compatibility but unused now that images aren't persisted to Storage.
 */
export async function generateStickerImage(
  subject: string,
  _uid: string,
  itemId: string,
): Promise<{ src: string; provider: StickerProvider }> {
  const prompt = buildStickerPrompt(subject, noteColorFor(itemId))
  return { src: buildPollinationsUrl(prompt), provider: 'pollinations' }
}
