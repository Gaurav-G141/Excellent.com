import { useMemo, useState } from 'react'
import type { DemoSlide, MotionVectorsConfig } from '../../types/lesson'
import { useTween } from '../../hooks/useTween'
import {
  derivativeCoefficients,
  evaluatePoly,
  secondDerivativeCoefficients,
} from '../../utils/polynomial'
import './Lesson3.css'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

const W = 320
const H = 240
const PAD = 24

function VectorArrow({
  x1,
  y1,
  x2,
  y2,
  variant,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  variant: 'velocity' | 'acceleration'
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const headLen = 9
  const spread = Math.PI / 7
  const hx1 = x2 - headLen * Math.cos(angle - spread)
  const hy1 = y2 - headLen * Math.sin(angle - spread)
  const hx2 = x2 - headLen * Math.cos(angle + spread)
  const hy2 = y2 - headLen * Math.sin(angle + spread)
  return (
    <g className={`mv-vec mv-vec--${variant}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="mv-vec-line" />
      <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} className="mv-vec-head" />
    </g>
  )
}

export function MotionVectorsSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as MotionVectorsConfig
  const {
    xCoefficients,
    yCoefficients,
    tMax,
    viewport,
    velocityScale = 0.5,
    accelerationScale = 0.5,
    durationMs = 4200,
  } = config

  const [t, setT] = useState(0)
  const { play, stop, playing } = useTween(durationMs, (progress) => setT(progress * tMax))

  const vx = useMemo(() => derivativeCoefficients(xCoefficients), [xCoefficients])
  const vy = useMemo(() => derivativeCoefficients(yCoefficients), [yCoefficients])
  const ax = useMemo(() => secondDerivativeCoefficients(xCoefficients), [xCoefficients])
  const ay = useMemo(() => secondDerivativeCoefficients(yCoefficients), [yCoefficients])

  const ppuX = (W - 2 * PAD) / (viewport.xMax - viewport.xMin)
  const ppuY = (H - 2 * PAD) / (viewport.yMax - viewport.yMin)

  const toScreen = (dx: number, dy: number) => ({
    x: PAD + (dx - viewport.xMin) * ppuX,
    y: H - PAD - (dy - viewport.yMin) * ppuY,
  })

  const pathD = useMemo(() => {
    const samples = 90
    return Array.from({ length: samples + 1 }, (_, i) => {
      const tt = (tMax * i) / samples
      const p = toScreen(evaluatePoly(xCoefficients, tt), evaluatePoly(yCoefficients, tt))
      return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    }).join(' ')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xCoefficients, yCoefficients, tMax, viewport])

  const bug = toScreen(evaluatePoly(xCoefficients, t), evaluatePoly(yCoefficients, t))
  const velEnd = {
    x: bug.x + evaluatePoly(vx, t) * ppuX * velocityScale,
    y: bug.y - evaluatePoly(vy, t) * ppuY * velocityScale,
  }
  const accEnd = {
    x: bug.x + evaluatePoly(ax, t) * ppuX * accelerationScale,
    y: bug.y - evaluatePoly(ay, t) * ppuY * accelerationScale,
  }

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <svg
        className="mv-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="A bug moving along a curved path with velocity and acceleration vectors"
      >
        <path d={pathD} className="mv-path" fill="none" />
        <VectorArrow x1={bug.x} y1={bug.y} x2={velEnd.x} y2={velEnd.y} variant="velocity" />
        <VectorArrow x1={bug.x} y1={bug.y} x2={accEnd.x} y2={accEnd.y} variant="acceleration" />
        <circle cx={bug.x} cy={bug.y} r={6} className="mv-bug" />
      </svg>

      <div className="mv-legend">
        <span className="mv-legend-item mv-legend-item--velocity">velocity = s′(t)</span>
        <span className="mv-legend-item mv-legend-item--acceleration">
          acceleration = s″(t)
        </span>
      </div>

      <div className="slide-scrubber">
        <label htmlFor="mv-scrub">time t = {t.toFixed(2)}</label>
        <input
          id="mv-scrub"
          type="range"
          min={0}
          max={tMax}
          step={0.02}
          value={t}
          onChange={(e) => {
            stop()
            setT(Number(e.target.value))
          }}
        />
      </div>

      <div className="lesson3-actions">
        <button
          type="button"
          className="slide-secondary-cta"
          onClick={() => {
            setT(0)
            play()
          }}
        >
          {playing ? 'Playing…' : 'Play'}
        </button>
        <button type="button" className="slide-cta" onClick={onContinue}>
          {slide.ctaLabel ?? 'Continue'}
        </button>
      </div>
    </>
  )
}
