import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface LessonProgress {
  currentSlideIndex: number
  lessonCompleted: boolean
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
  return {
    currentSlideIndex:
      typeof data.currentSlideIndex === 'number' ? data.currentSlideIndex : 0,
    lessonCompleted: Boolean(data.lessonCompleted),
  }
}

export async function saveLessonProgress(
  uid: string,
  lessonId: string,
  data: Partial<LessonProgress>,
): Promise<void> {
  if (!db) return
  await setDoc(
    progressRef(uid, lessonId),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
