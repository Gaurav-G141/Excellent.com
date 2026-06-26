import { lesson1Practice } from './lesson1'
import { lesson2Practice } from './lesson2'
import { lesson3Practice } from './lesson3'
import { lesson4Practice } from './lesson4'
import type { PracticeLessonGroup } from './types'

/** All practice topics, grouped by lesson, in course order. */
export const PRACTICE_LESSONS: PracticeLessonGroup[] = [
  lesson1Practice,
  lesson2Practice,
  lesson3Practice,
  lesson4Practice,
].filter((group) => group.topics.length > 0)

export type { PracticeLessonGroup, PracticeTopicDef } from './types'
