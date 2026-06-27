/**
 * Firestore load/save for a learner's self-reported interests.
 *
 * Interests live as a string array on the existing `users/{uid}` document and
 * are used to gently theme the Applications tab's problems toward what the
 * learner actually cares about. Bounds/shape mirror src/lib/firestoreValidation.ts
 * and firestore.rules. Everything is sanitized before write so we never emit a
 * value the security rules would reject.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { MAX_INTEREST_LENGTH, MAX_INTERESTS } from './firestoreValidation'

export { MAX_INTEREST_LENGTH, MAX_INTERESTS }

/**
 * Normalize arbitrary input into a clean interest list: trimmed, single-spaced,
 * de-duplicated case-insensitively, each clipped to MAX_INTEREST_LENGTH, and the
 * whole list capped at MAX_INTERESTS. Anything non-string is dropped.
 */
export function sanitizeInterests(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of raw) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim().replace(/\s+/g, ' ').slice(0, MAX_INTEREST_LENGTH)
    if (trimmed.length === 0) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
    if (out.length >= MAX_INTERESTS) break
  }
  return out
}

/** Load the learner's saved interests. Empty array on any failure. */
export async function loadInterests(uid: string): Promise<string[]> {
  if (!db) return []
  const snapshot = await getDoc(doc(db, 'users', uid))
  if (!snapshot.exists()) return []
  return sanitizeInterests(snapshot.data().interests)
}

/** Persist the learner's interests (sanitized). No-op without Firebase. */
export async function saveInterests(uid: string, interests: string[]): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid), { interests: sanitizeInterests(interests) }, {
    merge: true,
  })
}
