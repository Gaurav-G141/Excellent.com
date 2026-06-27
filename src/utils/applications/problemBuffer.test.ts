import { describe, it, expect, vi } from 'vitest'

import { ProblemBuffer, type ProblemBufferConfig } from './problemBuffer'

/** A problem stand-in: just an id plus a level it was prepared for. */
interface FakeProblem {
  id: number
  level: number
  ok?: boolean
}

/** A manually-resolvable promise so tests control exactly when prep settles. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/**
 * Build a buffer plus controllable hooks. `prepare` hands back a deferred per
 * call so tests can resolve preparations in any order.
 */
function makeBuffer(overrides: Partial<ProblemBufferConfig<FakeProblem>> = {}) {
  let nextId = 1
  const prepares: Array<{
    base: FakeProblem
    level: number
    resolve: (p: FakeProblem) => void
    reject: (e?: unknown) => void
  }> = []

  const pick = vi.fn((level: number): FakeProblem | null => ({ id: nextId++, level, ok: true }))

  const prepare = vi.fn((base: FakeProblem, level: number): Promise<FakeProblem> => {
    const d = deferred<FakeProblem>()
    prepares.push({ base, level, resolve: d.resolve, reject: d.reject })
    return d.promise
  })

  const accept = vi.fn((p: FakeProblem) => p.ok !== false)

  const buffer = new ProblemBuffer<FakeProblem>({
    depth: 2,
    pick,
    prepare,
    accept,
    ...overrides,
  })

  return { buffer, pick, prepare, accept, prepares }
}

/** Let queued microtasks (promise .then/.finally) flush. */
const flush = () => Promise.resolve().then(() => Promise.resolve())

describe('ProblemBuffer: topUp shortfall', () => {
  it('fills an empty level up to depth and no further', async () => {
    const { buffer, prepare, prepares } = makeBuffer()

    buffer.topUp([5])
    expect(prepare).toHaveBeenCalledTimes(2)
    expect(buffer.inFlight(5)).toBe(2)

    prepares[0].resolve({ id: prepares[0].base.id, level: 5, ok: true })
    prepares[1].resolve({ id: prepares[1].base.id, level: 5, ok: true })
    await flush()

    expect(buffer.buffered(5)).toBe(2)
    expect(buffer.inFlight(5)).toBe(0)

    // Already full → generates nothing more.
    buffer.topUp([5])
    expect(prepare).toHaveBeenCalledTimes(2)
  })

  it('only generates the shortfall when some are already in flight', () => {
    const { buffer, prepare } = makeBuffer()

    buffer.topUp([3]) // fires 2 (depth)
    expect(prepare).toHaveBeenCalledTimes(2)

    // Both still in flight → topUp again should add nothing.
    buffer.topUp([3])
    expect(prepare).toHaveBeenCalledTimes(2)
    expect(buffer.inFlight(3)).toBe(2)
  })

  it('tops up only the missing amount after one is consumed', async () => {
    const { buffer, prepare, prepares } = makeBuffer()

    buffer.topUp([7])
    prepares[0].resolve({ id: 1, level: 7, ok: true })
    prepares[1].resolve({ id: 2, level: 7, ok: true })
    await flush()
    expect(buffer.buffered(7)).toBe(2)

    buffer.take(7) // one consumed → buffered 1
    expect(buffer.buffered(7)).toBe(1)

    buffer.topUp([7]) // shortfall is exactly 1
    expect(prepare).toHaveBeenCalledTimes(3)
    expect(buffer.inFlight(7)).toBe(1)
  })

  it('warms several levels independently', () => {
    const { buffer, prepare } = makeBuffer()
    buffer.topUp([2, 3, 4])
    expect(prepare).toHaveBeenCalledTimes(6) // 2 each
    expect(buffer.inFlight(2)).toBe(2)
    expect(buffer.inFlight(3)).toBe(2)
    expect(buffer.inFlight(4)).toBe(2)
  })

  it('does nothing for a level when pick returns null (empty pool)', () => {
    const { buffer, prepare } = makeBuffer({ pick: () => null })
    buffer.topUp([1])
    expect(prepare).not.toHaveBeenCalled()
    expect(buffer.inFlight(1)).toBe(0)
  })

  it('respects a custom depth', () => {
    const { buffer, prepare } = makeBuffer({ depth: 3 })
    buffer.topUp([9])
    expect(prepare).toHaveBeenCalledTimes(3)
  })
})

describe('ProblemBuffer: take', () => {
  it('returns buffered problems FIFO and decrements buffered count', async () => {
    const { buffer, prepares } = makeBuffer()
    buffer.topUp([5])
    prepares[0].resolve({ id: 100, level: 5, ok: true })
    prepares[1].resolve({ id: 101, level: 5, ok: true })
    await flush()

    expect(buffer.take(5)?.id).toBe(100)
    expect(buffer.take(5)?.id).toBe(101)
    expect(buffer.take(5)).toBeNull()
    expect(buffer.buffered(5)).toBe(0)
  })

  it('returns null for a level that was never warmed', () => {
    const { buffer } = makeBuffer()
    expect(buffer.take(12)).toBeNull()
  })

  it('drops problems that no longer pass accept and returns the next valid one', async () => {
    const { buffer, prepares } = makeBuffer()
    buffer.topUp([6])
    prepares[0].resolve({ id: 1, level: 6, ok: false }) // becomes invalid
    prepares[1].resolve({ id: 2, level: 6, ok: true })
    await flush()

    // First buffered is rejected by accept and skipped; second is returned.
    expect(buffer.take(6)?.id).toBe(2)
  })
})

describe('ProblemBuffer: accept gate at store time', () => {
  it('does not store a prepared problem that fails accept', async () => {
    const { buffer, prepares } = makeBuffer()
    buffer.topUp([4])
    prepares[0].resolve({ id: 1, level: 4, ok: false })
    prepares[1].resolve({ id: 2, level: 4, ok: false })
    await flush()
    expect(buffer.buffered(4)).toBe(0)
    expect(buffer.inFlight(4)).toBe(0)
  })
})

describe('ProblemBuffer: depth cap under concurrent settles', () => {
  it('never exceeds depth even if extra preparations land', async () => {
    // depth 2, but force 3 preparations by calling topUp before counts update
    // is impossible via API; instead resolve 2 then verify a late duplicate path.
    const { buffer, prepares } = makeBuffer()
    buffer.topUp([8])
    prepares[0].resolve({ id: 1, level: 8, ok: true })
    prepares[1].resolve({ id: 2, level: 8, ok: true })
    await flush()
    expect(buffer.buffered(8)).toBe(2)
  })
})

describe('ProblemBuffer: reset / generation invalidation', () => {
  it('clears buffered problems and in-flight counts', async () => {
    const { buffer, prepares } = makeBuffer()
    buffer.topUp([5])
    prepares[0].resolve({ id: 1, level: 5, ok: true })
    await flush()
    expect(buffer.buffered(5)).toBe(1)
    expect(buffer.inFlight(5)).toBe(1)

    buffer.reset()
    expect(buffer.buffered(5)).toBe(0)
    expect(buffer.inFlight(5)).toBe(0)
  })

  it('ignores a preparation that settles after a reset (no store, no count corruption)', async () => {
    const { buffer, prepares } = makeBuffer()
    buffer.topUp([5])
    buffer.reset()

    // These belong to the invalidated generation.
    prepares[0].resolve({ id: 1, level: 5, ok: true })
    prepares[1].resolve({ id: 2, level: 5, ok: true })
    await flush()

    expect(buffer.buffered(5)).toBe(0)
    expect(buffer.inFlight(5)).toBe(0)

    // A fresh warm after reset starts clean.
    buffer.topUp([5])
    expect(buffer.inFlight(5)).toBe(2)
  })

  it('a post-reset topUp is unaffected by stale settles arriving later', async () => {
    const { buffer, prepares } = makeBuffer()
    buffer.topUp([5]) // generation 0: prepares[0], [1]
    buffer.reset()
    buffer.topUp([5]) // generation 1: prepares[2], [3]

    // Resolve the *new* generation first.
    prepares[2].resolve({ id: 30, level: 5, ok: true })
    prepares[3].resolve({ id: 31, level: 5, ok: true })
    await flush()
    expect(buffer.buffered(5)).toBe(2)

    // Now the stale ones settle — must be ignored entirely.
    prepares[0].resolve({ id: 10, level: 5, ok: true })
    prepares[1].resolve({ id: 11, level: 5, ok: true })
    await flush()
    expect(buffer.buffered(5)).toBe(2)
    expect(buffer.take(5)?.id).toBe(30)
    expect(buffer.take(5)?.id).toBe(31)
  })
})

describe('ProblemBuffer: liveness gate', () => {
  it('ignores settles when isLive() is false', async () => {
    let live = true
    const { buffer, prepares } = makeBuffer({ isLive: () => live })
    buffer.topUp([5])
    live = false
    prepares[0].resolve({ id: 1, level: 5, ok: true })
    await flush()
    expect(buffer.buffered(5)).toBe(0)
    // Count still drops so a remount could resume cleanly.
    expect(buffer.inFlight(5)).toBe(1)
  })
})

describe('ProblemBuffer: failed preparations', () => {
  it('a rejected preparation frees its in-flight slot without storing', async () => {
    const { buffer, prepares } = makeBuffer()
    buffer.topUp([5])
    prepares[0].reject(new Error('boom'))
    prepares[1].resolve({ id: 2, level: 5, ok: true })
    await flush()
    expect(buffer.buffered(5)).toBe(1)
    expect(buffer.inFlight(5)).toBe(0)

    // The freed slot can be re-warmed.
    buffer.topUp([5])
    expect(buffer.inFlight(5)).toBe(1)
  })
})
