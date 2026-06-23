import { useMemo, useState } from 'react'
import type { ProblemSlide, TypeInDerivativeConfig } from '../../types/lesson'
import { matchesPolynomial } from '../../utils/expression'
import { derivativeCoefficients } from '../../utils/polynomial'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function TypeInDerivativeSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as TypeInDerivativeConfig
  const { coefficients, display, prompt, placeholder, sampleXs, tolerance } = config

  const trueDerivative = useMemo(
    () => derivativeCoefficients(coefficients),
    [coefficients],
  )

  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  function handleCheck() {
    if (solved || answer.trim() === '') return

    if (matchesPolynomial(answer, trueDerivative, { sampleXs, tolerance })) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
    } else {
      setWrongFeedback(
        slide.feedback.wrong ||
          'Not quite. Apply the rule and enter the derivative (any equivalent form works).',
      )
    }
  }

  return (
    <>
      <CorrectFlash active={flashCorrect}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="typein-expression">
          <span className="typein-fx">f(x) =</span>
          <span className="typein-display">{display}</span>
        </div>

        {!solved ? (
          <div className="slide-slope-input">
            <label htmlFor="derivative-input">{prompt ?? "f\u2032(x) ="}</label>
            <input
              id="derivative-input"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={placeholder ?? 'e.g. 2x + 3'}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCheck()
              }}
            />
            <button
              type="button"
              className="slide-cta"
              disabled={answer.trim() === ''}
              onClick={handleCheck}
            >
              Check
            </button>
          </div>
        ) : (
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
