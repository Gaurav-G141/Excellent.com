import { useState } from 'react'
import type { DemoSlide, ExpandingCircleConfig } from '../../types/lesson'
import { useTween } from '../../hooks/useTween'
import './Lesson3.css'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

const SIZE = 240
const CENTER = SIZE / 2
const MARGIN = 18

export function ExpandingCircleSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as ExpandingCircleConfig
  const { minR, maxR, dr, initialR, unit = 'cm' } = config

  const [r, setR] = useState(initialR)
  const span = maxR - minR
  const { play, stop } = useTween(1500, (t) => {
    const eased = 1 - (1 - t) * (1 - t)
    setR(minR + span * eased)
  })

  const scale = (CENTER - MARGIN) / (maxR + dr)

  const area = Math.PI * r * r
  const circumference = 2 * Math.PI * r
  const dA = 2 * Math.PI * r * dr

  const innerR = r * scale
  const bandR = (r + dr / 2) * scale

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <svg
        className="rr-circle-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="A circle whose radius grows, with the added rim highlighted"
      >
        <circle cx={CENTER} cy={CENTER} r={innerR} className="rr-circle-fill" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={bandR}
          className="rr-circle-band"
          strokeWidth={dr * scale}
        />
        <line
          x1={CENTER}
          y1={CENTER}
          x2={CENTER + innerR}
          y2={CENTER}
          className="rr-circle-radius"
        />
        <text x={CENTER + innerR / 2} y={CENTER - 7} className="rr-circle-r-label">
          r
        </text>
      </svg>

      <div className="slide-scrubber">
        <label htmlFor="rr-radius">
          radius r = {r.toFixed(2)} {unit}
        </label>
        <input
          id="rr-radius"
          type="range"
          min={minR}
          max={maxR}
          step={0.05}
          value={r}
          onChange={(e) => {
            stop()
            setR(Number(e.target.value))
          }}
        />
      </div>

      <div className="rr-readouts">
        <span>
          A = πr² = {area.toFixed(1)} {unit}²
        </span>
        <span>
          C = 2πr = {circumference.toFixed(1)} {unit}
        </span>
        <span className="rr-readout-accent">
          dA = {dA.toFixed(1)} {unit}²
        </span>
      </div>

      <div className="rr-formula">
        <span className="rr-formula-main">dA = 2πr · dr</span>
        <span className="rr-formula-sub">
          the added rim is the circumference 2πr times its width dr, so dA/dr = 2πr
        </span>
      </div>

      <div className="lesson3-actions">
        <button
          type="button"
          className="slide-secondary-cta"
          onClick={() => {
            setR(minR)
            play()
          }}
        >
          Grow it
        </button>
        <button type="button" className="slide-cta" onClick={onContinue}>
          {slide.ctaLabel ?? 'Continue'}
        </button>
      </div>
    </>
  )
}
