import { useCallback, useRef, useState } from 'react'
import type { ProblemSlide } from '../../types/lesson'
import { SlideRenderer } from './SlideRenderer'
import { WrongAttemptContext } from './wrongAttemptContext'
import './LessonQuiz.css'

interface Props {
  /**
   * Builds one fresh quiz attempt. Called for the first attempt and again for
   * every retake, so each retake gets new questions/numbers.
   */
  generate: () => ProblemSlide[]
  /** Called once the learner masters the quiz (every question right on the first try). */
  onPass: () => void
}

/**
 * End-of-lesson mastery quiz. The learner must solve every question to move
 * through the quiz (no skipping, retry until correct — same grading as the
 * Practice tab), but lesson completion requires MASTERY: getting every question
 * right on the FIRST try. A wrong answer on any question still has to be
 * corrected to continue (so the learner learns it), yet it means that attempt
 * isn't a perfect run, so the learner retakes a fresh set until they ace it.
 *
 * First-try correctness is detected centrally: every interactive problem shows
 * the shared FeedbackPopup on a wrong answer, which reports through
 * WrongAttemptContext — so no individual problem component needs changing.
 */
export function LessonQuiz({ generate, onPass }: Props) {
  // Lazily build the first attempt once.
  const [questions, setQuestions] = useState<ProblemSlide[]>(() => generate())
  const [attempt, setAttempt] = useState(0)
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [failedScore, setFailedScore] = useState<number | null>(null)

  // Whether the CURRENT question has had any wrong attempt. A ref (not state) so
  // the wrong-attempt reporter can flip it without re-rendering, and so it's read
  // synchronously when the question is solved, free of stale-closure issues.
  const missedCurrent = useRef(false)

  const total = questions.length

  const reportWrong = useCallback(() => {
    missedCurrent.current = true
  }, [])

  const handleSolved = useCallback(() => {
    const wasFirstTry = !missedCurrent.current
    missedCurrent.current = false
    const nextCorrect = correct + (wasFirstTry ? 1 : 0)

    if (index >= total - 1) {
      // End of the attempt: mastery requires a perfect run.
      if (nextCorrect >= total) {
        onPass()
        return
      }
      setCorrect(nextCorrect)
      setFailedScore(nextCorrect)
      return
    }
    setCorrect(nextCorrect)
    setIndex(index + 1)
  }, [correct, index, total, onPass])

  const retake = useCallback(() => {
    setQuestions(generate())
    setAttempt((a) => a + 1)
    setIndex(0)
    setCorrect(0)
    setFailedScore(null)
    missedCurrent.current = false
  }, [generate])

  if (failedScore !== null) {
    return (
      <div className="quiz-result">
        <h2>Almost there</h2>
        <p className="quiz-result-score">
          You got <strong>{failedScore}</strong> of <strong>{total}</strong> right on
          the first try.
        </p>
        <p>
          To master this lesson you need all {total} on the first try. Review the
          ideas and take a fresh quiz when you&apos;re ready.
        </p>
        <button type="button" className="slide-cta" onClick={retake}>
          Try a new quiz
        </button>
      </div>
    )
  }

  const question = questions[index]

  return (
    <>
      <p className="quiz-progress">
        Quiz · Question {index + 1} of {total}
        <span className="quiz-score"> · {correct}/{total} on first try</span>
      </p>
      <WrongAttemptContext.Provider value={reportWrong}>
        <SlideRenderer
          key={`${attempt}-${question.id}`}
          slide={question}
          onAdvance={handleSolved}
        />
      </WrongAttemptContext.Provider>
    </>
  )
}
