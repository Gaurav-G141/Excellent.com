import { useCallback, useEffect, useRef, useState } from 'react'
import type { DemoSlide, ProblemSlide, Viewport } from '../../types/lesson'
import { matchesNumber } from '../../utils/expression'
import { DraggableGraphPoint } from '../graph/DraggableGraphPoint'
import { GraphCanvas, type GraphApi } from '../graph/GraphCanvas'
import { CorrectFlash } from '../lesson/CorrectFlash'
import { FeedbackPopup } from '../lesson/FeedbackPopup'
import { useTween } from '../../hooks/useTween'
import { clientToSvg } from '../../utils/svgCoords'
import './Lesson4.css'

export type ExpLnVariant = 'exp' | 'ln'

export interface ExponentialTriangleConfig {
  variant: ExpLnVariant
  viewport: Viewport
  initialX: number
  tolerance?: number
}

interface Pt {
  x: number
  y: number
}

// ----- pure helpers (shared + unit tested) -------------------------------

/** f(x): eˣ for 'exp', ln x for 'ln' (NaN when x ≤ 0 so the curve breaks). */
export function evalForVariant(variant: ExpLnVariant, x: number): number {
  if (variant === 'exp') return Math.exp(x)
  return x > 0 ? Math.log(x) : Number.NaN
}

/** f′(x): eˣ for 'exp' (slope equals the value), 1/x for 'ln'. */
export function trueSlope(variant: ExpLnVariant, x: number): number {
  if (variant === 'exp') return Math.exp(x)
  return 1 / x
}

/**
 * The axis intercept of the tangent line at the point (the triangle's third
 * vertex). For eˣ the tangent meets the x-axis at x − 1; for ln x it meets the
 * y-axis at (ln x) − 1.
 */
export function correctIntercept(variant: ExpLnVariant, x: number): number {
  if (variant === 'exp') return x - 1
  return evalForVariant('ln', x) - 1
}

/**
 * Slope represented by the triangle whose third vertex sits at intercept `c`.
 *  exp: rise = y (vertical leg), run = x − c  → slope = y / (x − c)
 *  ln:  run = x (horizontal leg), rise = y − c → slope = (y − c) / x
 */
export function constructedSlope(variant: ExpLnVariant, x: number, c: number): number {
  const y = evalForVariant(variant, x)
  if (variant === 'exp') {
    const run = x - c
    return run === 0 ? Number.POSITIVE_INFINITY : y / run
  }
  return x === 0 ? Number.POSITIVE_INFINITY : (y - c) / x
}

/** Human label for f(x). */
function functionLabel(variant: ExpLnVariant): string {
  return variant === 'exp' ? 'e\u02e3' : 'ln x'
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function midScreen(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Keep the dragged point inside the plot (and its triangle on-screen). */
function clampX(variant: ExpLnVariant, viewport: Viewport, x: number): number {
  if (variant === 'exp') {
    // x − 1 must stay inside, and the point height eˣ must fit vertically.
    const lo = viewport.xMin + 1.1
    const yCap = Math.log(Math.max(viewport.yMax - 0.3, 1))
    const hi = Math.min(viewport.xMax - 0.2, Number.isFinite(yCap) ? yCap : viewport.xMax - 0.2)
    return Math.max(lo, Math.min(hi, x))
  }
  const lo = Math.max(viewport.xMin + 0.2, 0.2)
  const hi = viewport.xMax - 0.2
  return Math.max(lo, Math.min(hi, x))
}

/** Allowed range for the draggable intercept (kept just inside the plot). */
function interceptBounds(variant: ExpLnVariant, viewport: Viewport, x: number): [number, number] {
  if (variant === 'exp') {
    // Slide along the x-axis, strictly left of the point so run > 0.
    return [viewport.xMin + 0.2, x - 0.2]
  }
  // Slide along the y-axis, strictly below the point so rise > 0.
  const y = evalForVariant('ln', x)
  return [viewport.yMin + 0.2, (Number.isFinite(y) ? y : viewport.yMax) - 0.2]
}

function clampIntercept(variant: ExpLnVariant, viewport: Viewport, x: number, c: number): number {
  const [lo, hi] = interceptBounds(variant, viewport, x)
  if (!Number.isFinite(c)) return lo
  return Math.max(lo, Math.min(hi, c))
}

// ----- shared render pieces ----------------------------------------------

const NOT_FINITE = (): number => Number.NaN

/**
 * The slope triangle with a leg on an axis. For eˣ: vertices (x, y), (x, 0),
 * (c, 0) — a vertical "height" leg (= the rise) and a run leg along the x-axis,
 * so the slope is the height itself. For ln x the triangle is the y-axis mirror:
 * (x, y), (0, y), (0, c).
 */
function TangentTriangle({
  api,
  variant,
  x,
  c,
}: {
  api: GraphApi
  variant: ExpLnVariant
  x: number
  c: number
}) {
  const y = evalForVariant(variant, x)
  if (!Number.isFinite(y)) return null

  const P = api.toScreen(x, y)
  let B: Pt
  let C: Pt
  let runLabel: string
  let riseLabel: string
  let runMid: Pt
  let riseMid: Pt

  if (variant === 'exp') {
    B = api.toScreen(x, 0)
    C = api.toScreen(c, 0)
    runLabel = `run = ${fmt(x - c)}`
    riseLabel = `height = ${fmt(y)}`
    runMid = { x: midScreen(B, C).x, y: B.y + 14 }
    riseMid = { x: P.x - 6, y: midScreen(P, B).y }
  } else {
    B = api.toScreen(0, y)
    C = api.toScreen(0, c)
    runLabel = `run = ${fmt(x)}`
    riseLabel = `rise = ${fmt(y - c)}`
    runMid = { x: midScreen(P, B).x, y: P.y - 8 }
    riseMid = { x: C.x - 6, y: midScreen(B, C).y }
  }

  return (
    <g className="exp-triangle">
      <polygon
        points={`${P.x},${P.y} ${B.x},${B.y} ${C.x},${C.y}`}
        className="exp-tri-fill"
      />
      {/* hypotenuse along the tangent line */}
      <line x1={C.x} y1={C.y} x2={P.x} y2={P.y} className="exp-hyp" />
      {/* run leg */}
      <line
        x1={variant === 'exp' ? B.x : P.x}
        y1={variant === 'exp' ? B.y : P.y}
        x2={variant === 'exp' ? C.x : B.x}
        y2={variant === 'exp' ? C.y : B.y}
        className="exp-run-leg"
      />
      <text x={runMid.x} y={runMid.y} className="exp-leg-label">
        {runLabel}
      </text>
      {/* rise / height leg */}
      <line
        x1={variant === 'exp' ? P.x : B.x}
        y1={variant === 'exp' ? P.y : B.y}
        x2={variant === 'exp' ? B.x : C.x}
        y2={variant === 'exp' ? B.y : C.y}
        className="exp-rise-leg"
      />
      <text x={riseMid.x} y={riseMid.y} className="exp-leg-label exp-leg-label--rise">
        {riseLabel}
      </text>
      <circle cx={P.x} cy={P.y} r={5} className="exp-anchor-dot" />
    </g>
  )
}

const ANIM_S_LO = -1

/** Sampled reflection morph of eˣ across y = x toward ln x, at progress t∈[0,1]. */
function morphPath(api: GraphApi, viewport: Viewport, t: number): string {
  const N = 80
  const sHi = Math.log(Math.max(viewport.xMax - 0.2, 1.2))
  const segments: string[] = []
  let pen = false
  for (let i = 0; i < N; i++) {
    const s = ANIM_S_LO + (i / (N - 1)) * (sHi - ANIM_S_LO)
    const es = Math.exp(s)
    const dx = (1 - t) * s + t * es
    const dy = (1 - t) * es + t * s
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      pen = false
      continue
    }
    const sp = api.toScreen(dx, dy)
    segments.push(`${pen ? 'L' : 'M'} ${sp.x.toFixed(2)} ${sp.y.toFixed(2)}`)
    pen = true
  }
  return segments.join(' ')
}

/**
 * The eˣ slope triangle reflected across y = x at progress t. At t = 0 it is the
 * eˣ triangle (rise = height = A, run = 1); at t = 1 it is the ln triangle
 * (run = A, rise = 1). Lengths are preserved — only orientation flips.
 */
function ReflectTriangle({ api, x0, a, t }: { api: GraphApi; x0: number; a: number; t: number }) {
  const reflect = (p: Pt): Pt => ({ x: (1 - t) * p.x + t * p.y, y: (1 - t) * p.y + t * p.x })
  const P = api.toScreen(...reflectTuple(reflect, { x: x0, y: a }))
  const B = api.toScreen(...reflectTuple(reflect, { x: x0, y: 0 }))
  const C = api.toScreen(...reflectTuple(reflect, { x: x0 - 1, y: 0 }))
  const labels =
    t < 0.5
      ? { pb: `height = ${fmt(a)}`, bc: 'run = 1' }
      : { pb: `run = ${fmt(a)}`, bc: 'rise = 1' }
  const pbMid = midScreen(P, B)
  const bcMid = midScreen(B, C)

  return (
    <g className="exp-triangle">
      <polygon points={`${P.x},${P.y} ${B.x},${B.y} ${C.x},${C.y}`} className="exp-tri-fill" />
      <line x1={C.x} y1={C.y} x2={P.x} y2={P.y} className="exp-hyp" />
      <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} className="exp-rise-leg" />
      <text x={pbMid.x + 6} y={pbMid.y} className="exp-leg-label exp-leg-label--rise">
        {labels.pb}
      </text>
      <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} className="exp-run-leg" />
      <text x={bcMid.x} y={bcMid.y - 6} className="exp-leg-label">
        {labels.bc}
      </text>
      <circle cx={P.x} cy={P.y} r={5} className="exp-anchor-dot" />
    </g>
  )
}

function reflectTuple(reflect: (p: Pt) => Pt, p: Pt): [number, number] {
  const r = reflect(p)
  return [r.x, r.y]
}

/**
 * Drag handle for the tangent's axis intercept (the triangle's third vertex).
 * For eˣ it slides along the x-axis; for ln x along the y-axis.
 */
function DraggableIntercept({
  api,
  variant,
  viewport,
  x,
  c,
  disabled,
  svgRef,
  onChange,
}: {
  api: GraphApi
  variant: ExpLnVariant
  viewport: Viewport
  x: number
  c: number
  disabled: boolean
  svgRef: React.RefObject<SVGSVGElement | null>
  onChange: (c: number) => void
}) {
  const hitRef = useRef<SVGCircleElement>(null)
  const activePointer = useRef<number | null>(null)
  const [lo, hi] = interceptBounds(variant, viewport, x)

  useEffect(() => {
    const node = hitRef.current
    return () => {
      if (node && activePointer.current != null) {
        try {
          node.releasePointerCapture(activePointer.current)
        } catch {
          /* capture already gone */
        }
      }
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGCircleElement>) => {
      if (disabled) return
      e.currentTarget.setPointerCapture(e.pointerId)
      activePointer.current = e.pointerId
    },
    [disabled],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGCircleElement>) => {
      if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return
      const svg = svgRef.current
      if (!svg) return
      const { x: sx, y: sy } = clientToSvg(svg, e.clientX, e.clientY)
      const data = api.screenToData(sx, sy)
      onChange(variant === 'exp' ? data.x : data.y)
    },
    [api, disabled, onChange, svgRef, variant],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGCircleElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    activePointer.current = null
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGCircleElement>) => {
      if (disabled) return
      const span = variant === 'exp' ? viewport.xMax - viewport.xMin : viewport.yMax - viewport.yMin
      const step = span / 50
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault()
        onChange(c - step)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault()
        onChange(c + step)
      }
    },
    [c, disabled, onChange, variant, viewport.xMax, viewport.xMin, viewport.yMax, viewport.yMin],
  )

  const screen = variant === 'exp' ? api.toScreen(c, 0) : api.toScreen(0, c)
  const axisWord = variant === 'exp' ? 'x' : 'y'

  return (
    <g className="graph-draggable-point">
      <circle
        ref={hitRef}
        cx={screen.x}
        cy={screen.y}
        r={14}
        className="graph-draggable-point-hit"
        style={{
          cursor: disabled ? 'default' : variant === 'exp' ? 'ew-resize' : 'ns-resize',
          touchAction: 'none',
        }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Drag the tangent's ${axisWord}-intercept to build the slope triangle`}
        aria-valuemin={Number(lo.toFixed(2))}
        aria-valuemax={Number(hi.toFixed(2))}
        aria-valuenow={Number(c.toFixed(2))}
        aria-disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      />
      <circle cx={screen.x} cy={screen.y} r={6} className="graph-draggable-point-dot" />
    </g>
  )
}

// ----- demo slide ---------------------------------------------------------

interface DemoProps {
  slide: DemoSlide
  onContinue: () => void
}

export function ExponentialTriangleSlide({ slide, onContinue }: DemoProps) {
  const config = slide.config as unknown as ExponentialTriangleConfig
  const { variant, viewport, initialX } = config

  if (variant === 'ln') {
    return <LnReflectionDemo slide={slide} onContinue={onContinue} viewport={viewport} a={initialX} />
  }

  return <ExpTriangleDemo slide={slide} onContinue={onContinue} viewport={viewport} initialX={initialX} />
}

/** eˣ demo: draggable point, slope triangle with a leg on the x-axis. */
function ExpTriangleDemo({
  slide,
  onContinue,
  viewport,
  initialX,
}: {
  slide: DemoSlide
  onContinue: () => void
  viewport: Viewport
  initialX: number
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [x, setX] = useState(() => clampX('exp', viewport, initialX))

  const fn = useCallback((v: number) => evalForVariant('exp', v), [])
  const dfn = useCallback((v: number) => trueSlope('exp', v), [])

  const y = evalForVariant('exp', x)
  const slope = trueSlope('exp', x)

  function handleDrag(_id: string, nextX: number) {
    setX(clampX('exp', viewport, nextX))
  }

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <GraphCanvas
        ref={svgRef}
        viewport={viewport}
        evaluate={fn}
        derivative={dfn}
        unitGrid
        showAxisLabels
        squareUnits
      >
        {(api) => (
          <>
            <TangentTriangle api={api} variant="exp" x={x} c={correctIntercept('exp', x)} />
            <DraggableGraphPoint id="P" x={x} api={api} svgRef={svgRef} onDrag={handleDrag} />
          </>
        )}
      </GraphCanvas>

      <div className="slide-copy">
        <p className="slide-hint slide-hint--active">
          slope = f&prime;({fmt(x)}) = e&#x02e3; = <strong>{fmt(slope)}</strong> — the same as the
          point&rsquo;s height ({fmt(y)}). The tangent crosses the x-axis one unit to the left.
        </p>
      </div>

      <div className="lesson2-actions">
        <button type="button" className="slide-cta" onClick={onContinue}>
          {slide.ctaLabel ?? 'Continue'}
        </button>
      </div>
    </>
  )
}

/** ln demo: starts on eˣ, reflects across y = x so the triangle flips to ln x. */
function LnReflectionDemo({
  slide,
  onContinue,
  viewport,
  a,
}: {
  slide: DemoSlide
  onContinue: () => void
  viewport: Viewport
  a: number
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  // The ln anchor point sits at x = a; the matching eˣ point is at x0 = ln a.
  const x0 = Math.log(a)
  const [phase, setPhase] = useState<'exp' | 'anim' | 'ln'>('exp')
  const [reflectT, setReflectT] = useState(0)

  const tween = useTween(
    1200,
    (t) => setReflectT(t),
    () => {
      setReflectT(1)
      setPhase('ln')
    },
  )

  const expFn = useCallback((v: number) => evalForVariant('exp', v), [])
  const lnFn = useCallback((v: number) => evalForVariant('ln', v), [])
  const lnD = useCallback((v: number) => trueSlope('ln', v), [])

  const evaluate = phase === 'exp' ? expFn : phase === 'ln' ? lnFn : NOT_FINITE
  const derivative = phase === 'ln' ? lnD : undefined

  function startReflect() {
    setPhase('anim')
    tween.play()
  }

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <GraphCanvas
        ref={svgRef}
        viewport={viewport}
        evaluate={evaluate}
        derivative={derivative}
        unitGrid
        showAxisLabels
      >
        {(api) => {
          if (phase === 'exp') {
            return <TangentTriangle api={api} variant="exp" x={x0} c={correctIntercept('exp', x0)} />
          }
          if (phase === 'ln') {
            return <TangentTriangle api={api} variant="ln" x={a} c={correctIntercept('ln', a)} />
          }
          // animating: mirror line + morphing curve + morphing triangle.
          const lo = api.toScreen(viewport.xMin, viewport.xMin)
          const hi = api.toScreen(viewport.xMax, viewport.xMax)
          return (
            <>
              <line x1={lo.x} y1={lo.y} x2={hi.x} y2={hi.y} className="exp-mirror-line" />
              <path d={morphPath(api, viewport, reflectT)} className="exp-morph-curve" fill="none" />
              <ReflectTriangle api={api} x0={x0} a={a} t={reflectT} />
            </>
          )
        }}
      </GraphCanvas>

      <div className="slide-copy">
        {phase === 'ln' ? (
          <p className="slide-hint slide-hint--active">
            Reflected across y = x: now y = ln x. The triangle flipped too — rise = 1 and run = the
            x-value ({fmt(a)}), so the slope is 1/x = <strong>{fmt(trueSlope('ln', a))}</strong>.
          </p>
        ) : (
          <p className="slide-hint">
            Here is y = e&#x02e3; with its slope triangle (run 1, rise = height). Reflect it across
            y = x to turn it into y = ln x.
          </p>
        )}
      </div>

      <div className="lesson2-actions">
        <button
          type="button"
          className="slide-secondary-cta"
          disabled={phase !== 'exp'}
          onClick={startReflect}
        >
          Reflect e&#x02e3; across y=x
        </button>
        <button type="button" className="slide-cta" onClick={onContinue}>
          {slide.ctaLabel ?? 'Continue'}
        </button>
      </div>
    </>
  )
}

// ----- problem slide ------------------------------------------------------

interface ProblemProps {
  slide: ProblemSlide
  onCorrect: () => void
}

export function ExponentialTriangleQuestionSlide({ slide, onCorrect }: ProblemProps) {
  const config = slide.config as unknown as ExponentialTriangleConfig
  const { variant, viewport, initialX, tolerance } = config

  const svgRef = useRef<SVGSVGElement>(null)
  const x = clampX(variant, viewport, initialX)
  const expected = trueSlope(variant, x)
  const tol = tolerance ?? 0.05
  const target = correctIntercept(variant, x)

  const fn = useCallback((v: number) => evalForVariant(variant, v), [variant])
  const dfn = useCallback((v: number) => trueSlope(variant, v), [variant])

  // The student builds the triangle by dragging the intercept. Start away from
  // the correct intercept so there is something to construct.
  const [c, setC] = useState(() => clampIntercept(variant, viewport, x, target - 1))
  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(false)
  const [flash, setFlash] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)

  const built = constructedSlope(variant, x, c)
  const builtRun = variant === 'exp' ? x - c : x
  const builtRise = variant === 'exp' ? evalForVariant('exp', x) : evalForVariant('ln', x) - c

  function handleInterceptChange(next: number) {
    if (solved) return
    setC(clampIntercept(variant, viewport, x, next))
  }

  function rejectWrong() {
    setWrong(slide.feedback.wrong || 'Not quite — adjust your triangle (or typed slope) and try again.')
  }

  function markCorrect() {
    setSolved(true)
    setFlash(true)
    setWrong(null)
    setC(clampIntercept(variant, viewport, x, target))
  }

  function handleCheck() {
    if (solved) return
    const typedOk = answer.trim() !== '' && matchesNumber(answer, expected, tol)
    const builtOk = Number.isFinite(built) && Math.abs(built - expected) <= tol
    if (typedOk || builtOk) {
      markCorrect()
    } else {
      rejectWrong()
    }
  }

  return (
    <>
      <CorrectFlash active={flash}>
        <div className="slide-copy">
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>

        <div className="exp-given">
          <span>
            f(x) = <strong>{functionLabel(variant)}</strong>
          </span>
          <span>
            x = <strong>{fmt(x)}</strong>
          </span>
        </div>

        <GraphCanvas
          ref={svgRef}
          viewport={viewport}
          evaluate={fn}
          derivative={dfn}
          unitGrid
          showAxisLabels
          squareUnits={variant === 'exp'}
        >
          {(api) => (
            <>
              <TangentTriangle api={api} variant={variant} x={x} c={c} />
              <DraggableIntercept
                api={api}
                variant={variant}
                viewport={viewport}
                x={x}
                c={c}
                disabled={solved}
                svgRef={svgRef}
                onChange={handleInterceptChange}
              />
            </>
          )}
        </GraphCanvas>

        <p className="slide-hint slide-hint--active" data-testid="constructed-readout">
          Your triangle: run = <strong>{fmt(builtRun)}</strong> · rise = <strong>{fmt(builtRise)}</strong>{' '}
          · slope = <strong>{fmt(built)}</strong>
        </p>

        {!solved ? (
          <div className="slide-slope-input">
            <label htmlFor="exp-slope-input">
              Drag the intercept to build the triangle, or type the slope (f&prime;({fmt(x)})):
            </label>
            <input
              id="exp-slope-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="enter the slope"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCheck()
              }}
            />
            <button type="button" className="slide-cta" onClick={handleCheck}>
              Check
            </button>
          </div>
        ) : (
          <button type="button" className="slide-cta" onClick={onCorrect}>
            Continue
          </button>
        )}
      </CorrectFlash>

      {wrong && (
        <FeedbackPopup message={wrong} correct={false} onDismiss={() => setWrong(null)} />
      )}
    </>
  )
}
