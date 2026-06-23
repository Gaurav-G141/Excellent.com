import { useMemo, useState } from 'react'
import type { DemoSlide, SumRuleConfig } from '../../types/lesson'
import { addPolynomials, derivativeCoefficients, evaluatePoly } from '../../utils/polynomial'
import { GraphCanvas, PLOT, type GraphApi } from '../graph/GraphCanvas'
import './Lesson2.css'

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

const RUN_FRACTION = 0.16
const STRIP_WIDTH = 300
const STRIP_HEIGHT = 140
const BASELINE = 96

function Arrowhead({ x1, y1, x2, y2, className }: { x1: number; y1: number; x2: number; y2: number; className: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const headLen = 7
  const spread = Math.PI / 7
  const ax = x2 - headLen * Math.cos(angle - spread)
  const ay = y2 - headLen * Math.sin(angle - spread)
  const bx = x2 - headLen * Math.cos(angle + spread)
  const by = y2 - headLen * Math.sin(angle + spread)
  return (
    <g className={className}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="sr-arrow-line" />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} className="sr-arrow-head" />
    </g>
  )
}

export function SumRuleSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as SumRuleConfig
  const { coefficientsF, coefficientsG, viewport, initialX } = config

  const sumCoefficients = useMemo(
    () => addPolynomials(coefficientsF, coefficientsG),
    [coefficientsF, coefficientsG],
  )
  const dF = useMemo(() => derivativeCoefficients(coefficientsF), [coefficientsF])
  const dG = useMemo(() => derivativeCoefficients(coefficientsG), [coefficientsG])
  const dSum = useMemo(() => derivativeCoefficients(sumCoefficients), [sumCoefficients])

  const [x, setX] = useState(initialX)

  // Shared pixel scale (identical to the graphs' internal scale).
  const plotH = PLOT.height - PLOT.pad.top - PLOT.pad.bottom
  const pxPerY = plotH / (viewport.yMax - viewport.yMin)
  const runData = (viewport.xMax - viewport.xMin) * RUN_FRACTION

  const slopeF = evaluatePoly(dF, x)
  const slopeG = evaluatePoly(dG, x)
  const slopeSum = evaluatePoly(dSum, x)

  // Screen rise (px) for a slope, using the fixed run and shared scale.
  const rise = (slope: number) => slope * runData * pxPerY

  const graphs: { label: string; coeffs: number[]; slope: number; variant: string }[] = [
    { label: 'f(x)', coeffs: coefficientsF, slope: slopeF, variant: 'f' },
    { label: 'g(x)', coeffs: coefficientsG, slope: slopeG, variant: 'g' },
    { label: '(f + g)(x)', coeffs: sumCoefficients, slope: slopeSum, variant: 'sum' },
  ]

  function SlopeVector({ api, slope, variant }: { api: GraphApi; slope: number; variant: string }) {
    const y = api.evaluate(x)
    const start = api.toScreen(x, y)
    const tip = api.toScreen(x + runData, y + slope * runData)
    return (
      <>
        <circle cx={start.x} cy={start.y} r={4} className="sr-point" />
        <Arrowhead x1={start.x} y1={start.y} x2={tip.x} y2={tip.y} className={`sr-arrow sr-arrow--${variant}`} />
      </>
    )
  }

  const h1 = rise(slopeF)
  const h2 = rise(slopeG)
  const h3 = rise(slopeSum)
  const colA = STRIP_WIDTH * 0.32
  const colB = STRIP_WIDTH * 0.68

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <div className="sr-graphs">
        {graphs.map((g) => (
          <div key={g.label} className="sr-graph">
            <span className="slide-graph-caption">{g.label}</span>
            <GraphCanvas coefficients={g.coeffs} viewport={viewport} className="graph-canvas--compact">
              {(api) => <SlopeVector api={api} slope={g.slope} variant={g.variant} />}
            </GraphCanvas>
          </div>
        ))}
      </div>

      <div className="slide-scrubber">
        <label htmlFor="sum-rule-x">Move the point (x = {x.toFixed(2)})</label>
        <input
          id="sum-rule-x"
          type="range"
          min={viewport.xMin}
          max={viewport.xMax}
          step={0.01}
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
        />
      </div>

      <div className="sr-compare">
        <p className="slide-graph-caption">Slopes add up</p>
        <svg viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`} className="sr-compare-svg" role="img" aria-label="Slope comparison">
          <line x1={16} y1={BASELINE} x2={STRIP_WIDTH - 16} y2={BASELINE} className="sr-baseline" />

          {/* Column A: f' stacked with g' */}
          <Arrowhead x1={colA} y1={BASELINE} x2={colA} y2={BASELINE - h1} className="sr-arrow sr-arrow--f" />
          <Arrowhead x1={colA} y1={BASELINE - h1} x2={colA} y2={BASELINE - h1 - h2} className="sr-arrow sr-arrow--g" />
          <text x={colA} y={STRIP_HEIGHT - 4} className="sr-col-label">f′ + g′</text>

          {/* Column B: (f+g)' */}
          <Arrowhead x1={colB} y1={BASELINE} x2={colB} y2={BASELINE - h3} className="sr-arrow sr-arrow--sum" />
          <text x={colB} y={STRIP_HEIGHT - 4} className="sr-col-label">(f + g)′</text>
        </svg>

        <div className="sr-readout">
          <span className="sr-readout--f">f′(x) = {slopeF.toFixed(2)}</span>
          <span className="sr-readout--g">g′(x) = {slopeG.toFixed(2)}</span>
          <span className="sr-readout--sum">(f + g)′(x) = {slopeSum.toFixed(2)}</span>
        </div>
      </div>

      <button type="button" className="slide-cta" onClick={onContinue}>
        {slide.ctaLabel ?? 'Continue'}
      </button>
    </>
  )
}
