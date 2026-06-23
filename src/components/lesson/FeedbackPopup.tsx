import './FeedbackPopup.css'

interface Props {
  message: string
  correct: boolean
  onDismiss: () => void
}

export function FeedbackPopup({ message, correct, onDismiss }: Props) {
  return (
    <div className="feedback-overlay" onClick={onDismiss} role="presentation">
      <div
        className={`feedback-sheet${correct ? ' feedback-sheet--correct' : ''}`}
        onClick={(e) => e.stopPropagation()}
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
