import { useMemo, useRef, useState } from 'react'
import type { DemoSlide, MeanValueTheoremConfig } from '../../types/lesson'
import { evaluateDerivative, evaluatePoly, findWhereDerivativeEquals } from '../../utils/polynomial'
import { DraggableGraphPoint } from '../graph/DraggableGraphPoint'
import { GraphCanvas } from '../graph/GraphCanvas'
import { SecantLine } from '../graph/SecantLine'
import './Lesson2.css'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

export function MeanValueTheoremSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as MeanValueTheoremConfig
  const { coefficients, viewport, initialAx, initialBx } = config

  const svgRef = useRef<SVGSVGElement>(null)
  const [ax, setAx] = useState(initialAx)
  const [bx, setBx] = useState(initialBx)
  const [showTangent, setShowTangent] = useState(false)

  const lo = Math.min(ax, bx)
  const hi = Math.max(ax, bx)
  // Only treat A and B as the SAME point when they're essentially pixel-identical.
  // 0.02 data units is far below one on-screen pixel for these viewports, so the
  // parallel tangent stays available for any visibly-separated pair of points.
  const COINCIDENT_EPSILON = 0.02
  const coincident = Math.abs(hi - lo) < COINCIDENT_EPSILON
  const midX = (lo + hi) / 2

  const secantSlope = useMemo(
    () => (evaluatePoly(coefficients, hi) - evaluatePoly(coefficients, lo)) / (hi - lo),
    [coefficients, lo, hi],
  )
  // When the points coincide the secant slope is undefined (NaN), so fall back
  // to the tangent slope (the derivative) at the shared point.
  const displaySlope = coincident ? evaluateDerivative(coefficients, midX) : secantSlope
  const cValue = useMemo(
    () => findWhereDerivativeEquals(coefficients, secantSlope, lo, hi),
    [coefficients, secantSlope, lo, hi],
  )

  function handleDrag(id: string, x: number) {
    const clamped = Math.max(viewport.xMin + 0.1, Math.min(viewport.xMax - 0.1, x))
    if (id === 'A') setAx(clamped)
    else setBx(clamped)
    setShowTangent(false)
  }

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <GraphCanvas
        ref={svgRef}
        coefficients={coefficients}
        viewport={viewport}
        unitGrid
        showAxisLabels
      >
        {(api) => {
          // Avoid a degenerate/infinite secant when the points coincide by
          // drawing the tangent at the shared point instead.
          const segment = coincident ? api.clippedTangentSegment(midX) : api.secantSegment(ax, bx, 0)
          const tangent =
            showTangent && cValue != null ? api.clippedTangentSegment(cValue) : null
          const cScreen =
            showTangent && cValue != null
              ? api.toScreen(cValue, evaluatePoly(coefficients, cValue))
              : null

          return (
            <>
              <SecantLine segment={segment} />

              {tangent && (
                <line
                  x1={tangent.x1}
                  y1={tangent.y1}
                  x2={tangent.x2}
                  y2={tangent.y2}
                  className="mvt-tangent"
                />
              )}
              {cScreen && (
                <>
                  <circle cx={cScreen.x} cy={cScreen.y} r={5} className="mvt-c-dot" />
                  <text x={cScreen.x} y={cScreen.y - 12} className="graph-target-label">
                    c
                  </text>
                </>
              )}

              <DraggableGraphPoint id="A" x={ax} label="A" api={api} svgRef={svgRef} onDrag={handleDrag} />
              <DraggableGraphPoint id="B" x={bx} label="B" api={api} svgRef={svgRef} onDrag={handleDrag} />
            </>
          )
        }}
      </GraphCanvas>

      <div className="slide-copy">
        <p className="slide-hint">
          Secant slope (average rate) = <strong>{displaySlope.toFixed(2)}</strong>
          {showTangent && cValue != null && (
            <>
              {' '}
              · tangent at c = {cValue.toFixed(2)} has the same slope.
            </>
          )}
        </p>
      </div>

      <div className="lesson2-actions">
        <button
          type="button"
          className="slide-secondary-cta"
          disabled={coincident}
          onClick={() => setShowTangent(true)}
        >
          Show parallel tangent
        </button>
        <button type="button" className="slide-cta" onClick={onContinue}>
          {slide.ctaLabel ?? 'Continue'}
        </button>
      </div>
    </>
  )
}
