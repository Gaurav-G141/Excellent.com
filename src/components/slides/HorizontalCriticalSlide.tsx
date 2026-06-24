import { useMemo, useState } from 'react'
import type { DemoSlide, HorizontalCriticalConfig } from '../../types/lesson'
import { resolveCriticalPoints } from '../../utils/polynomial'
import { GraphCanvas } from '../graph/GraphCanvas'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

const TYPE_MESSAGES: Record<string, string> = {
  max: "Local maximum — the tangent is horizontal, so f\u2032(x) = 0.",
  min: "Local minimum — the tangent is horizontal, so f\u2032(x) = 0.",
  critical: "Critical point — the tangent is horizontal, so f\u2032(x) = 0.",
}

export function HorizontalCriticalSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as HorizontalCriticalConfig
  const { coefficients, viewport, criticalPoints, snapThreshold = 0.05, initialLineY } = config

  const points = useMemo(
    () => resolveCriticalPoints(coefficients, criticalPoints),
    [coefficients, criticalPoints],
  )

  const defaultY = initialLineY ?? points[0]?.y ?? (viewport.yMin + viewport.yMax) / 2
  const [lineY, setLineY] = useState(defaultY)

  const activePoint = useMemo(() => {
    let best: (typeof points)[0] | null = null
    let bestDist = Infinity
    for (const point of points) {
      const dist = Math.abs(lineY - point.y)
      if (dist < snapThreshold && dist < bestDist) {
        bestDist = dist
        best = point
      }
    }
    return best
  }, [points, lineY, snapThreshold])

  return (
    <>
      <GraphCanvas coefficients={coefficients} viewport={viewport}>
        {(api) => {
          // Track the slider continuously (no snapping) so the line glides; the
          // nearby critical dot still lights up when the line is close.
          const lineScreenY = api.toScreen(viewport.xMin, lineY).y

          return (
            <>
              <line
                x1={api.plotBounds.left}
                y1={lineScreenY}
                x2={api.plotBounds.right}
                y2={lineScreenY}
                className="graph-horizontal-line"
              />

              {points.map((point) => {
                const screen = api.toScreen(point.x, point.y)
                const isActive = activePoint?.x === point.x
                return (
                  <g key={point.x}>
                    <circle
                      cx={screen.x}
                      cy={screen.y}
                      r={isActive ? 7 : 4}
                      className={`graph-critical-dot${isActive ? ' graph-critical-dot--active' : ''}`}
                    />
                    {isActive && (
                      <text x={screen.x} y={screen.y - 14} className="graph-critical-label">
                        x = {formatCoord(point.x)}
                      </text>
                    )}
                  </g>
                )
              })}
            </>
          )
        }}
      </GraphCanvas>

      <div className="slide-scrubber">
        <label htmlFor="horizontal-line-scrub">Move the horizontal line</label>
        <input
          id="horizontal-line-scrub"
          type="range"
          min={viewport.yMin}
          max={viewport.yMax}
          step={0.01}
          value={lineY}
          onChange={(e) => setLineY(Number(e.target.value))}
        />
      </div>

      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
        {activePoint ? (
          <p className="slide-hint slide-hint--active">{TYPE_MESSAGES[activePoint.type]}</p>
        ) : (
          <p className="slide-hint">
            Slide the line until it touches the curve at a peak, valley, or other critical point.
          </p>
        )}
      </div>

      <button type="button" className="slide-cta" onClick={onContinue}>
        {slide.ctaLabel ?? 'Continue'}
      </button>
    </>
  )
}

function formatCoord(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
