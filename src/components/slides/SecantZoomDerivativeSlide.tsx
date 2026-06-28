import { useMemo, useState } from 'react'
import type { ProblemSlide, SecantZoomDerivativeConfig } from '../../types/lesson'
import { evaluatePoly } from '../../utils/polynomial'
import { zoomViewport } from '../../utils/viewport'
import { GraphCanvas } from '../graph/GraphCanvas'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

// Fraction of the available zoom range the learner must reach before we assume
// they've zoomed in enough to read the slope (below this we nudge them to keep
// zooming instead of telling them the slope is wrong).
const ZOOM_ENOUGH_FRACTION = 0.6
const NEEDS_ZOOM_MESSAGE =
  'Please zoom in further: The function should look almost like a straight line'
const WRONG_SLOPE_MESSAGE =
  'Recall that a derivative is the slope of the tangent line. The slope of a line is the change in y divided by the change in x'

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

  // Grade against the slope the learner actually reads off the zoomed graph:
  // the secant through the two marked points, not the exact analytic derivative.
  // The generator guarantees this secant is within ~0.1 of the true derivative.
  const secantSlope = useMemo(
    () => (referenceY - targetY) / (referenceX - targetX),
    [referenceY, targetY, referenceX, targetX],
  )

  const zoomedViewport = useMemo(
    () => zoomViewport(viewport, targetX, targetY, zoom),
    [viewport, targetX, targetY, zoom],
  )

  const targetLabel = formatGridCoord(targetX, targetY, minorGridStep)

  const zoomEnoughThreshold = 1 + (zoomLevels - 1) * ZOOM_ENOUGH_FRACTION

  function handleCheck() {
    if (solved) return
    const entered = Number.parseFloat(slopeInput)
    if (Number.isNaN(entered)) return

    // Zoom gate first: don't grade (correct or not) until the curve is nearly
    // straight, so the learner reads the slope off a near-linear segment.
    if (zoom < zoomEnoughThreshold) {
      setWrongFeedback(NEEDS_ZOOM_MESSAGE)
      return
    }

    if (Math.abs(entered - secantSlope) <= tolerance) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
    } else {
      setWrongFeedback(WRONG_SLOPE_MESSAGE)
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
