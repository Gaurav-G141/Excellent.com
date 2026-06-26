import { lesson1Applications } from './lesson1'
import { lesson2Applications } from './lesson2'
import { lesson3Applications } from './lesson3'
import { lesson4Applications } from './lesson4'
import type { ApplicationLessonGroup } from './types'

/** All Applications topics, grouped by lesson, in course order. */
export const APPLICATION_LESSONS: ApplicationLessonGroup[] = [
  lesson1Applications,
  lesson2Applications,
  lesson3Applications,
  lesson4Applications,
].filter((group) => group.topics.length > 0)

export type {
  ApplicationLessonGroup,
  ApplicationTopicDef,
  AppField,
  WordProblem,
} from './types'
