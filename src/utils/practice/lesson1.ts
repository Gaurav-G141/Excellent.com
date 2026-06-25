import { PRACTICE_TOPICS, generatePracticeProblem } from '../generateQuestion'
import type { PracticeLessonGroup } from './types'

/** Lesson 1 practice topics, reusing the existing derivatives generator. */
export const lesson1Practice: PracticeLessonGroup = {
  lessonId: 'derivatives-basics',
  lessonTitle: 'Derivatives',
  topics: PRACTICE_TOPICS.map((topic) => ({
    id: `l1-${topic.id}`,
    label: topic.label,
    generate: () => generatePracticeProblem(topic.id),
  })),
}
