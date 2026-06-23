import type { Viewport } from '../types/lesson'

/** Continuous zoom centered on (focusX, focusY); zoom=1 is base size, zoom=5 is 1/5 span. */
export function zoomViewport(
  base: Viewport,
  focusX: number,
  focusY: number,
  zoom: number,
): Viewport {
  const z = Math.max(1, zoom)
  const spanX = (base.xMax - base.xMin) / z
  const spanY = (base.yMax - base.yMin) / z

  return {
    xMin: focusX - spanX / 2,
    xMax: focusX + spanX / 2,
    yMin: focusY - spanY / 2,
    yMax: focusY + spanY / 2,
  }
}
