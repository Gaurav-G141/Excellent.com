import { useMemo, useState } from 'react'
import type { ProblemSlide, SecondDerivativeProblemConfig } from '../../types/lesson'
import { useTween } from '../../hooks/useTween'
import { matchesNumber } from '../../utils/expression'
import { evaluatePoly, evaluateSecondDerivative } from '../../utils/polynomial'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson3.css'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

const W = 320
const H = 90
const PAD = 24
const TRACK_Y = 54

export function SecondDerivativeProblemSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as SecondDerivativeProblemConfig
  const {
    coefficients,
    display,
    t0,
    tMax,
    unit = 'm',
    tolerance,
    prompt,
    placeholder,
    feedbackWrong,
  } = config

  const acceleration = useMemo(
    () => evaluateSecondDerivative(coefficients, t0),
    [coefficients, t0],
  )

  const sBounds = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i <= 60; i++) {
      const s = evaluatePoly(coefficients, (tMax * i) / 60)
      lo = Math.min(lo, s)
      hi = Math.max(hi, s)
    }
    return { lo, hi: hi === lo ? lo + 1 : hi }
  }, [coefficients, tMax])

  const [t, setT] = useState(0)
  const { play, playing } = useTween(2600, (progress) => setT(progress * tMax))

  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  const sNow = evaluatePoly(coefficients, t)
  const bugX = PAD + ((sNow - sBounds.lo) / (sBounds.hi - sBounds.lo)) * (W - 2 * PAD)

  function handleCheck() {
    if (solved || answer.trim() === '') return
    if (matchesNumber(answer, acceleration, tolerance)) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
    } else {
      setWrongFeedback(
        feedbackWrong ||
          slide.feedback.wrong ||
          'Acceleration is the second derivative. Differentiate s(t) twice, then plug in t.',
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

        <div className="sd-given">
          s(t) = <strong>{display}</strong>
        </div>

        <svg className="sd-track" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bug moving along a track">
          <line x1={PAD} y1={TRACK_Y} x2={W - PAD} y2={TRACK_Y} className="sd-track-line" />
          <line x1={PAD} y1={TRACK_Y - 6} x2={PAD} y2={TRACK_Y + 6} className="sd-track-tick" />
          <line
            x1={W - PAD}
            y1={TRACK_Y - 6}
            x2={W - PAD}
            y2={TRACK_Y + 6}
            className="sd-track-tick"
          />
          <circle cx={bugX} cy={TRACK_Y} r={7} className="sd-bug" />
          <text x={W / 2} y={26} className="sd-track-readout">
            t = {t.toFixed(2)} · position {sNow.toFixed(1)} {unit}
          </text>
        </svg>

        <div className="sd-controls">
          <button
            type="button"
            className="cr-step-btn"
            onClick={() => {
              setT(0)
              play()
            }}
          >
            {playing ? 'Playing…' : 'Replay motion'}
          </button>
        </div>

        {!solved ? (
          <div className="slide-slope-input">
            <label htmlFor="sd-answer">{prompt ?? `Acceleration at t = ${t0} (${unit}/s²)`}</label>
            <input
              id="sd-answer"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              placeholder={placeholder ?? 'enter a number'}
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
