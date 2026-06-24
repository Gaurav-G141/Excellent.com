import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { clientToSvg } from '../../utils/svgCoords'
import type { GraphApi } from './GraphCanvas'

interface Props {
  id: string
  x: number
  api: GraphApi
  label?: string
  disabled?: boolean
  svgRef: RefObject<SVGSVGElement | null>
  onDrag: (id: string, x: number) => void
}

export function DraggableGraphPoint({
  id,
  x,
  api,
  label,
  disabled = false,
  svgRef,
  onDrag,
}: Props) {
  const y = api.evaluate(x)
  const screen = api.toScreen(x, y)
  const hitRef = useRef<SVGCircleElement>(null)
  const activePointer = useRef<number | null>(null)

  // Release any held pointer capture if we unmount mid-drag (e.g. slide change).
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGCircleElement>) => {
      if (disabled) return
      const step = (api.viewport.xMax - api.viewport.xMin) / 50
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        onDrag(id, x - step)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        onDrag(id, x + step)
      }
    },
    [api.viewport.xMax, api.viewport.xMin, disabled, id, onDrag, x],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGCircleElement>) => {
      if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return
      const svg = svgRef.current
      if (!svg) return
      const { x: sx, y: sy } = clientToSvg(svg, e.clientX, e.clientY)
      const snapped = api.snapToCurve(sx, sy)
      onDrag(id, snapped.x)
    },
    [api, disabled, id, onDrag, svgRef],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGCircleElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    activePointer.current = null
  }, [])

  return (
    <g className="graph-draggable-point">
      <circle
        ref={hitRef}
        cx={screen.x}
        cy={screen.y}
        r={14}
        className="graph-draggable-point-hit"
        style={{ cursor: disabled ? 'default' : 'grab', touchAction: 'none' }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Drag point ${label ?? id} horizontally`}
        aria-valuemin={Number(api.viewport.xMin.toFixed(2))}
        aria-valuemax={Number(api.viewport.xMax.toFixed(2))}
        aria-valuenow={Number(x.toFixed(2))}
        aria-disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      />
      <circle cx={screen.x} cy={screen.y} r={6} className="graph-draggable-point-dot" />
      {label && (
        <text
          x={screen.x}
          y={screen.y - 20}
          className="graph-draggable-point-label"
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}
