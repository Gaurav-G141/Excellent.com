/**
 * Entry point invoked after a correctly-solved word problem: with probability
 * `SPAWN_CHANCE`, earns a new sticker (resolve subject → generate image →
 * persist). Slots are filled lowest-first; when all slots are taken, the oldest
 * sticker is evicted and its slot reused.
 *
 * Spawns are serialized through a per-tab queue so overlapping correct answers
 * can't read the same slot and collide (duplicate slotIndex / exceeding the
 * slot cap). This never throws — a failed sticker spawn must never disrupt
 * solving a problem.
 */

import type { WordProblem } from '../../utils/applications/types'
import { LIFETIME_MS, SPAWN_CHANCE, STICKER_SLOT_COUNT } from './config'
import { resolveSubject } from './catalog'
import { generateStickerImage } from './generate'
import {
  addSticker,
  deleteSticker,
  getActiveStickers,
  removeRandomSticker,
} from './store'
import type { StickerItem } from './types'

/** Serializes spawns/removals within a tab so slot assignment is race-free. */
let spawnQueue: Promise<void> = Promise.resolve()

/**
 * Maybe earn a sticker for `uid` after solving `problem`. `interests` (the
 * learner's saved interests) lets the sticker match an interest-themed scene.
 * Never throws.
 */
export function maybeSpawnSticker(
  problem: WordProblem,
  uid: string,
  interests?: string[],
): Promise<void> {
  const run = spawnQueue.then(() => spawnOne(problem, uid, interests))
  // Keep the queue alive regardless of this run's outcome (spawnOne never
  // rejects, but guard defensively so one failure can't wedge the chain).
  spawnQueue = run.catch(() => {})
  return run
}

/**
 * Remove up to `count` random stickers for `uid` — a penalty for repeated wrong
 * answers. Serialized through the same queue as spawns so slot reads/writes never
 * interleave. Stops early once the learner has none left. Never throws.
 *
 * (Possibly temporary — see WRONG_ANSWERS_PER_STICKER_LOSS and its caller.)
 */
export function loseStickers(uid: string, count: number): Promise<void> {
  if (count <= 0) return Promise.resolve()
  const run = spawnQueue.then(() => removeMany(uid, count))
  spawnQueue = run.catch(() => {})
  return run
}

async function removeMany(uid: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    try {
      const removed = await removeRandomSticker(uid)
      if (!removed) break // nothing left to take away
    } catch (error) {
      console.warn('[stickers] failed to remove a sticker after wrong answers.', error)
      break
    }
  }
}

async function spawnOne(
  problem: WordProblem,
  uid: string,
  interests?: string[],
): Promise<void> {
  if (Math.random() >= SPAWN_CHANCE) return

  const subject = resolveSubject(problem, interests)
  const id = crypto.randomUUID()

  // Generate first: this is the slow, failure-prone step (network upload). Only
  // after it succeeds do we touch the slot set, keeping the evict→add window
  // tiny and avoiding evicting a sticker for one that never materializes.
  let generated: { src: string; provider: StickerItem['provider'] }
  try {
    generated = await generateStickerImage(subject, uid, id)
  } catch (error) {
    console.warn('[stickers] image generation failed; no sticker spawned.', error)
    return
  }

  try {
    const actives = await getActiveStickers(uid)

    let slotIndex: number
    if (actives.length >= STICKER_SLOT_COUNT) {
      const oldest = actives.reduce((min, item) =>
        item.createdAt < min.createdAt ? item : min,
      )
      await deleteSticker(uid, oldest)
      slotIndex = oldest.slotIndex
    } else {
      const used = new Set(actives.map((item) => item.slotIndex))
      slotIndex = 0
      while (slotIndex < STICKER_SLOT_COUNT && used.has(slotIndex)) slotIndex++
    }

    const now = Date.now()
    const item: StickerItem = {
      id,
      subject,
      src: generated.src,
      provider: generated.provider,
      slotIndex,
      createdAt: now,
      expiresAt: now + LIFETIME_MS,
    }
    await addSticker(uid, item)
  } catch (error) {
    console.warn('[stickers] persisting sticker failed; cleaning up.', error)
    // The Firestore write failed after we may have uploaded an image; remove the
    // orphaned Storage object so nothing lingers.
    await deleteSticker(uid, { id, provider: generated.provider }).catch(() => {})
  }
}
