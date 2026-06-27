import { useEffect } from 'react'
import { useReportWrongAttempt } from './wrongAttemptContext'
import './FeedbackPopup.css'

interface Props {
  message: string
  correct: boolean
  onDismiss: () => void
}

export function FeedbackPopup({ message, correct, onDismiss }: Props) {
  const reportWrong = useReportWrongAttempt()
  // A wrong-answer popup means the learner just missed an attempt. Report it once
  // per popup so the mastery quiz can track first-try correctness; outside the
  // quiz the reporter is a no-op, so nothing else is affected.
  useEffect(() => {
    if (!correct) reportWrong()
  }, [correct, reportWrong])

  // The backdrop is intentionally a non-interactive visual layer: it must never
  // capture taps meant for the tabs/header underneath (a full-screen overlay with
  // an onClick used to eat the first nav tap after a wrong answer). Dismissal is
  // only via the button below; clicks land on whatever is actually behind it.
  return (
    <div className="feedback-overlay">
      <div
        className={`feedback-sheet${correct ? ' feedback-sheet--correct' : ''}`}
        role="dialog"
        aria-live="polite"
      >
        <p>{message}</p>
        <button type="button" className="feedback-dismiss" onClick={onDismiss}>
          {correct ? 'Got it' : 'Try again'}
        </button>
      </div>
    </div>
  )
}
