/**
 * Firestore load/save for when each practice topic was last attempted.
 *
 * Powers the Practice tab's spaced-repetition review panel, which surfaces the
 * concepts a learner hasn't touched in a while. One small doc per topic lives at
 * `practice/{uid}/topics/{topicId}` holding a single `lastPracticedAt` server
 * timestamp. Bounds/shape match src/lib/firestoreValidation.ts and
 * firestore.rules. Best-effort: callers swallow failures so practice never breaks.
 */

import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

/** Map of practice topic id -> epoch ms it was last practiced. */
export type PracticeActivity = Record<string, number>

function topicsCollection(uid: string) {
  if (!db) throw new Error('Firestore is not configured.')
  return collection(db, 'practice', uid, 'topics')
}

function topicRef(uid: string, topicId: string) {
  if (!db) throw new Error('Firestore is not configured.')
  return doc(db, 'practice', uid, 'topics', topicId)
}

/** Record that `topicId` was just practiced. No-op without Firebase or an id. */
export async function recordPracticeActivity(uid: string, topicId: string): Promise<void> {
  if (!db) return
  if (!topicId) return
  await setDoc(topicRef(uid, topicId), { lastPracticedAt: serverTimestamp() }, { merge: true })
}

/** Load every topic's last-practiced time as epoch ms. Empty on any failure. */
export async function loadPracticeActivity(uid: string): Promise<PracticeActivity> {
  if (!db) return {}
  const snapshot = await getDocs(topicsCollection(uid))
  const out: PracticeActivity = {}
  snapshot.forEach((d) => {
    const ts = d.data().lastPracticedAt
    if (ts && typeof ts.toMillis === 'function') {
      out[d.id] = ts.toMillis()
    }
  })
  return out
}
