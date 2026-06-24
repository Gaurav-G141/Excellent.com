import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DraggableGraphPoint } from './DraggableGraphPoint'
import type { GraphApi } from './GraphCanvas'

function fakeApi(): GraphApi {
  return {
    width: 320,
    height: 240,
    clipId: 'c',
    plotBounds: { left: 36, top: 16, right: 304, bottom: 212 },
    viewport: { xMin: -2, xMax: 4, yMin: -2, yMax: 8 },
    toScreen: (x: number, y: number) => ({ x, y }),
    screenToData: (sx: number, sy: number) => ({ x: sx, y: sy }),
    snapToCurve: (sx: number) => ({ x: sx, y: 0 }),
    evaluate: () => 0,
    pathD: '',
    tangentScreenAngle: () => 0,
    clippedTangentSegment: () => ({ x1: 0, y1: 0, x2: 0, y2: 0, angle: 0 }),
    secantSegment: () => ({ x1: 0, y1: 0, x2: 0, y2: 0, angle: 0 }),
  }
}

describe('DraggableGraphPoint accessibility', () => {
  it('exposes a focusable slider with value semantics', () => {
    const ref = createRef<SVGSVGElement>()
    render(
      <svg ref={ref}>
        <DraggableGraphPoint id="A" x={2} label="A" api={fakeApi()} svgRef={ref} onDrag={() => {}} />
      </svg>,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('tabindex', '0')
    expect(slider).toHaveAttribute('aria-valuenow', '2')
    expect(slider).toHaveAttribute('aria-valuemin', '-2')
    expect(slider).toHaveAttribute('aria-valuemax', '4')
  })

  it('moves the point with arrow keys', () => {
    const onDrag = vi.fn()
    const ref = createRef<SVGSVGElement>()
    render(
      <svg ref={ref}>
        <DraggableGraphPoint id="A" x={2} label="A" api={fakeApi()} svgRef={ref} onDrag={onDrag} />
      </svg>,
    )
    const slider = screen.getByRole('slider')
    // step = (4 - (-2)) / 50 = 0.12
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onDrag).toHaveBeenLastCalledWith('A', 2.12)
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(onDrag).toHaveBeenLastCalledWith('A', 1.88)
  })
})
