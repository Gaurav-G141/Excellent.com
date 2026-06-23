import { useCallback, type RefObject } from 'react'
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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGCircleElement>) => {
      if (disabled) return
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [disabled],
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
  }, [])

  return (
    <g className="graph-draggable-point">
      <circle
        cx={screen.x}
        cy={screen.y}
        r={14}
        className="graph-draggable-point-hit"
        style={{ cursor: disabled ? 'default' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
