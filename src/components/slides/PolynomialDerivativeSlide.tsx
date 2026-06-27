import { useMemo, useState } from 'react'
import type { ProblemSlide, TypeInDerivativeConfig } from '../../types/lesson'
import {
  derivativeCoefficients,
  polynomialsEqual,
  trimPolynomial,
} from '../../utils/polynomial'
import { PolynomialBuilder } from '../lesson/PolynomialBuilder'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson2.css'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

/**
 * Same problem shape as `typeInDerivative` (an f(x) plus its expanded
 * `coefficients`), but the learner assembles the derivative with the polynomial
 * playground calculator instead of typing free text. The answer must be built in
 * standard form and is graded by exact coefficient match against f′(x).
 */
export function PolynomialDerivativeSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as TypeInDerivativeConfig
  const { coefficients, display, prompt } = config

  const target = useMemo(
    () => derivativeCoefficients(coefficients),
    [coefficients],
  )

  const [input, setInput] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  const hasInput = trimPolynomial(input).length > 0

  function handleCheck() {
    if (solved || !hasInput) return

    if (polynomialsEqual(input, target)) {
      setSolved(true)
      setFlashCorrect(true)
      setWrong(false)
      setWrongFeedback(null)
    } else {
      setWrong(true)
      setWrongFeedback(
        slide.feedback.wrong ||
          'Not quite. Apply the rule and build the derivative in standard form.',
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
            <PolynomialBuilder
              value={input}
              onChange={(next) => {
                setInput(next)
                if (wrong) setWrong(false)
              }}
              maxDegree={8}
              maxCoefficient={999}
              label={prompt ?? 'f\u2032(x) ='}
              status={wrong ? 'wrong' : 'default'}
            />
            <button
              type="button"
              className="slide-cta"
              disabled={!hasInput}
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
