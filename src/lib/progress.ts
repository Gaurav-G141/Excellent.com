import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface LessonProgress {
  currentSlideIndex: number
  lessonCompleted: boolean
  /** When this lesson was last touched, in epoch ms (null if never written). */
  updatedAt: number | null
}

function progressRef(uid: string, lessonId: string) {
  if (!db) throw new Error('Firestore is not configured.')
  return doc(db, 'progress', uid, 'lessons', lessonId)
}

export async function loadLessonProgress(
  uid: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  if (!db) return null
  const snapshot = await getDoc(progressRef(uid, lessonId))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  const updatedAt = data.updatedAt
  return {
    currentSlideIndex:
      typeof data.currentSlideIndex === 'number' ? data.currentSlideIndex : 0,
    lessonCompleted: Boolean(data.lessonCompleted),
    updatedAt:
      updatedAt && typeof updatedAt.toMillis === 'function'
        ? updatedAt.toMillis()
        : null,
  }
}

/**
 * Load progress for every lesson the learner has touched, keyed by lesson id.
 * Empty on any failure or when Firestore is unconfigured. Used by the Practice
 * tab's review panel to treat recent lesson work as "studied" for staleness.
 */
export async function loadAllLessonProgress(
  uid: string,
): Promise<Record<string, LessonProgress>> {
  if (!db) return {}
  const snapshot = await getDocs(collection(db, 'progress', uid, 'lessons'))
  const out: Record<string, LessonProgress> = {}
  snapshot.forEach((d) => {
    const data = d.data()
    const updatedAt = data.updatedAt
    out[d.id] = {
      currentSlideIndex:
        typeof data.currentSlideIndex === 'number' ? data.currentSlideIndex : 0,
      lessonCompleted: Boolean(data.lessonCompleted),
      updatedAt:
        updatedAt && typeof updatedAt.toMillis === 'function'
          ? updatedAt.toMillis()
          : null,
    }
  })
  return out
}

export async function saveLessonProgress(
  uid: string,
  lessonId: string,
  data: Partial<LessonProgress>,
): Promise<void> {
  if (!db) return
  // Sanitize so we never emit values the security rules reject (index is a
  // bounded non-negative integer; completion is a boolean).
  const payload: Record<string, unknown> = {}
  if (typeof data.currentSlideIndex === 'number' && Number.isFinite(data.currentSlideIndex)) {
    payload.currentSlideIndex = Math.max(0, Math.min(1000, Math.round(data.currentSlideIndex)))
  }
  if (typeof data.lessonCompleted === 'boolean') {
    payload.lessonCompleted = data.lessonCompleted
  }
  await setDoc(progressRef(uid, lessonId), { ...payload, updatedAt: serverTimestamp() }, {
    merge: true,
  })
}
