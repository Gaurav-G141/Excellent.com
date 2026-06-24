import { useMemo, useState } from 'react'
import type { ProblemSlide, SecantZoomDerivativeConfig } from '../../types/lesson'
import { evaluateDerivative, evaluatePoly } from '../../utils/polynomial'
import { formatFeedback } from '../../utils/feedback'
import { zoomViewport } from '../../utils/viewport'
import { GraphCanvas } from '../graph/GraphCanvas'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function SecantZoomDerivativeSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as SecantZoomDerivativeConfig
  const {
    coefficients,
    viewport,
    targetX,
    referenceX,
    minorGridStep = 0.2,
    zoomLevels,
    tolerance,
  } = config

  const [zoom, setZoom] = useState(1)
  const [slopeInput, setSlopeInput] = useState('')
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  const targetY = useMemo(() => evaluatePoly(coefficients, targetX), [coefficients, targetX])
  const referenceY = useMemo(
    () => evaluatePoly(coefficients, referenceX),
    [coefficients, referenceX],
  )

  const correctSlope = useMemo(
    () => evaluateDerivative(coefficients, targetX),
    [coefficients, targetX],
  )

  const zoomedViewport = useMemo(
    () => zoomViewport(viewport, targetX, targetY, zoom),
    [viewport, targetX, targetY, zoom],
  )

  const targetLabel = formatGridCoord(targetX, targetY, minorGridStep)
  const referenceLabel = formatGridCoord(referenceX, referenceY, minorGridStep)

  function handleCheck() {
    if (solved) return
    const entered = Number.parseFloat(slopeInput)
    if (Number.isNaN(entered)) return

    if (Math.abs(entered - correctSlope) <= tolerance) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
    } else {
      setWrongFeedback(
        formatFeedback(slide.feedback.wrong, {
          'x value to find derivative at': String(targetX),
        }),
      )
    }
  }

  return (
    <>
      <CorrectFlash active={flashCorrect}>
        <GraphCanvas
          coefficients={coefficients}
          viewport={zoomedViewport}
          unitGrid
          minorGridStep={minorGridStep}
          showAxisLabels
        >
          {(api) => {
            const targetScreen = api.toScreen(targetX, targetY)
            const refScreen = api.toScreen(referenceX, referenceY)

            return (
              <>
                <line
                  x1={targetScreen.x}
                  y1={targetScreen.y}
                  x2={refScreen.x}
                  y2={refScreen.y}
                  className="graph-secant-guide"
                />
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
                <circle
                  cx={refScreen.x}
                  cy={refScreen.y}
                  r={5}
                  className="graph-reference-dot"
                />
                <text
                  x={refScreen.x}
                  y={refScreen.y + 18}
                  className="graph-reference-label"
                >
                  {referenceLabel}
                </text>
              </>
            )
          }}
        </GraphCanvas>

        <div className="slide-scrubber">
          <label htmlFor="zoom-slider">Zoom in on the point</label>
          <input
            id="zoom-slider"
            type="range"
            min={1}
            max={zoomLevels}
            step={0.02}
            value={zoom}
            disabled={solved}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
          <p className="slide-hint">
            Bold lines mark whole units; thin lines are {minorGridStep} apart. Use the two
            marked points to count rise over run.
          </p>
        </div>

        {!solved ? (
          <div className="slide-slope-input">
            <label htmlFor="slope-input">Estimated slope at {targetLabel}</label>
            <input
              id="slope-input"
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

/** Format for grid reading — snaps each coordinate to the nearest minor grid line. */
function formatGridCoord(x: number, y: number, step: number): string {
  const snap = (v: number) => Math.round(v / step) * step
  const decimals = step < 1 ? Math.max(0, -Math.floor(Math.log10(step))) : 0
  const fmt = (v: number) => {
    const snapped = snap(v)
    return Number.isInteger(snapped) ? String(snapped) : snapped.toFixed(decimals)
  }
  return `(${fmt(x)}, ${fmt(y)})`
}
