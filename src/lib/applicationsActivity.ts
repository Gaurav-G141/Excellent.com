/**
 * Firestore load/save for when each Applications topic was last served.
 *
 * Powers the Applications tab's recency-weighted topic picker, which deprioritizes
 * concepts the learner has seen recently so variety stays high and stale concepts
 * resurface. One small doc per topic lives at `applications/{uid}/topics/{topicId}`
 * holding a single `lastSeenAt` server timestamp. Bounds/shape match
 * src/lib/firestoreValidation.ts and firestore.rules. Best-effort: callers swallow
 * failures so the Applications tab never breaks if a write fails.
 */

import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

/** Map of Applications topic id -> epoch ms it was last served. */
export type ApplicationsActivity = Record<string, number>

function topicsCollection(uid: string) {
  if (!db) throw new Error('Firestore is not configured.')
  return collection(db, 'applications', uid, 'topics')
}

function topicRef(uid: string, topicId: string) {
  if (!db) throw new Error('Firestore is not configured.')
  return doc(db, 'applications', uid, 'topics', topicId)
}

/** Record that `topicId` was just served. No-op without Firebase or an id. */
export async function recordApplicationsSeen(uid: string, topicId: string): Promise<void> {
  if (!db) return
  if (!topicId) return
  await setDoc(topicRef(uid, topicId), { lastSeenAt: serverTimestamp() }, { merge: true })
}

/** Load every topic's last-served time as epoch ms. Empty on any failure. */
export async function loadApplicationsActivity(uid: string): Promise<ApplicationsActivity> {
  if (!db) return {}
  const snapshot = await getDocs(topicsCollection(uid))
  const out: ApplicationsActivity = {}
  snapshot.forEach((d) => {
    const ts = d.data().lastSeenAt
    if (ts && typeof ts.toMillis === 'function') {
      out[d.id] = ts.toMillis()
    }
  })
  return out
}
