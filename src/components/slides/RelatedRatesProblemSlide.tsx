import { useState } from 'react'
import type {
  ProblemSlide,
  RelatedRatesProblem,
  RelatedRatesProblemConfig,
  RelatedRatesShape,
} from '../../types/lesson'
import { matchesNumber } from '../../utils/expression'
import { buildRelatedRatesProblem } from '../../utils/generateQuestion'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson3.css'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

/** Chain-rule derivation steps shown for each shape (mirrors L3S1's style). */
function derivationSteps(shape: RelatedRatesShape): string[] {
  if (shape === 'sphere') {
    return ['V = 4⁄3 · πr³', 'dV/dr = 4πr²', 'By the chain rule: dV/dt = 4πr² · (dr/dt)']
  }
  if (shape === 'square') {
    return ['A = s²', 'dA/ds = 2s', 'By the chain rule: dA/dt = 2s · (ds/dt)']
  }
  return ['V = s³', 'dV/ds = 3s²', 'By the chain rule: dV/dt = 3s² · (ds/dt)']
}

function ShapeGlyph({ shape }: { shape: RelatedRatesShape }) {
  if (shape === 'sphere') {
    return (
      <svg className="rr-shape" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r="26" className="rr-shape-fill" />
        <ellipse cx="40" cy="40" rx="26" ry="9" className="rr-shape-line" />
      </svg>
    )
  }
  if (shape === 'square') {
    return (
      <svg className="rr-shape" viewBox="0 0 80 80" aria-hidden>
        <rect x="16" y="16" width="48" height="48" rx="3" className="rr-shape-fill" />
      </svg>
    )
  }
  return (
    <svg className="rr-shape" viewBox="0 0 80 80" aria-hidden>
      <rect x="14" y="26" width="38" height="38" rx="2" className="rr-shape-fill" />
      <path d="M14 26 L28 14 L66 14 L52 26" className="rr-shape-line" />
      <path d="M52 26 L66 14 L66 52 L52 64" className="rr-shape-line" />
    </svg>
  )
}

export function RelatedRatesProblemSlide({ slide, onCorrect }: Props) {
  const configProblem = (slide.config as unknown as Partial<RelatedRatesProblemConfig>).problem
  // Fall back to a generated problem if the lesson JSON didn't supply one, so a
  // config-less slide renders a valid question instead of crashing.
  const [problem] = useState<RelatedRatesProblem>(
    () => configProblem ?? buildRelatedRatesProblem(),
  )
  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  function handleCheck() {
    if (solved || answer.trim() === '') return
    if (matchesNumber(answer, problem.exact)) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
    } else {
      setWrongFeedback(slide.feedback.wrong || problem.hint)
    }
  }

  return (
    <>
      <CorrectFlash active={flashCorrect}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="rr-problem">
          <ShapeGlyph shape={problem.shape} />
          <p className="rr-prompt">{problem.prompt}</p>
        </div>

        <div className="rr-derivation">
          <p className="rr-derivation-title">How the rate formula is derived</p>
          {derivationSteps(problem.shape).map((step) => (
            <p key={step} className="rr-derivation-step">
              {step}
            </p>
          ))}
        </div>

        <p className="rr-scaffold">{problem.scaffold}</p>

        {!solved ? (
          <div className="slide-slope-input">
            <label htmlFor="rr-answer">Rate of change ({problem.measureUnit})</label>
            <input
              id="rr-answer"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="enter a number (π is allowed)"
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
