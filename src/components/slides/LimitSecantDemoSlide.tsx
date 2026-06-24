import { useState } from 'react'
import type { DemoSlide, LimitSecantDemoConfig } from '../../types/lesson'
import { useTween } from '../../hooks/useTween'
import { easeOutQuint } from '../../utils/easing'
import { GraphCanvas, TangentIndicator } from '../graph/GraphCanvas'
import { SecantLine } from '../graph/SecantLine'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

export function LimitSecantDemoSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as LimitSecantDemoConfig
  const { coefficients, viewport, coincidentThreshold, animationDurationMs, initialAnchorX } =
    config

  const sliderMin = viewport.xMin + 0.4
  const sliderMax = viewport.xMax - 0.4
  const defaultAnchor = initialAnchorX ?? 2

  const [anchorX, setAnchorX] = useState(() =>
    Math.max(sliderMin, Math.min(sliderMax, defaultAnchor)),
  )
  const [movingX, setMovingX] = useState<number | null>(null)
  const [animationDone, setAnimationDone] = useState(false)

  const startX = viewport.xMax - 0.05
  const { play, playing: animating } = useTween(
    animationDurationMs,
    (t) => setMovingX(startX + (anchorX - startX) * easeOutQuint(t)),
    () => setAnimationDone(true),
  )

  // The gap in x between the fixed point a and the moving point (a + h).
  const h = movingX != null ? movingX - anchorX : null

  function runAnimation() {
    setMovingX(startX)
    setAnimationDone(false)
    play()
  }

  function handleAnchorChange(x: number) {
    setAnchorX(x)
    setMovingX(null)
    setAnimationDone(false)
  }

  return (
    <>
      <GraphCanvas coefficients={coefficients} viewport={viewport}>
        {(api) => {
          const anchorY = api.evaluate(anchorX)
          const anchorScreen = api.toScreen(anchorX, anchorY)

          return (
            <>
              <circle cx={anchorScreen.x} cy={anchorScreen.y} r={6} className="graph-target-dot" />
              <text x={anchorScreen.x} y={anchorScreen.y - 16} className="graph-target-label">
                a = {formatCoord(anchorX)}
              </text>

              {movingX != null &&
                (() => {
                  const coincident = Math.abs(movingX - anchorX) < coincidentThreshold
                  const segment = api.secantSegment(anchorX, movingX, coincidentThreshold)
                  const movingY = api.evaluate(movingX)
                  const movingScreen = api.toScreen(movingX, movingY)

                  return (
                    <>
                      {coincident ? (
                        <TangentIndicator
                          segment={segment}
                          pointX={anchorScreen.x}
                          pointY={anchorScreen.y}
                          variant="tangent"
                        />
                      ) : (
                        <SecantLine segment={segment} />
                      )}
                      <circle
                        cx={movingScreen.x}
                        cy={movingScreen.y}
                        r={5}
                        className="graph-moving-dot"
                      />
                    </>
                  )
                })()}
            </>
          )
        }}
      </GraphCanvas>

      <div className="slide-scrubber">
        <label htmlFor="anchor-scrub">Choose point a on the curve</label>
        <input
          id="anchor-scrub"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={0.05}
          value={anchorX}
          disabled={animating}
          onChange={(e) => handleAnchorChange(Number(e.target.value))}
        />
      </div>

      <div className="slide-limit-formula" aria-label="Limit definition of the derivative">
        <p className="slide-limit-formula-label">Limit definition</p>
        <div className="slide-limit-formula-body">
          <span className="slide-limit-formula-lhs">f&prime;(a)</span>
          <span className="slide-limit-formula-eq">=</span>
          <span className="slide-limit-formula-limit">
            <span className="slide-limit-formula-limit-text">lim</span>
            <span className="slide-limit-formula-limit-sub">h&rarr;0</span>
          </span>
          <span className="slide-limit-formula-frac">
            <span className="slide-limit-formula-num">f(a + h) &minus; f(a)</span>
            <span className="slide-limit-formula-bar" />
            <span className="slide-limit-formula-den">h</span>
          </span>
        </div>
        {h != null && (
          <p className="slide-limit-h" aria-live="polite">
            h = {h.toFixed(2)}
          </p>
        )}
      </div>

      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
        {animationDone && (
          <p className="slide-hint">
            The secant slope approaches f&prime;(a) as the second point reaches <em>a</em>.
          </p>
        )}
      </div>

      <div className="slide-actions">
        <button
          type="button"
          className="slide-secondary-cta"
          disabled={animating}
          onClick={runAnimation}
        >
          {animating ? 'Playing…' : animationDone ? 'Replay' : 'Play'}
        </button>
        <button type="button" className="slide-cta" onClick={onContinue}>
          {slide.ctaLabel ?? 'Continue'}
        </button>
      </div>
    </>
  )
}

function formatCoord(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
