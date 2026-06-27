import { describe, it, expect } from 'vitest'
import {
  boxVolume,
  maxVolume,
  optimalCut,
  volumeCoefficients,
  volumeCriticalCuts,
  volumeDerivativeCoefficients,
} from './paperBox'

describe('paperBox math — letter sheet 8.5 × 11', () => {
  it('builds V(x) = 4x³ − 39x² + 93.5x', () => {
    expect(volumeCoefficients(8.5, 11)).toEqual([0, 93.5, -39, 4])
  })

  it('builds V′(x) = 12x² − 78x + 93.5', () => {
    expect(volumeDerivativeCoefficients(8.5, 11)).toEqual([93.5, -78, 12])
  })

  it('has a valid optimal cut inside (0, 4.25) and a rejected larger root', () => {
    const [small, large] = volumeCriticalCuts(8.5, 11)
    expect(small).toBeCloseTo(1.5854, 3)
    expect(large).toBeCloseTo(4.9146, 3)
    expect(large).toBeGreaterThan(8.5 / 2) // would leave no base
    expect(optimalCut(8.5, 11)).toBeCloseTo(1.5854, 3)
  })

  it('maxes the volume near 66.15 in³', () => {
    expect(maxVolume(8.5, 11)).toBeCloseTo(66.15, 1)
  })

  it("the derivative's smaller root really is the volume maximum", () => {
    const x = optimalCut(8.5, 11)
    const v = maxVolume(8.5, 11)
    expect(boxVolume(8.5, 11, x - 0.2)).toBeLessThan(v)
    expect(boxVolume(8.5, 11, x + 0.2)).toBeLessThan(v)
  })
})

describe('paperBox math — square transfer sheet 12 × 12', () => {
  it('builds V(x) = 4x³ − 48x² + 144x', () => {
    expect(volumeCoefficients(12, 12)).toEqual([0, 144, -48, 4])
  })

  it('has clean integer answers: cut 2, volume 128', () => {
    expect(optimalCut(12, 12)).toBeCloseTo(2, 6)
    expect(maxVolume(12, 12)).toBeCloseTo(128, 6)
    const [, large] = volumeCriticalCuts(12, 12)
    expect(large).toBeCloseTo(6, 6) // equals half the side → degenerate
  })
})
