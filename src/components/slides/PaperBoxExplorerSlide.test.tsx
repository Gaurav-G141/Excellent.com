import { StrictMode } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { PaperBoxExplorerSlide } from './PaperBoxExplorerSlide'
import type { DemoSlide } from '../../types/lesson'

const slide = {
  id: 'pb',
  type: 'demo',
  component: 'paperBoxExplorer',
  title: 'Fold a box',
  body: 'body',
  config: { width: 8.5, length: 11, unit: 'in', initialCut: 1 },
} as unknown as DemoSlide

// Manual rAF queue so we can deterministically drive the tween clock.
let frames: Array<{ id: number; cb: FrameRequestCallback }> = []
let frameId = 0
let now = 0

function flushFrames(maxFrames = 500) {
  let n = 0
  while (frames.length && n < maxFrames) {
    const next = frames.shift()!
    now += 60
    act(() => next.cb(now))
    n++
  }
}

describe('PaperBoxExplorerSlide cut & fold', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    frames = []
    frameId = 0
    now = 0
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = ++frameId
      frames.push({ id, cb })
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames = frames.filter((f) => f.id !== id)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('runs the full cut → fold animation without throwing', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <StrictMode>
        <PaperBoxExplorerSlide slide={slide} onContinue={() => {}} />
      </StrictMode>,
    )

    act(() => {
      screen.getByRole('button', { name: /cut & fold/i }).click()
    })

    // Fire the 700ms "marks" delay → enters cutting and schedules the first rAF.
    act(() => {
      vi.advanceTimersByTime(700)
    })

    flushFrames() // cutting tween → onDone schedules fold → fold tween
    flushFrames() // any frames queued during the fold

    expect(screen.getByText(/Volume =/i)).toBeTruthy()

    const loop = errorSpy.mock.calls
      .flat()
      .some((a) => typeof a === 'string' && a.includes('Maximum update depth'))
    expect(loop).toBe(false)
    errorSpy.mockRestore()
  })
})
