import { describe, it, expect } from 'vitest'
import { clipLineThroughPoint } from './GraphCanvas'

// Plot rect used by GraphCanvas: left 36, right 304, top 16, bottom 212.
const LEFT = 36
const RIGHT = 304
const TOP = 16
const BOTTOM = 212

describe('clipLineThroughPoint', () => {
  it('clips a horizontal line through the centre to the plot width', () => {
    const seg = clipLineThroughPoint(170, 114, 0, LEFT, RIGHT, TOP, BOTTOM)
    const xs = [seg.x1, seg.x2].sort((a, b) => a - b)
    expect(xs[0]).toBeCloseTo(LEFT, 5)
    expect(xs[1]).toBeCloseTo(RIGHT, 5)
    expect(seg.y1).toBeCloseTo(114, 5)
    expect(seg.y2).toBeCloseTo(114, 5)
  })

  it('clips a vertical line through the centre to the plot height', () => {
    const seg = clipLineThroughPoint(170, 114, Math.PI / 2, LEFT, RIGHT, TOP, BOTTOM)
    const ys = [seg.y1, seg.y2].sort((a, b) => a - b)
    expect(ys[0]).toBeCloseTo(TOP, 5)
    expect(ys[1]).toBeCloseTo(BOTTOM, 5)
  })

  it('returns a finite degenerate segment when the line misses the plot [Infinity guard]', () => {
    const seg = clipLineThroughPoint(10000, 10000, 0, LEFT, RIGHT, TOP, BOTTOM)
    for (const v of [seg.x1, seg.y1, seg.x2, seg.y2]) {
      expect(Number.isFinite(v)).toBe(true)
    }
    expect(seg.x1).toBe(seg.x2)
    expect(seg.y1).toBe(seg.y2)
  })
})
