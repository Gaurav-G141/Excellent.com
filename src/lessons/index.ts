import derivativeRules from '../../content/lessons/derivative-rules.json'
import derivativesBasics from '../../content/lessons/derivatives-basics.json'
import relatedRates from '../../content/lessons/related-rates.json'
import type { Lesson } from '../types/lesson'

export const lessons: Record<string, Lesson> = {
  'derivatives-basics': derivativesBasics as Lesson,
  'derivative-rules': derivativeRules as Lesson,
  'related-rates': relatedRates as Lesson,
}

/** Course order — also the unlock order (each lesson opens the next). */
export const lessonList: Lesson[] = Object.values(lessons)

export const DEFAULT_LESSON_ID = 'derivatives-basics'

/** The lesson a learner must finish before this one unlocks (null = always open). */
export function prerequisiteLessonId(lessonId: string): string | null {
  const index = lessonList.findIndex((lesson) => lesson.id === lessonId)
  if (index <= 0) return null
  return lessonList[index - 1].id
}

/** Display icon per lesson for the home page. */
export const LESSON_ICONS: Record<string, string> = {
  'derivatives-basics': '\u2202',
  'derivative-rules': '\u0192\u2032',
  'related-rates': '\u0394',
}
