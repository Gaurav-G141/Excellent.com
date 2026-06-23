import { forwardRef, useId, useMemo, type ReactNode } from 'react'
import type { Viewport } from '../../types/lesson'
import { sampleCurve, evaluatePoly, evaluateDerivative } from '../../utils/polynomial'
import './GraphCanvas.css'

const PAD = { top: 16, right: 16, bottom: 28, left: 36 }
const GRAPH_WIDTH = 320
const GRAPH_HEIGHT = 240

/** Fixed plot geometry, exported so other views can match the graph's pixel scale. */
export const PLOT = { width: GRAPH_WIDTH, height: GRAPH_HEIGHT, pad: PAD }

export interface GraphPoint {
  x: number
  y: number
}

export interface PlotBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export interface ScreenSegment {
  x1: number
  y1: number
  x2: number
  y2: number
  angle: number
}

interface GraphCanvasProps {
  coefficients: number[]
  viewport: Viewport
  children?: (api: GraphApi) => ReactNode
  className?: string
  /** Draw grid lines every 1 unit at integer coordinates. */
  unitGrid?: boolean
  /** Subdivisions between integers (e.g. 0.2 → five thin lines per unit). */
  minorGridStep?: number
  /** Show numeric tick labels on the axes (requires unitGrid). */
  showAxisLabels?: boolean
}

export interface GraphApi {
  width: number
  height: number
  clipId: string
  plotBounds: PlotBounds
  viewport: Viewport
  toScreen: (x: number, y: number) => GraphPoint
  screenToData: (sx: number, sy: number) => GraphPoint
  snapToCurve: (sx: number, sy: number) => GraphPoint
  evaluate: (x: number) => number
  pathD: string
  tangentScreenAngle: (x: number) => number
  /** Tangent line segment clipped to the plot area (screen coordinates). */
  clippedTangentSegment: (x: number) => ScreenSegment
  /** Secant between two x-values, or tangent when |x1-x2| < epsilon. */
  secantSegment: (x1: number, x2: number, epsilon?: number) => ScreenSegment
}

function clipLineThroughPoint(
  cx: number,
  cy: number,
  angle: number,
  plotLeft: number,
  plotRight: number,
  plotTop: number,
  plotBottom: number,
): ScreenSegment {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  const ts: number[] = []
  if (Math.abs(cos) > 1e-9) {
    ts.push((plotLeft - cx) / cos, (plotRight - cx) / cos)
  }
  if (Math.abs(sin) > 1e-9) {
    ts.push((plotTop - cy) / sin, (plotBottom - cy) / sin)
  }

  const inPlot = (t: number) => {
    const px = cx + t * cos
    const py = cy + t * sin
    return px >= plotLeft - 0.5 && px <= plotRight + 0.5 && py >= plotTop - 0.5 && py <= plotBottom + 0.5
  }

  const valid = ts.filter(inPlot)
  const tMin = Math.min(...valid)
  const tMax = Math.max(...valid)

  return {
    x1: cx + tMin * cos,
    y1: cy + tMin * sin,
    x2: cx + tMax * cos,
    y2: cy + tMax * sin,
    angle,
  }
}

export const GraphCanvas = forwardRef<SVGSVGElement, GraphCanvasProps>(function GraphCanvas(
  {
    coefficients,
    viewport,
    children,
    className,
    unitGrid = false,
    minorGridStep = 0.2,
    showAxisLabels = false,
  },
  ref,
) {
  const clipId = useId()
  const width = GRAPH_WIDTH
  const height = GRAPH_HEIGHT

  const api = useMemo(() => {
    const plotW = width - PAD.left - PAD.right
    const plotH = height - PAD.top - PAD.bottom
    const plotLeft = PAD.left
    const plotRight = width - PAD.right
    const plotTop = PAD.top
    const plotBottom = height - PAD.bottom
    const plotBounds: PlotBounds = { left: plotLeft, top: plotTop, right: plotRight, bottom: plotBottom }

    const toScreen = (x: number, y: number): GraphPoint => {
      const sx = PAD.left + ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * plotW
      const sy =
        PAD.top + plotH - ((y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * plotH
      return { x: sx, y: sy }
    }

    const screenToData = (sx: number, sy: number): GraphPoint => {
      const x = viewport.xMin + ((sx - PAD.left) / plotW) * (viewport.xMax - viewport.xMin)
      const y = viewport.yMin + ((plotBottom - sy) / plotH) * (viewport.yMax - viewport.yMin)
      return { x, y }
    }

    const evaluate = (x: number) => evaluatePoly(coefficients, x)

    const snapToCurve = (sx: number, sy: number): GraphPoint => {
      const data = screenToData(sx, sy)
      const x = Math.max(viewport.xMin, Math.min(viewport.xMax, data.x))
      const y = evaluate(x)
      return { x, y }
    }

    const points = sampleCurve(coefficients, viewport.xMin, viewport.xMax)
    const pathD = points
      .map((p, i) => {
        const s = toScreen(p.x, p.y)
        return `${i === 0 ? 'M' : 'L'} ${s.x.toFixed(2)} ${s.y.toFixed(2)}`
      })
      .join(' ')

    const tangentScreenAngle = (x: number) => {
      const y = evaluatePoly(coefficients, x)
      const slope = evaluateDerivative(coefficients, x)
      const step = 0.02
      const p0 = toScreen(x, y)
      const p1 = toScreen(x + step, y + slope * step)
      return Math.atan2(p1.y - p0.y, p1.x - p0.x)
    }

    const clippedTangentSegment = (x: number): ScreenSegment => {
      const y = evaluatePoly(coefficients, x)
      const angle = tangentScreenAngle(x)
      const { x: cx, y: cy } = toScreen(x, y)
      return clipLineThroughPoint(cx, cy, angle, plotLeft, plotRight, plotTop, plotBottom)
    }

    const secantSegment = (x1: number, x2: number, epsilon = 0.08): ScreenSegment => {
      if (Math.abs(x1 - x2) < epsilon) {
        return clippedTangentSegment((x1 + x2) / 2)
      }

      const p1 = toScreen(x1, evaluate(x1))
      const p2 = toScreen(x2, evaluate(x2))
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)
      return clipLineThroughPoint(p1.x, p1.y, angle, plotLeft, plotRight, plotTop, plotBottom)
    }

    return {
      width,
      height,
      clipId,
      plotBounds,
      viewport,
      toScreen,
      screenToData,
      snapToCurve,
      evaluate,
      pathD,
      tangentScreenAngle,
      clippedTangentSegment,
      secantSegment,
    }
  }, [coefficients, viewport, width, height, clipId])

  const plotW = width - PAD.left - PAD.right
  const plotH = height - PAD.top - PAD.bottom
  const xTicks = 5
  const yTicks = 5

  const xMajorValues = unitGrid
    ? integerRange(Math.ceil(viewport.xMin), Math.floor(viewport.xMax))
    : Array.from({ length: xTicks + 1 }, (_, i) =>
        viewport.xMin + (i / xTicks) * (viewport.xMax - viewport.xMin),
      )

  const yMajorValues = unitGrid
    ? integerRange(Math.ceil(viewport.yMin), Math.floor(viewport.yMax))
    : Array.from({ length: yTicks + 1 }, (_, i) =>
        viewport.yMin + (i / yTicks) * (viewport.yMax - viewport.yMin),
      )

  const xMinorValues =
    unitGrid && minorGridStep > 0
      ? minorGridRange(viewport.xMin, viewport.xMax, minorGridStep)
      : []

  const yMinorValues =
    unitGrid && minorGridStep > 0
      ? minorGridRange(viewport.yMin, viewport.yMax, minorGridStep)
      : []

  return (
    <svg
      ref={ref}
      className={`graph-canvas ${className ?? ''}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Function graph"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
        </clipPath>
      </defs>

      {/* minor grid */}
      {xMinorValues.map((x) => {
        const s = api.toScreen(x, viewport.yMin)
        return (
          <line
            key={`gmx-${x}`}
            x1={s.x}
            y1={PAD.top}
            x2={s.x}
            y2={height - PAD.bottom}
            className="graph-grid graph-grid--minor"
          />
        )
      })}
      {yMinorValues.map((y) => {
        const s = api.toScreen(viewport.xMin, y)
        return (
          <line
            key={`gmy-${y}`}
            x1={PAD.left}
            y1={s.y}
            x2={width - PAD.right}
            y2={s.y}
            className="graph-grid graph-grid--minor"
          />
        )
      })}

      {/* major grid */}
      {xMajorValues.map((x) => {
        const s = api.toScreen(x, viewport.yMin)
        return (
          <line
            key={`gx-${x}`}
            x1={s.x}
            y1={PAD.top}
            x2={s.x}
            y2={height - PAD.bottom}
            className="graph-grid graph-grid--major"
          />
        )
      })}
      {yMajorValues.map((y) => {
        const s = api.toScreen(viewport.xMin, y)
        return (
          <line
            key={`gy-${y}`}
            x1={PAD.left}
            y1={s.y}
            x2={width - PAD.right}
            y2={s.y}
            className="graph-grid graph-grid--major"
          />
        )
      })}

      {/* axis labels */}
      {unitGrid &&
        showAxisLabels &&
        xMajorValues.map((x) => {
          const s = api.toScreen(x, viewport.yMin)
          return (
            <text
              key={`xl-${x}`}
              x={s.x}
              y={height - PAD.bottom + 14}
              className="graph-axis-label graph-axis-label--x"
            >
              {formatTick(x)}
            </text>
          )
        })}
      {unitGrid &&
        showAxisLabels &&
        yMajorValues.map((y) => {
          const s = api.toScreen(viewport.xMin, y)
          return (
            <text
              key={`yl-${y}`}
              x={PAD.left - 6}
              y={s.y + 3}
              className="graph-axis-label graph-axis-label--y"
            >
              {formatTick(y)}
            </text>
          )
        })}

      {/* axes */}
      <line
        x1={PAD.left}
        y1={height - PAD.bottom}
        x2={width - PAD.right}
        y2={height - PAD.bottom}
        className="graph-axis"
      />
      <line
        x1={PAD.left}
        y1={PAD.top}
        x2={PAD.left}
        y2={height - PAD.bottom}
        className="graph-axis"
      />

      {/* curve */}
      <path d={api.pathD} className="graph-curve" fill="none" clipPath={`url(#${clipId})`} />

      <g clipPath={`url(#${clipId})`}>{children?.(api)}</g>
    </svg>
  )
})

function integerRange(start: number, end: number): number[] {
  if (end < start) return []
  const values: number[] = []
  for (let v = start; v <= end; v++) values.push(v)
  return values
}

function minorGridRange(min: number, max: number, step: number): number[] {
  const decimals = stepDecimals(step)
  const start = Math.ceil(min / step - 1e-9) * step
  const values: number[] = []

  for (let v = start; v <= max + 1e-9; v += step) {
    const rounded = roundToStep(v, decimals)
    if (rounded < min - 1e-9 || rounded > max + 1e-9) continue
    if (isIntegerGridLine(rounded)) continue
    values.push(rounded)
  }

  return values
}

function stepDecimals(step: number): number {
  if (Number.isInteger(step)) return 0
  return Math.max(0, -Math.floor(Math.log10(step)))
}

function roundToStep(value: number, decimals: number): number {
  return Number(value.toFixed(decimals))
}

function isIntegerGridLine(value: number): boolean {
  return Math.abs(value - Math.round(value)) < 1e-6
}

function formatTick(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/** Dotted tangent line clipped to plot. Optional arrowhead at the curve point. */
export function TangentIndicator({
  segment,
  pointX,
  pointY,
  variant = 'tangent',
  showArrowHead = false,
}: {
  segment: ScreenSegment
  pointX: number
  pointY: number
  variant?: 'default' | 'tangent'
  showArrowHead?: boolean
}) {
  const { x1, y1, x2, y2, angle } = segment
  const headLen = 8
  const headSpread = Math.PI / 7

  return (
    <g className={`graph-tangent graph-tangent--${variant}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="graph-tangent-line" />
      {showArrowHead && (
        <polygon
          points={`${pointX},${pointY} ${pointX - headLen * Math.cos(angle - headSpread)},${pointY - headLen * Math.sin(angle - headSpread)} ${pointX - headLen * Math.cos(angle + headSpread)},${pointY - headLen * Math.sin(angle + headSpread)}`}
          className="graph-tangent-head"
        />
      )}
    </g>
  )
}

export function TangentArrow({
  cx,
  cy,
  angle,
  length = 28,
  variant = 'default',
}: {
  cx: number
  cy: number
  angle: number
  length?: number
  variant?: 'default' | 'tangent'
}) {
  const dx = Math.cos(angle) * length
  const dy = Math.sin(angle) * length
  const tipX = cx + dx
  const tipY = cy + dy
  const headLen = 8
  const headSpread = Math.PI / 7

  const x1 = tipX - headLen * Math.cos(angle - headSpread)
  const y1 = tipY - headLen * Math.sin(angle - headSpread)
  const x2 = tipX - headLen * Math.cos(angle + headSpread)
  const y2 = tipY - headLen * Math.sin(angle + headSpread)

  return (
    <g className={`graph-arrow graph-arrow--${variant}`}>
      <line x1={cx} y1={cy} x2={tipX} y2={tipY} className="graph-arrow-line" />
      <polygon
        points={`${tipX},${tipY} ${x1},${y1} ${x2},${y2}`}
        className="graph-arrow-head"
      />
    </g>
  )
}
