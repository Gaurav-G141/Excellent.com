import derivativeRules from '../../content/lessons/derivative-rules.json'
import derivativesBasics from '../../content/lessons/derivatives-basics.json'
import exponentsProductRule from '../../content/lessons/exponents-product-rule.json'
import paperBox from '../../content/lessons/paper-box.json'
import relatedRates from '../../content/lessons/related-rates.json'
import type { Lesson } from '../types/lesson'

export const lessons: Record<string, Lesson> = {
  'derivatives-basics': derivativesBasics as Lesson,
  'derivative-rules': derivativeRules as Lesson,
  'related-rates': relatedRates as Lesson,
  'exponents-product-rule': exponentsProductRule as Lesson,
  'paper-box': paperBox as Lesson,
}

/** Course order — also the unlock order (each lesson opens the next). */
export const lessonList: Lesson[] = Object.values(lessons)

export const DEFAULT_LESSON_ID = 'derivatives-basics'

/**
 * Lessons that are always reachable, ignoring the positional unlock chain.
 * These are real-world explorations that stand on their own — open to anyone,
 * with a *recommended* (not required) lesson noted on the home card.
 */
const ALWAYS_OPEN: Record<string, true> = { 'paper-box': true }

/** A non-blocking suggestion of what to study before an always-open lesson. */
const RECOMMENDED_PREREQ: Record<string, string> = { 'paper-box': 'derivative-rules' }

export function isAlwaysOpen(lessonId: string): boolean {
  return ALWAYS_OPEN[lessonId] === true
}

/** Recommended-but-optional prior lesson for an always-open lesson, if any. */
export function recommendedPrerequisiteId(lessonId: string): string | null {
  return RECOMMENDED_PREREQ[lessonId] ?? null
}

/** The lesson a learner must finish before this one unlocks (null = always open). */
export function prerequisiteLessonId(lessonId: string): string | null {
  if (isAlwaysOpen(lessonId)) return null
  const index = lessonList.findIndex((lesson) => lesson.id === lessonId)
  if (index <= 0) return null
  return lessonList[index - 1].id
}

/** Display icon per lesson for the home page. */
export const LESSON_ICONS: Record<string, string> = {
  'derivatives-basics': '\u2202',
  'derivative-rules': '\u0192\u2032',
  'related-rates': '\u0394',
  'exponents-product-rule': '\u212f\u02e3',
  'paper-box': '\u{1F4E6}',
}
