import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTween } from './useTween'

const DURATION = 1000

let queue: Map<number, FrameRequestCallback>
let nextId: number
let cancelSpy: ReturnType<typeof vi.fn>
let realRaf: typeof globalThis.requestAnimationFrame
let realCancel: typeof globalThis.cancelAnimationFrame
let realNow: typeof performance.now

function flush(now: number) {
  const entries = [...queue.entries()]
  queue.clear()
  for (const [, cb] of entries) cb(now)
}

beforeEach(() => {
  queue = new Map()
  nextId = 1
  cancelSpy = vi.fn((id: number) => {
    queue.delete(id)
  })
  realRaf = globalThis.requestAnimationFrame
  realCancel = globalThis.cancelAnimationFrame
  realNow = performance.now
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    const id = nextId++
    queue.set(id, cb)
    return id
  }) as typeof globalThis.requestAnimationFrame
  globalThis.cancelAnimationFrame = cancelSpy as typeof globalThis.cancelAnimationFrame
  performance.now = () => 0
})

afterEach(() => {
  globalThis.requestAnimationFrame = realRaf
  globalThis.cancelAnimationFrame = realCancel
  performance.now = realNow
})

describe('useTween', () => {
  it('does not start until play() is called', () => {
    const onProgress = vi.fn()
    const { result } = renderHook(() => useTween(DURATION, onProgress))
    expect(result.current.playing).toBe(false)
    expect(onProgress).not.toHaveBeenCalled()
    expect(queue.size).toBe(0)
  })

  it('drives progress from 0 to 1 and reports done', () => {
    const onProgress = vi.fn()
    const onDone = vi.fn()
    const { result } = renderHook(() => useTween(DURATION, onProgress, onDone))

    act(() => result.current.play())
    expect(result.current.playing).toBe(true)

    act(() => flush(DURATION / 2))
    expect(onProgress).toHaveBeenLastCalledWith(0.5)

    act(() => flush(DURATION))
    expect(onProgress).toHaveBeenLastCalledWith(1)
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(result.current.playing).toBe(false)
  })

  it('restarts when play() is called again after finishing (replay)', () => {
    const onProgress = vi.fn()
    const { result } = renderHook(() => useTween(DURATION, onProgress))

    act(() => result.current.play())
    act(() => flush(DURATION)) // finish
    onProgress.mockClear()

    act(() => result.current.play()) // replay
    expect(result.current.playing).toBe(true)
    act(() => flush(DURATION / 4))
    expect(onProgress).toHaveBeenLastCalledWith(0.25)
  })

  it('cancels the in-flight frame when play() is called while playing', () => {
    const { result } = renderHook(() => useTween(DURATION, vi.fn()))
    act(() => result.current.play())
    act(() => flush(DURATION / 2)) // schedules another frame
    cancelSpy.mockClear()
    act(() => result.current.play()) // should cancel the pending frame
    expect(cancelSpy).toHaveBeenCalled()
  })

  it('cancels the pending frame on unmount (no leak)', () => {
    const onProgress = vi.fn()
    const { result, unmount } = renderHook(() => useTween(DURATION, onProgress))
    act(() => result.current.play())
    expect(queue.size).toBe(1)
    cancelSpy.mockClear()
    unmount()
    expect(cancelSpy).toHaveBeenCalled()
    onProgress.mockClear()
    flush(DURATION) // any leftover frame must not call back
    expect(onProgress).not.toHaveBeenCalled()
  })

  it('stop() halts playback', () => {
    const { result } = renderHook(() => useTween(DURATION, vi.fn()))
    act(() => result.current.play())
    act(() => result.current.stop())
    expect(result.current.playing).toBe(false)
  })
})
