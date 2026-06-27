import { useState } from 'react'
import type { ProblemSlide } from '../../types/lesson'
import { SlideRenderer } from './SlideRenderer'
import './LessonQuiz.css'

interface Props {
  questions: ProblemSlide[]
  /** Called once the learner has solved every quiz question. */
  onPass: () => void
}

/**
 * End-of-lesson mastery quiz. Presents the lesson's interactive practice
 * problems one at a time (the same components, look, and grading as the Practice
 * tab). There is no skip — the learner must solve each question to advance, and
 * the lesson only completes once all of them are solved.
 */
export function LessonQuiz({ questions, onPass }: Props) {
  const total = questions.length
  const [index, setIndex] = useState(0)

  function handleSolved() {
    if (index >= total - 1) {
      onPass()
      return
    }
    setIndex((n) => n + 1)
  }

  const question = questions[index]

  return (
    <>
      <p className="quiz-progress">
        Quiz · Question {index + 1} of {total}
      </p>
      <SlideRenderer key={question.id} slide={question} onAdvance={handleSolved} />
    </>
  )
}
