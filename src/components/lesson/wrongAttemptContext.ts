import { createContext, useContext } from 'react'

/**
 * Lets a deeply-nested problem component report a wrong answer to an ancestor
 * without every slide component needing a new prop. The end-of-lesson mastery
 * quiz provides a real reporter so it can tell whether each question was solved
 * on the FIRST try; everywhere else (lessons, free practice) the default no-op
 * means behavior is completely unchanged.
 *
 * Wrong answers are surfaced centrally because every interactive problem renders
 * the shared {@link ../lesson/FeedbackPopup}, which calls this on a wrong attempt.
 */
const WrongAttemptContext = createContext<() => void>(() => {})

export { WrongAttemptContext }

/** Returns the current wrong-attempt reporter (a no-op outside the quiz). */
export function useReportWrongAttempt(): () => void {
  return useContext(WrongAttemptContext)
}
