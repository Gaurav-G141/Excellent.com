/**
 * Firestore persistence for earned stickers, stored per user at
 * `stickers/{uid}/items/{itemId}`. Sticker images are keyless Pollinations URLs,
 * so there is no Storage object to clean up on delete.
 *
 * Every function degrades gracefully: if Firebase isn't configured (`db`
 * undefined), reads return empty, writes no-op, and subscriptions emit once.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { StickerItem } from './types'

/** Coerce a raw Firestore document into a StickerItem, or null if malformed. */
function toStickerItem(id: string, data: DocumentData): StickerItem | null {
  const { subject, src, provider, slotIndex, createdAt, expiresAt } = data
  if (
    typeof subject !== 'string' ||
    typeof src !== 'string' ||
    (provider !== 'openai' && provider !== 'pollinations') ||
    typeof slotIndex !== 'number' ||
    typeof createdAt !== 'number' ||
    typeof expiresAt !== 'number'
  ) {
    return null
  }
  return { id, subject, src, provider, slotIndex, createdAt, expiresAt }
}

/**
 * Split into still-active (sorted by slot) and expired stickers, and fire a
 * best-effort purge of the expired ones so the collection doesn't grow without
 * bound. Purging is fire-and-forget: failures are ignored and never block the
 * caller.
 */
function activeSorted(uid: string, items: StickerItem[]): StickerItem[] {
  const now = Date.now()
  const active: StickerItem[] = []
  const expired: StickerItem[] = []
  for (const item of items) {
    ;(item.expiresAt > now ? active : expired).push(item)
  }
  if (expired.length > 0) {
    void Promise.allSettled(expired.map((item) => deleteSticker(uid, item)))
  }
  return active.sort((a, b) => a.slotIndex - b.slotIndex)
}

/** Persist a sticker for `uid`. */
export async function addSticker(uid: string, item: StickerItem): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'stickers', uid, 'items', item.id), {
    subject: item.subject,
    src: item.src,
    provider: item.provider,
    slotIndex: item.slotIndex,
    createdAt: item.createdAt,
    expiresAt: item.expiresAt,
  })
}

/** Fetch the current non-expired stickers for `uid`, sorted by slot index. */
export async function getActiveStickers(uid: string): Promise<StickerItem[]> {
  if (!db) return []
  const snapshot = await getDocs(collection(db, 'stickers', uid, 'items'))
  const items: StickerItem[] = []
  snapshot.forEach((docSnap) => {
    const item = toStickerItem(docSnap.id, docSnap.data())
    if (item) items.push(item)
  })
  return activeSorted(uid, items)
}

/**
 * Subscribe to the live set of non-expired stickers for `uid`. Returns an
 * unsubscribe function. If Firebase isn't configured, emits `[]` once and
 * returns a no-op unsubscribe.
 */
export function subscribeActiveStickers(
  uid: string,
  cb: (items: StickerItem[]) => void,
): () => void {
  if (!db) {
    cb([])
    return () => {}
  }
  return onSnapshot(
    collection(db, 'stickers', uid, 'items'),
    (snapshot) => {
      const items: StickerItem[] = []
      snapshot.forEach((docSnap) => {
        const item = toStickerItem(docSnap.id, docSnap.data())
        if (item) items.push(item)
      })
      cb(activeSorted(uid, items))
    },
    (error) => {
      // Permission denied (rules not deployed yet), offline, etc. Degrade to an
      // empty layer instead of failing silently with no signal.
      console.warn('[stickers] sticker subscription error.', error)
      cb([])
    },
  )
}

/**
 * Delete a sticker for `uid`. Images are external Pollinations URLs, so this
 * only removes the Firestore document.
 */
export async function deleteSticker(
  uid: string,
  item: Pick<StickerItem, 'id' | 'provider'>,
): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'stickers', uid, 'items', item.id))
}

/**
 * Delete one randomly-chosen active sticker for `uid`. Returns true if one was
 * removed, false if there were none (or Firebase isn't configured).
 */
export async function removeRandomSticker(uid: string): Promise<boolean> {
  if (!db) return false
  const actives = await getActiveStickers(uid)
  if (actives.length === 0) return false
  const victim = actives[Math.floor(Math.random() * actives.length)]
  await deleteSticker(uid, victim)
  return true
}
