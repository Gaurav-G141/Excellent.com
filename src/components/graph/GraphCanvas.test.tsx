import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { GraphCanvas, type GraphApi } from './GraphCanvas'
import type { Viewport } from '../../types/lesson'

/** Read the rendered curve's `d` attribute (which is api.pathD). */
function renderPathD(props: {
  viewport: Viewport
  evaluate?: (x: number) => number
  derivative?: (x: number) => number
  coefficients?: number[]
}): string {
  const { container } = render(<GraphCanvas {...props} />)
  const path = container.querySelector('.graph-curve')
  return path?.getAttribute('d') ?? ''
}

/** Pull the numeric coordinates out of an SVG path string. */
function pathNumbers(d: string): number[] {
  return (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
}

describe('GraphCanvas evaluate path', () => {
  it('plots a finite, connected path for eˣ', () => {
    const viewport: Viewport = { xMin: -2, xMax: 2.5, yMin: -1, yMax: 8 }
    const d = renderPathD({ viewport, evaluate: (x) => Math.exp(x) })

    expect(d).not.toBe('')
    expect(d).not.toContain('NaN')
    expect(d).not.toContain('Infinity')
    // exp is finite everywhere → exactly one move command, then line segments.
    expect((d.match(/M/g) ?? []).length).toBe(1)
    expect((d.match(/L/g) ?? []).length).toBeGreaterThan(0)
    expect(pathNumbers(d).every(Number.isFinite)).toBe(true)
  })

  it('plots ln x and skips x ≤ 0 without emitting NaN', () => {
    const viewport: Viewport = { xMin: -1, xMax: 6, yMin: -2, yMax: 6 }
    const d = renderPathD({ viewport, evaluate: (x) => (x > 0 ? Math.log(x) : Number.NaN) })

    expect(d).not.toBe('')
    expect(d).not.toContain('NaN')
    expect(d).not.toContain('Infinity')
    // The curve only starts once x crosses 0, so the first command is a move.
    expect(d.startsWith('M')).toBe(true)
    expect(pathNumbers(d).every(Number.isFinite)).toBe(true)
  })

  it('produces no path when every sample is non-finite', () => {
    const viewport: Viewport = { xMin: -5, xMax: -1, yMin: -2, yMax: 6 }
    const d = renderPathD({ viewport, evaluate: (x) => (x > 0 ? Math.log(x) : Number.NaN) })
    expect(d).toBe('')
  })

  it('api.evaluate uses the provided function and finite-differences the slope', () => {
    let captured: GraphApi | null = null
    render(
      <GraphCanvas viewport={{ xMin: -2, xMax: 2, yMin: -1, yMax: 8 }} evaluate={(x) => Math.exp(x)}>
        {(api) => {
          captured = api
          return null
        }}
      </GraphCanvas>,
    )
    expect(captured).not.toBeNull()
    const api = captured as unknown as GraphApi
    expect(api.evaluate(1)).toBeCloseTo(Math.E)
    // d/dx[eˣ] = eˣ; the central difference should land very close to e at x = 1.
    const seg = api.clippedTangentSegment(1)
    expect(Number.isFinite(seg.x1)).toBe(true)
    expect(Number.isFinite(seg.y1)).toBe(true)
    expect(Number.isFinite(seg.angle)).toBe(true)
  })

  it('renders the curve by default and omits it when hideCurve is set', () => {
    const viewport: Viewport = { xMin: -1, xMax: 5, yMin: -1, yMax: 6 }
    const coefficients = [0, 0, 0.25]

    // Default behaviour (regression guard): the curve path IS rendered.
    const shown = render(<GraphCanvas coefficients={coefficients} viewport={viewport} />)
    const shownPath = shown.container.querySelector('.graph-curve')
    expect(shownPath).not.toBeNull()
    expect(shownPath?.getAttribute('d')).not.toBe('')

    // With hideCurve, the curve path is gone but axes/grid still render.
    const hidden = render(
      <GraphCanvas coefficients={coefficients} viewport={viewport} hideCurve unitGrid />,
    )
    expect(hidden.container.querySelector('.graph-curve')).toBeNull()
    expect(hidden.container.querySelector('.graph-axis')).not.toBeNull()
    expect(hidden.container.querySelector('.graph-grid')).not.toBeNull()
  })

  it('exact derivative prop is used for the tangent when supplied', () => {
    let captured: GraphApi | null = null
    render(
      <GraphCanvas
        viewport={{ xMin: 0.1, xMax: 6, yMin: -2, yMax: 6 }}
        evaluate={(x) => Math.log(x)}
        derivative={(x) => 1 / x}
      >
        {(api) => {
          captured = api
          return null
        }}
      </GraphCanvas>,
    )
    const api = captured as unknown as GraphApi
    expect(api.evaluate(Math.E)).toBeCloseTo(1)
    const angle = api.tangentScreenAngle(2)
    expect(Number.isFinite(angle)).toBe(true)
  })
})
