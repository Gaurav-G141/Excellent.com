/**
 * End-of-lesson mastery quiz.
 *
 * The quiz reuses the exact interactive problem generators from the Practice
 * tab (`PRACTICE_LESSONS`), so quiz questions look and grade identically to
 * practice problems. A learner must solve all QUIZ_LENGTH problems to complete
 * the lesson (and unlock the next one); each problem is solved with the same
 * retry behavior as everywhere else, and the quiz can't be skipped past.
 *
 * Kept self-contained so the feature is easy to tweak or remove.
 */
import type { ProblemSlide } from '../../types/lesson'
import { PRACTICE_LESSONS } from '../practice'
import { pick, shuffle } from '../practice/helpers'

/** Questions per quiz; the learner must solve every one to pass. */
export const QUIZ_LENGTH = 4

function groupFor(lessonId: string) {
  return PRACTICE_LESSONS.find((group) => group.lessonId === lessonId)
}

/** Whether a lesson has an end-of-lesson quiz (i.e. practice topics exist). */
export function hasQuiz(lessonId: string): boolean {
  const group = groupFor(lessonId)
  return group != null && group.topics.length > 0
}

/**
 * Build one fresh quiz attempt: QUIZ_LENGTH interactive problems drawn from the
 * lesson's practice topics — distinct topics where possible, otherwise reusing
 * topics with fresh random numbers. Returns [] if the lesson has no topics.
 */
export function generateQuiz(lessonId: string): ProblemSlide[] {
  const group = groupFor(lessonId)
  if (!group || group.topics.length === 0) return []
  const topics = shuffle(group.topics).slice(0, QUIZ_LENGTH)
  while (topics.length < QUIZ_LENGTH) topics.push(pick(group.topics))
  return topics.map((topic) => topic.generate())
}
