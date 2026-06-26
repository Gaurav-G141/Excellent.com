/**
 * Shared types for the motivation stickers feature.
 */

/** Which backend produced the image. OpenAI is preferred; Pollinations is the fallback. */
export type StickerProvider = 'openai' | 'pollinations'

/** A single earned sticker, persisted in Firestore and rendered in the margins. */
export interface StickerItem {
  id: string
  subject: string
  /** Final renderable image URL (Storage download URL or Pollinations URL). */
  src: string
  provider: StickerProvider
  /** Margin slot this sticker occupies, in [0, STICKER_SLOT_COUNT). */
  slotIndex: number
  /** When it was earned, in epoch ms. */
  createdAt: number
  /** When it should disappear, in epoch ms. */
  expiresAt: number
}
