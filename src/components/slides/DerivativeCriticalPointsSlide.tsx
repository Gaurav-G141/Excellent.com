import { useMemo, useRef, useState } from 'react'
import type { DerivativeCriticalPointsConfig, ProblemSlide } from '../../types/lesson'
import {
  derivativeCoefficients,
  evaluatePoly,
  resolveCriticalPoints,
} from '../../utils/polynomial'
import { countNonCriticalSelections } from '../../utils/grading'
import { clientToSvg } from '../../utils/svgCoords'
import { GraphCanvas, type GraphApi } from '../graph/GraphCanvas'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'

interface Props {
  slide: ProblemSlide
  onCorrect: () => void
}

export function DerivativeCriticalPointsSlide({ slide, onCorrect }: Props) {
  const config = slide.config as unknown as DerivativeCriticalPointsConfig
  const { coefficients, viewport, derivativeViewport, criticalPoints, selectTolerance = 0.2 } =
    config

  const fSvgRef = useRef<SVGSVGElement>(null)
  const fpSvgRef = useRef<SVGSVGElement>(null)

  const derivativeCoeffs = useMemo(() => derivativeCoefficients(coefficients), [coefficients])
  const points = useMemo(
    () => resolveCriticalPoints(coefficients, criticalPoints),
    [coefficients, criticalPoints],
  )

  const [selectedXs, setSelectedXs] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [flashCorrect, setFlashCorrect] = useState(false)
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null)

  const toggleTolerance = selectTolerance

  function placeOrTogglePoint(x: number) {
    if (solved) return
    setSelectedXs((prev) => {
      const existingIndex = prev.findIndex((v) => Math.abs(v - x) < toggleTolerance)
      if (existingIndex !== -1) {
        return prev.filter((_, i) => i !== existingIndex)
      }
      return [...prev, x]
    })
  }

  function handleGraphTap(
    api: GraphApi,
    svgRef: React.RefObject<SVGSVGElement | null>,
    e: React.MouseEvent<SVGRectElement>,
  ) {
    const svg = svgRef.current
    if (!svg || solved) return
    const pt = clientToSvg(svg, e.clientX, e.clientY)
    if (
      pt.x < api.plotBounds.left ||
      pt.x > api.plotBounds.right ||
      pt.y < api.plotBounds.top ||
      pt.y > api.plotBounds.bottom
    ) {
      return
    }

    const dataX = api.screenToData(pt.x, pt.y).x
    placeOrTogglePoint(dataX)
  }

  function handleCheck() {
    if (solved) return

    const allSelectedAreCritical = selectedXs.every((x) =>
      points.some((point) => Math.abs(x - point.x) <= selectTolerance),
    )
    const allCriticalSelected = points.every((point) =>
      selectedXs.some((x) => Math.abs(x - point.x) <= selectTolerance),
    )

    if (
      allSelectedAreCritical &&
      allCriticalSelected &&
      selectedXs.length === points.length
    ) {
      setSolved(true)
      setFlashCorrect(true)
      setWrongFeedback(null)
      return
    }

    if (!allSelectedAreCritical) {
      const nonCriticalCount = countNonCriticalSelections(
        selectedXs,
        points.map((point) => point.x),
        selectTolerance,
      )
      setWrongFeedback(`${nonCriticalCount} of your points are not critical points. Try again.`)
    } else {
      setWrongFeedback(
        'You have not found all critical points. Tap where f\u2032(x) = 0 on the derivative graph.',
      )
    }
  }

  return (
    <>
      <CorrectFlash active={flashCorrect}>
        <div className="slide-dual-graph">
          <p className="slide-graph-caption">f(x)</p>
          <GraphCanvas
            ref={fSvgRef}
            coefficients={coefficients}
            viewport={viewport}
            className="graph-canvas--compact"
          >
            {(api) => (
              <>
                <GraphTapLayer
                  api={api}
                  disabled={solved}
                  onTap={(e) => handleGraphTap(api, fSvgRef, e)}
                />
                {selectedXs.map((x) => (
                  <SelectedMarker
                    key={`f-${x}`}
                    api={api}
                    x={x}
                    y={evaluatePoly(coefficients, x)}
                  />
                ))}
              </>
            )}
          </GraphCanvas>

          <p className="slide-graph-caption">f&prime;(x)</p>
          <GraphCanvas
            ref={fpSvgRef}
            coefficients={derivativeCoeffs}
            viewport={derivativeViewport}
            className="graph-canvas--compact graph-canvas--derivative"
          >
            {(api) => (
              <>
                <ZeroAxis api={api} viewport={derivativeViewport} />
                <GraphTapLayer
                  api={api}
                  disabled={solved}
                  onTap={(e) => handleGraphTap(api, fpSvgRef, e)}
                />
                {selectedXs.map((x) => (
                  <SelectedMarker
                    key={`fp-${x}`}
                    api={api}
                    x={x}
                    y={evaluatePoly(derivativeCoeffs, x)}
                    variant="derivative"
                  />
                ))}
              </>
            )}
          </GraphCanvas>
        </div>

        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
          <p className="slide-hint">
            Tap the derivative graph where f&prime;(x) = 0. Select every critical point ({selectedXs.length}{' '}
            selected).
          </p>
        </div>

        {!solved ? (
          <button
            type="button"
            className="slide-cta"
            disabled={selectedXs.length === 0}
            onClick={handleCheck}
          >
            Check
          </button>
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

function GraphTapLayer({
  api,
  onTap,
  disabled,
}: {
  api: GraphApi
  onTap: (e: React.MouseEvent<SVGRectElement>) => void
  disabled: boolean
}) {
  return (
    <rect
      x={api.plotBounds.left}
      y={api.plotBounds.top}
      width={api.plotBounds.right - api.plotBounds.left}
      height={api.plotBounds.bottom - api.plotBounds.top}
      fill="transparent"
      style={{ cursor: disabled ? 'default' : 'crosshair' }}
      onClick={disabled ? undefined : onTap}
    />
  )
}

function ZeroAxis({ api, viewport }: { api: GraphApi; viewport: DerivativeCriticalPointsConfig['viewport'] }) {
  if (viewport.yMin > 0 || viewport.yMax < 0) return null
  const y0 = api.toScreen(viewport.xMin, 0).y
  return (
    <line
      x1={api.plotBounds.left}
      y1={y0}
      x2={api.plotBounds.right}
      y2={y0}
      className="graph-zero-axis"
    />
  )
}

function SelectedMarker({
  api,
  x,
  y,
  variant,
}: {
  api: GraphApi
  x: number
  y: number
  variant?: 'derivative'
}) {
  const screen = api.toScreen(x, y)
  const top = api.toScreen(x, api.viewport.yMax)
  const bottom = api.toScreen(x, api.viewport.yMin)

  return (
    <g>
      <line
        x1={screen.x}
        y1={top.y}
        x2={screen.x}
        y2={bottom.y}
        className={`graph-marker-line${variant === 'derivative' ? ' graph-marker-line--derivative' : ''}`}
      />
      <circle cx={screen.x} cy={screen.y} r={5} className="graph-marker-dot" />
      <text x={screen.x} y={api.plotBounds.bottom + 14} className="graph-marker-label">
        x = {Number.isInteger(x) ? x : x.toFixed(1)}
      </text>
    </g>
  )
}
