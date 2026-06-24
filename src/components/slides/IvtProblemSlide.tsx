import { useMemo, useState } from 'react'
import type { IvtProblemConfig, ProblemSlide } from '../../types/lesson'
import { evaluatePoly } from '../../utils/polynomial'
import { GraphCanvas } from '../graph/GraphCanvas'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import './Lesson3.css'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function IvtProblemSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as IvtProblemConfig
  const { coefficients, viewport, ax, bx, functionDisplay, guaranteedValue, distractors } = config

  const lo = Math.min(ax, bx)
  const hi = Math.max(ax, bx)
  const fa = useMemo(() => evaluatePoly(coefficients, lo), [coefficients, lo])
  const fb = useMemo(() => evaluatePoly(coefficients, hi), [coefficients, hi])

  const options = useMemo(
    () => shuffle([guaranteedValue, ...distractors]),
    [guaranteedValue, distractors],
  )

  const [solved, setSolved] = useState(false)
  const [flash, setFlash] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  function chooseOption(value: number) {
    if (solved) return
    if (value === guaranteedValue) {
      setWrongFeedback(null)
      setFlash(true)
      setSolved(true)
    } else {
      setWrongFeedback(
        slide.feedback.wrong ||
          `The IVT only guarantees values between f(a) = ${fa.toFixed(1)} and f(b) = ${fb.toFixed(1)}.`,
      )
    }
  }

  return (
    <>
      <CorrectFlash active={flash}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="mvt-given">
          <span>
            f(x) = <strong>{functionDisplay}</strong>
          </span>
          <span>f(a) = {fa.toFixed(1)}</span>
          <span>f(b) = {fb.toFixed(1)}</span>
        </div>

        <GraphCanvas coefficients={coefficients} viewport={viewport} unitGrid showAxisLabels>
          {(api) => {
            const aS = api.toScreen(lo, fa)
            const bS = api.toScreen(hi, fb)
            return (
              <>
                <circle cx={aS.x} cy={aS.y} r={5} className="graph-target-dot" />
                <text x={aS.x} y={aS.y - 12} className="graph-target-label">
                  A
                </text>
                <circle cx={bS.x} cy={bS.y} r={5} className="graph-target-dot" />
                <text x={bS.x} y={bS.y - 12} className="graph-target-label">
                  B
                </text>
              </>
            )
          }}
        </GraphCanvas>

        {!solved && (
          <div className="ivt-question">
            <p className="ivt-question-prompt">
              Which value is f guaranteed to take somewhere on [{lo}, {hi}]?
            </p>
            <div className="ivt-options">
              {options.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="ivt-option"
                  onClick={() => chooseOption(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

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
