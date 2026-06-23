import { useRef, useState } from 'react'
import type { DemoSlide, DraggableSecantConfig } from '../../types/lesson'
import { DraggableGraphPoint } from '../graph/DraggableGraphPoint'
import { GraphCanvas, TangentIndicator } from '../graph/GraphCanvas'
import { SecantLine } from '../graph/SecantLine'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

export function DraggableSecantSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as DraggableSecantConfig
  const { coefficients, viewport, initialPoints, coincidentThreshold } = config
  const svgRef = useRef<SVGSVGElement>(null)

  const [points, setPoints] = useState(() =>
    Object.fromEntries(initialPoints.map((p) => [p.id, p.x])),
  )

  function handleDrag(id: string, x: number) {
    setPoints((prev) => ({ ...prev, [id]: x }))
  }

  const xA = points[initialPoints[0].id]
  const xB = points[initialPoints[1].id]
  const coincident = Math.abs(xA - xB) < coincidentThreshold

  return (
    <>
      <GraphCanvas ref={svgRef} coefficients={coefficients} viewport={viewport}>
        {(api) => {
          const segment = api.secantSegment(xA, xB, coincidentThreshold)
          const midX = (xA + xB) / 2
          const midScreen = api.toScreen(midX, api.evaluate(midX))

          return (
            <>
              {coincident ? (
                <TangentIndicator
                  segment={segment}
                  pointX={midScreen.x}
                  pointY={midScreen.y}
                  variant="tangent"
                />
              ) : (
                <SecantLine segment={segment} />
              )}

              {initialPoints.map((p) => (
                <DraggableGraphPoint
                  key={p.id}
                  id={p.id}
                  x={points[p.id]}
                  label={p.id}
                  api={api}
                  svgRef={svgRef}
                  onDrag={handleDrag}
                />
              ))}
            </>
          )
        }}
      </GraphCanvas>

      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
        {coincident && (
          <p className="slide-hint">The points meet — the orange line is the tangent (instantaneous rate of change).</p>
        )}
      </div>

      <button type="button" className="slide-cta" onClick={onContinue}>
        {slide.ctaLabel ?? 'Continue'}
      </button>
    </>
  )
}
