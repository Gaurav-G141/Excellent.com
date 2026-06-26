import { useState } from 'react'
import type { ProblemSlide } from '../../types/lesson'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson4.css'

export interface MultipleChoiceConfig {
  /** Optional question prompt shown above the options. */
  prompt?: string
  /** Selectable answer choices, rendered in order. */
  options: string[]
  /** Index into `options` of the correct answer. */
  correctIndex: number
}

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function MultipleChoiceSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as MultipleChoiceConfig
  const { prompt, options, correctIndex } = config

  const [solved, setSolved] = useState(false)
  const [flash, setFlash] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  function chooseOption(index: number) {
    if (solved) return
    setSelected(index)
    if (index === correctIndex) {
      setWrongFeedback(null)
      setFlash(true)
      setSolved(true)
    } else {
      setWrongFeedback(
        slide.feedback.wrong || 'Not quite — try another option.',
      )
    }
  }

  const promptId = `mc-prompt-${slide.id}`

  return (
    <>
      <CorrectFlash active={flash}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        {prompt && (
          <p id={promptId} className="mc-prompt">
            {prompt}
          </p>
        )}

        <div
          className="mc-options"
          role="group"
          aria-labelledby={prompt ? promptId : undefined}
          aria-label={prompt ? undefined : slide.title}
        >
          {options.map((option, index) => {
            const isCorrectChoice = solved && index === correctIndex
            return (
              <button
                key={`${index}-${option}`}
                type="button"
                className={`mc-option${isCorrectChoice ? ' mc-option--correct' : ''}`}
                onClick={() => chooseOption(index)}
                disabled={solved}
                aria-pressed={selected === index}
              >
                {option}
              </button>
            )
          })}
        </div>

        {solved && (
          <button type="button" className="slide-cta" onClick={onCorrect}>
            Continue
          </button>
        )}
      </CorrectFlash>

      {wrongFeedback && (
        <FeedbackPopup
          message={wrongFeedback}
          correct={false}
          onDismiss={() => setWrongFeedback(null)}
        />
      )}
    </>
  )
}
