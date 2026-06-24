import { describe, it, expect } from 'vitest'
import { mulberry32, hashStringToSeed } from './random'

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(12345)
    const b = mulberry32(12345)
    const seqA = [a(), a(), a(), a()]
    const seqB = [b(), b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('produces floats in [0, 1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 200; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()])
  })
})

describe('hashStringToSeed', () => {
  it('is stable for the same string', () => {
    expect(hashStringToSeed('uid:related-rates')).toBe(hashStringToSeed('uid:related-rates'))
  })

  it('differs for different strings (usually)', () => {
    expect(hashStringToSeed('uid:lesson-a')).not.toBe(hashStringToSeed('uid:lesson-b'))
  })

  it('returns an unsigned 32-bit integer', () => {
    const h = hashStringToSeed('anything')
    expect(Number.isInteger(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })
})
