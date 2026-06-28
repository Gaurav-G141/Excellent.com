import { useMemo, useRef, useState } from 'react'
import type { ProblemSlide, SecantToTangentConfig } from '../../types/lesson'
import { evaluateDerivative, evaluatePoly } from '../../utils/polynomial'
import { DraggableGraphPoint } from '../graph/DraggableGraphPoint'
import { GraphCanvas } from '../graph/GraphCanvas'
import { SecantLine } from '../graph/SecantLine'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function SecantToTangentSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as SecantToTangentConfig
  const {
    coefficients,
    viewport,
    targetX,
    initialVariableX,
    coincidentThreshold,
    tolerance,
    minorGridStep = 0.2,
  } = config

  const svgRef = useRef<SVGSVGElement>(null)
  const [variableX, setVariableX] = useState(initialVariableX)
  const [slopeInput, setSlopeInput] = useState('')
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  const targetY = useMemo(() => evaluatePoly(coefficients, targetX), [coefficients, targetX])
  const correctSlope = useMemo(
    () => evaluateDerivative(coefficients, targetX),
    [coefficients, targetX],
  )

  const closeEnough = Math.abs(variableX - targetX) < coincidentThreshold
  const targetLabel = `(${targetX}, ${targetY})`

  function handleDrag(_id: string, x: number) {
    if (solved) return
    const minX = viewport.xMin + 0.2
    const maxX = viewport.xMax - 0.1
    setVariableX(Math.max(minX, Math.min(maxX, x)))
  }

  function handleCheck() {
    if (solved) return

    if (!closeEnough) {
      setWrongFeedback(
        slide.feedback.wrong ||
          'Drag P closer to the fixed point, then estimate the slope of the secant line.',
      )
      return
    }

    const entered = Number.parseFloat(slopeInput)
    if (Number.isNaN(entered)) return

    // Grade against the slope of the drawn secant (fixed point → P), which is
    // what the learner reads off the graph. Fall back to the analytic derivative
    // only in the degenerate case where P sits exactly on the fixed point.
    const dx = variableX - targetX
    const gradedSlope =
      Math.abs(dx) < 1e-6
        ? correctSlope
        : (evaluatePoly(coefficients, variableX) - targetY) / dx

    if (Math.abs(entered - gradedSlope) <= tolerance) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
    } else {
      setWrongFeedback(
        'The slope of a line is the change in y divided by the change in x. Estimate the slope of the line between the fixed point and P',
      )
    }
  }

  return (
    <>
      <CorrectFlash active={flashCorrect}>
        <GraphCanvas
          ref={svgRef}
          coefficients={coefficients}
          viewport={viewport}
          unitGrid
          minorGridStep={minorGridStep}
          showAxisLabels
        >
          {(api) => {
            const segment = api.secantSegment(targetX, variableX, 0)
            const targetScreen = api.toScreen(targetX, targetY)

            return (
              <>
                <SecantLine segment={segment} />

                <circle
                  cx={targetScreen.x}
                  cy={targetScreen.y}
                  r={6}
                  className="graph-target-dot"
                />
                <text
                  x={targetScreen.x}
                  y={targetScreen.y - 16}
                  className="graph-target-label"
                >
                  {targetLabel}
                </text>

                <DraggableGraphPoint
                  id="free"
                  x={variableX}
                  label="P"
                  api={api}
                  svgRef={svgRef}
                  disabled={solved}
                  onDrag={handleDrag}
                />
              </>
            )
          }}
        </GraphCanvas>

        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
          <p className="slide-hint">
            Drag <strong>P</strong> toward the fixed point at {targetLabel}. When the points are
            close, estimate the slope of the purple secant line.
          </p>
        </div>

        {!solved ? (
          <div className="slide-slope-input">
            <label htmlFor="secant-slope-input">
              Estimated slope at {targetLabel}
              {!closeEnough && ' (drag P closer first)'}
            </label>
            <input
              id="secant-slope-input"
              type="number"
              inputMode="decimal"
              step={0.1}
              placeholder="Enter slope"
              value={slopeInput}
              onChange={(e) => setSlopeInput(e.target.value)}
            />
            <button
              type="button"
              className="slide-cta"
              disabled={slopeInput.trim() === ''}
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
