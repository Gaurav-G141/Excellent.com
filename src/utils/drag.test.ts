import { describe, it, expect } from 'vitest'
import { clampPull, isPullCommitted } from './drag'

describe('clampPull', () => {
  it('clamps below 0 and above max', () => {
    expect(clampPull(-20, 72)).toBe(0)
    expect(clampPull(100, 72)).toBe(72)
    expect(clampPull(40, 72)).toBe(40)
  })
})

describe('isPullCommitted', () => {
  const THRESHOLD = 36
  const MAX = 72

  it('commits at or beyond the threshold', () => {
    expect(isPullCommitted(36, THRESHOLD, MAX)).toBe(true)
    expect(isPullCommitted(50, THRESHOLD, MAX)).toBe(true)
  })

  it('does not commit a short pull', () => {
    expect(isPullCommitted(20, THRESHOLD, MAX)).toBe(false)
    expect(isPullCommitted(0, THRESHOLD, MAX)).toBe(false)
  })

  it('commits a large pull that exceeds max (the stale-state regression)', () => {
    // Even if state never captured the final delta, the live delta commits.
    expect(isPullCommitted(200, THRESHOLD, MAX)).toBe(true)
  })

  it('treats upward pulls as no commit', () => {
    expect(isPullCommitted(-50, THRESHOLD, MAX)).toBe(false)
  })
})
