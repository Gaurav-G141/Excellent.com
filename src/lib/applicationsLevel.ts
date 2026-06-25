/**
 * Firestore load/save for the learner's Applications-tab difficulty rating.
 *
 * The rating lives on the existing `users/{uid}` document (a single global
 * level per learner). Mirrors the sanitize-before-write pattern in
 * src/lib/progress.ts; bounds match src/lib/firestoreValidation.ts and
 * firestore.rules. The user-doc validator forbids `updatedAt`, so no server
 * timestamp is written here.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { clampRating, INITIAL_RATING, type RatingState } from '../utils/applications/difficulty'

function userRef(uid: string) {
  if (!db) throw new Error('Firestore is not configured.')
  return doc(db, 'users', uid)
}

export async function loadApplicationsLevel(uid: string): Promise<RatingState | null> {
  if (!db) return null
  const snapshot = await getDoc(userRef(uid))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  const rawRating = data.applicationsRating
  const rawGames = data.applicationsGames
  if (typeof rawRating !== 'number' && typeof rawGames !== 'number') return null
  const rating = clampRating(
    typeof rawRating === 'number' && Number.isFinite(rawRating) ? rawRating : INITIAL_RATING,
  )
  const games =
    typeof rawGames === 'number' && Number.isFinite(rawGames)
      ? Math.max(0, Math.min(100000, Math.round(rawGames)))
      : 0
  return { rating, games }
}

export async function saveApplicationsLevel(uid: string, state: RatingState): Promise<void> {
  if (!db) return
  // Sanitize so we never emit values the security rules reject (rating is a
  // bounded float 1..15; games is a bounded non-negative integer).
  const payload: Record<string, unknown> = {}
  if (typeof state.rating === 'number' && Number.isFinite(state.rating)) {
    payload.applicationsRating = Math.round(clampRating(state.rating) * 1000) / 1000
  }
  if (typeof state.games === 'number' && Number.isFinite(state.games)) {
    payload.applicationsGames = Math.max(0, Math.min(100000, Math.round(state.games)))
  }
  await setDoc(userRef(uid), payload, { merge: true })
}
