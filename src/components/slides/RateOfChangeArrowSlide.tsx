import { useEffect, useState } from 'react'
import type { DemoSlide, RateOfChangeConfig } from '../../types/lesson'
import { evaluatePoly } from '../../utils/polynomial'
import { GraphCanvas, TangentArrow, TangentIndicator } from '../graph/GraphCanvas'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

export function RateOfChangeArrowSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as RateOfChangeConfig
  const { coefficients, viewport, animation, showScrubSlider } = config

  const [xPos, setXPos] = useState(viewport.xMin)
  const [manual, setManual] = useState(false)

  useEffect(() => {
    if (manual || animation.mode !== 'auto') return

    const start = performance.now()
    let frame: number

    const tick = (now: number) => {
      const t = ((now - start) % animation.durationMs) / animation.durationMs
      setXPos(viewport.xMin + t * (viewport.xMax - viewport.xMin))
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [manual, animation, viewport.xMin, viewport.xMax])

  const clampedX = Math.max(viewport.xMin, Math.min(viewport.xMax, xPos))
  const yPos = evaluatePoly(coefficients, clampedX)

  return (
    <>
      <GraphCanvas coefficients={coefficients} viewport={viewport}>
        {(api) => {
          const screen = api.toScreen(clampedX, yPos)
          const segment = api.clippedTangentSegment(clampedX)
          return (
            <>
              <TangentIndicator segment={segment} variant="tangent" />
              <circle cx={screen.x} cy={screen.y} r={5} className="graph-point-dot" />
              <TangentArrow
                cx={screen.x}
                cy={screen.y}
                angle={segment.angle}
                length={24}
                variant="tangent"
              />
            </>
          )
        }}
      </GraphCanvas>

      {showScrubSlider && (
        <div className="slide-scrubber">
          <label htmlFor="arrow-scrub">Move along the curve</label>
          <input
            id="arrow-scrub"
            type="range"
            min={viewport.xMin}
            max={viewport.xMax}
            step={0.05}
            value={clampedX}
            onChange={(e) => {
              setManual(true)
              setXPos(Number(e.target.value))
            }}
          />
        </div>
      )}

      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <button type="button" className="slide-cta" onClick={onContinue}>
        {slide.ctaLabel ?? 'Continue'}
      </button>
    </>
  )
}
