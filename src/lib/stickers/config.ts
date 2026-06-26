/**
 * Tunables for the "motivation stickers" feature — a single source of truth so
 * the spawn odds, lifetime, layout, and image model can be adjusted in one place.
 */

// TESTING: 1 = always spawn after a correct answer. Set to 0.15 for production.
export const SPAWN_CHANCE = 1

/** How long an earned sticker stays visible before it expires, in ms (2 days). */
export const LIFETIME_MS = 2 * 24 * 60 * 60 * 1000

/**
 * Wrong answers in the Applications tab that cost the learner one random sticker.
 * The tally is cumulative across problems. (Possibly temporary — see trigger.ts.)
 */
export const WRONG_ANSWERS_PER_STICKER_LOSS = 3

/** Number of margin slots a sticker can occupy at once. */
export const STICKER_SLOT_COUNT = 8

/** Rendered edge length of a sticker, in CSS pixels. */
export const STICKER_SIZE_PX = 100
