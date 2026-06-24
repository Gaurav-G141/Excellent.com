import { useMemo, useState } from 'react'
import type { GreatestDerivativeConfig, ProblemSlide } from '../../types/lesson'
import {
  evaluateDerivative,
  interpolatePolynomial,
} from '../../utils/polynomial'
import { formatFeedback } from '../../utils/feedback'
import { GraphCanvas, TangentArrow } from '../graph/GraphCanvas'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function GreatestDerivativeSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as GreatestDerivativeConfig
  const { viewport, options } = config

  const coefficients = useMemo(
    () => interpolatePolynomial(options.map((o) => ({ x: o.x, y: o.y }))),
    [options],
  )

  // The answer is the point with the greatest (most positive) derivative.
  const correctLabel = useMemo(() => {
    let best = options[0]
    let bestDeriv = evaluateDerivative(coefficients, best.x)
    for (const opt of options.slice(1)) {
      const d = evaluateDerivative(coefficients, opt.x)
      if (d > bestDeriv) {
        bestDeriv = d
        best = opt
      }
    }
    return best.label
  }, [coefficients, options])

  const [selected, setSelected] = useState<string | null>(null)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)

  function handleCheck() {
    if (!selected || solved) return

    if (selected === correctLabel) {
      // A correct answer is acknowledged by the green flash only — no popup.
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
    } else {
      setWrongFeedback(
        formatFeedback(slide.feedback.wrong, {
          'correct answer': correctLabel,
          answer: selected,
          point: selected,
        }),
      )
    }
  }

  return (
    <>
      <CorrectFlash active={flashCorrect}>
        <GraphCanvas coefficients={coefficients} viewport={viewport}>
          {(api) => (
            <>
              {options.map((opt) => {
                const screen = api.toScreen(opt.x, opt.y)
                const isSelected = selected === opt.label

                return (
                  <g key={`${opt.label}-bubble`}>
                    <circle
                      cx={screen.x}
                      cy={screen.y}
                      r={16}
                      className={`graph-point-ring${isSelected ? ' selected' : ''}${solved && opt.label === correctLabel ? ' correct' : ''}`}
                      style={{ cursor: solved ? 'default' : 'pointer' }}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Point ${opt.label}`}
                      tabIndex={solved ? -1 : 0}
                      onClick={() => !solved && setSelected(opt.label)}
                      onKeyDown={(e) => {
                        if (!solved && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          setSelected(opt.label)
                        }
                      }}
                    />
                    <text
                      x={screen.x}
                      y={screen.y}
                      className="graph-point-label"
                      style={{ pointerEvents: 'none' }}
                    >
                      {opt.label}
                    </text>
                  </g>
                )
              })}

              {options.map((opt) => {
                const screen = api.toScreen(opt.x, opt.y)
                const angle = api.tangentScreenAngle(opt.x)

                return (
                  <g key={`${opt.label}-arrow`} className="graph-slope-arrow">
                    <TangentArrow
                      cx={screen.x}
                      cy={screen.y}
                      angle={angle}
                      length={26}
                      variant="tangent"
                    />
                  </g>
                )
              })}
            </>
          )}
        </GraphCanvas>

        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        {solved ? (
          <button type="button" className="slide-cta" onClick={onCorrect}>
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="slide-cta"
            disabled={!selected}
            onClick={handleCheck}
          >
            Check
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
