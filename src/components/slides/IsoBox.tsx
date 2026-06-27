import { buildBox, polyPoints, fmt, type ProjectOptions } from './paperBox'

interface Props {
  /** Base width in sheet units (W − 2x). */
  baseW: number
  /** Base length in sheet units (L − 2x). */
  baseL: number
  /** Wall height in sheet units (x). */
  height: number
  /** 0 = flaps lying flat, 1 = walls fully upright. Defaults to 1. */
  fold?: number
  unit?: string
  showLabels?: boolean
  /** Override the auto numeric labels (e.g. symbolic "x" / "11 − 2x"). */
  widthLabel?: string
  lengthLabel?: string
  heightLabel?: string
  className?: string
  ariaLabel?: string
}

const VIEW_W = 300
const VIEW_H = 250
const PROJ: ProjectOptions = { scale: 8, ox: 150, oy: 70 }

/**
 * Isometric drawing of the open paper box, shared by the explorer slide (where
 * `fold` animates from 0 to 1) and the optimization slides (a static labeled
 * box). Pure presentational SVG — no state.
 */
export function IsoBox({
  baseW,
  baseL,
  height,
  fold = 1,
  unit = 'in',
  showLabels = false,
  widthLabel,
  lengthLabel,
  heightLabel,
  className,
  ariaLabel,
}: Props) {
  const w = Math.max(0, baseW)
  const l = Math.max(0, baseL)
  const h = Math.max(0, height)
  const { floor, walls, heightAnchor, widthAnchor, lengthAnchor } = buildBox(
    w,
    l,
    h,
    fold,
    PROJ,
  )

  const wText = widthLabel ?? `${fmt(w)} ${unit}`
  const lText = lengthLabel ?? `${fmt(l)} ${unit}`
  const hText = heightLabel ?? `${fmt(h)} ${unit}`
  const labelsVisible = showLabels && fold > 0.99

  return (
    <svg
      className={`pb-iso ${className ?? ''}`}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={ariaLabel ?? 'A paper box folded up from a cut sheet'}
    >
      <polygon className="pb-floor" points={polyPoints(floor)} />
      {walls.map((wall, i) => (
        <polygon
          key={i}
          className={`pb-wall pb-wall--${wall.face}`}
          points={polyPoints(wall.points)}
        />
      ))}

      {labelsVisible && (
        <>
          <text className="pb-dim-label" x={heightAnchor.x + 8} y={heightAnchor.y + 4}>
            {hText}
          </text>
          <text
            className="pb-dim-label pb-dim-label--center"
            x={widthAnchor.x - 6}
            y={widthAnchor.y - 6}
          >
            {wText}
          </text>
          <text
            className="pb-dim-label pb-dim-label--center"
            x={lengthAnchor.x + 6}
            y={lengthAnchor.y - 6}
          >
            {lText}
          </text>
        </>
      )}
    </svg>
  )
}
