import derivativeRules from '../../content/lessons/derivative-rules.json'
import derivativesBasics from '../../content/lessons/derivatives-basics.json'
import type { Lesson } from '../types/lesson'

export const lessons: Record<string, Lesson> = {
  'derivatives-basics': derivativesBasics as Lesson,
  'derivative-rules': derivativeRules as Lesson,
}

export const lessonList: Lesson[] = Object.values(lessons)

export const DEFAULT_LESSON_ID = 'derivatives-basics'

/** Display icon per lesson for the home page. */
export const LESSON_ICONS: Record<string, string> = {
  'derivatives-basics': '\u2202',
  'derivative-rules': '\u0192\u2032',
}
