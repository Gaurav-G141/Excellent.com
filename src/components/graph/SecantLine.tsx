import type { ScreenSegment } from './GraphCanvas'

export function SecantLine({ segment }: { segment: ScreenSegment }) {
  return (
    <line
      x1={segment.x1}
      y1={segment.y1}
      x2={segment.x2}
      y2={segment.y2}
      className="graph-secant-line"
    />
  )
}
