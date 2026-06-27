import { describe, it, expect } from 'vitest'
import { lessonList } from '../../lessons'
import { PRACTICE_LESSONS } from '../practice'
import { generateQuiz, hasQuiz, QUIZ_LENGTH } from './index'

describe('quiz registry', () => {
  it('every lesson has an end-of-lesson quiz', () => {
    for (const lesson of lessonList) {
      expect(hasQuiz(lesson.id)).toBe(true)
    }
  })

  it('reports no quiz for an unknown lesson', () => {
    expect(hasQuiz('not-a-lesson')).toBe(false)
    expect(generateQuiz('not-a-lesson')).toEqual([])
  })

  it('draws QUIZ_LENGTH interactive problems from the lesson practice topics', () => {
    for (const group of PRACTICE_LESSONS) {
      const topicComponents = new Set(group.topics.map((t) => t.generate().component))
      for (let attempt = 0; attempt < 30; attempt++) {
        const quiz = generateQuiz(group.lessonId)
        expect(quiz).toHaveLength(QUIZ_LENGTH)
        const ids = new Set(quiz.map((q) => q.id))
        expect(ids.size).toBe(QUIZ_LENGTH) // every problem instance is distinct
        for (const problem of quiz) {
          expect(problem.type).toBe('problem')
          // Questions come from this lesson's own practice topics.
          expect(topicComponents.has(problem.component)).toBe(true)
        }
      }
    }
  })
})
