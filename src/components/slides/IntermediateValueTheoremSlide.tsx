import { useMemo, useRef, useState } from 'react'
import type { DemoSlide, IntermediateValueTheoremConfig } from '../../types/lesson'
import { evaluatePoly, findWhereEquals } from '../../utils/polynomial'
import { DraggableGraphPoint } from '../graph/DraggableGraphPoint'
import { GraphCanvas } from '../graph/GraphCanvas'
import './Lesson3.css'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

export function IntermediateValueTheoremSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as IntermediateValueTheoremConfig
  const { coefficients, viewport, initialAx, initialBx } = config

  const svgRef = useRef<SVGSVGElement>(null)
  const [ax, setAx] = useState(initialAx)
  const [bx, setBx] = useState(initialBx)
  const [kInput, setKInput] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lo = Math.min(ax, bx)
  const hi = Math.max(ax, bx)
  const fa = useMemo(() => evaluatePoly(coefficients, lo), [coefficients, lo])
  const fb = useMemo(() => evaluatePoly(coefficients, hi), [coefficients, hi])
  const kMin = Math.min(fa, fb)
  const kMax = Math.max(fa, fb)

  const k = Number.parseFloat(kInput)
  const cValue =
    revealed && !Number.isNaN(k) ? findWhereEquals(coefficients, k, lo, hi) : null

  function handleDrag(id: string, x: number) {
    const clamped = Math.max(viewport.xMin + 0.1, Math.min(viewport.xMax - 0.1, x))
    if (id === 'A') setAx(clamped)
    else setBx(clamped)
    setRevealed(false)
  }

  function handleReveal() {
    const value = Number.parseFloat(kInput)
    if (Number.isNaN(value)) {
      setError('Enter a number for the target value.')
      return
    }
    if (value <= kMin || value >= kMax) {
      setError(
        `Pick a value strictly between f(a) = ${fa.toFixed(2)} and f(b) = ${fb.toFixed(2)}.`,
      )
      return
    }
    setError(null)
    setRevealed(true)
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
          const lineY = api.toScreen(lo, k).y
          const cScreen =
            cValue != null
              ? api.toScreen(cValue, evaluatePoly(coefficients, cValue))
              : null
          return (
            <>
              {revealed && !Number.isNaN(k) && (
                <line
                  x1={api.plotBounds.left}
                  y1={lineY}
                  x2={api.plotBounds.right}
                  y2={lineY}
                  className="ivt-target-line"
                />
              )}
              {cScreen && (
                <>
                  <circle cx={cScreen.x} cy={cScreen.y} r={6} className="ivt-c-dot" />
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

      <div className="ivt-readout">
        <span>f(a) = {fa.toFixed(2)}</span>
        <span>f(b) = {fb.toFixed(2)}</span>
      </div>

      <div className="slide-slope-input">
        <label htmlFor="ivt-k">
          Target value k (between {kMin.toFixed(2)} and {kMax.toFixed(2)})
        </label>
        <input
          id="ivt-k"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder="enter a value"
          value={kInput}
          onChange={(e) => {
            setKInput(e.target.value)
            setRevealed(false)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleReveal()
          }}
        />
      </div>

      {error && <p className="ivt-error">{error}</p>}
      {revealed && cValue != null && (
        <p className="slide-hint slide-hint--active">
          A continuous curve must hit y = {k} somewhere between A and B — here at c ={' '}
          {cValue.toFixed(2)}.
        </p>
      )}

      <div className="lesson3-actions">
        <button type="button" className="slide-secondary-cta" onClick={handleReveal}>
          Reveal c
        </button>
        <button type="button" className="slide-cta" onClick={onContinue}>
          {slide.ctaLabel ?? 'Continue'}
        </button>
      </div>
    </>
  )
}
