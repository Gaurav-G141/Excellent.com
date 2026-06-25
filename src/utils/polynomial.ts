/** Evaluate polynomial sum(c[i] * x^i) for i = 0..n */
import type { CriticalPointConfig } from '../types/lesson'

export function evaluatePoly(coefficients: number[], x: number): number {
  return coefficients.reduce((sum, coeff, power) => sum + coeff * x ** power, 0)
}

/** Derivative coefficients: c[i] * i for i >= 1 */
export function derivativeCoefficients(coefficients: number[]): number[] {
  return coefficients.slice(1).map((coeff, index) => coeff * (index + 1))
}

export function evaluateDerivative(coefficients: number[], x: number): number {
  return evaluatePoly(derivativeCoefficients(coefficients), x)
}

export function evaluateSecondDerivative(coefficients: number[], x: number): number {
  return coefficients.reduce((sum, coeff, power) => {
    if (power < 2) return sum
    return sum + coeff * power * (power - 1) * x ** (power - 2)
  }, 0)
}

/** Second-derivative coefficients (apply the power rule twice). */
export function secondDerivativeCoefficients(coefficients: number[]): number[] {
  return derivativeCoefficients(derivativeCoefficients(coefficients))
}

export type CriticalPointType = 'max' | 'min' | 'critical'

export interface CriticalPoint {
  x: number
  y: number
  type: CriticalPointType
}

/** Resolve config entries to full critical points with y = f(x). */
export function resolveCriticalPoints(
  coefficients: number[],
  points: CriticalPointConfig[],
): CriticalPoint[] {
  return points.map((point) => ({
    x: point.x,
    y: evaluatePoly(coefficients, point.x),
    type: point.type,
  }))
}

/** Lagrange interpolation through (x, y) pairs — returns coeffs low-to-high degree */
export function interpolatePolynomial(points: { x: number; y: number }[]): number[] {
  const n = points.length
  const coeffs = new Array(n).fill(0)

  for (let i = 0; i < n; i++) {
    let basis = new Array(n).fill(0)
    basis[0] = 1
    let denom = 1

    for (let j = 0; j < n; j++) {
      if (i === j) continue
      denom *= points[i].x - points[j].x
      basis = polyMultiply(basis, [-points[j].x, 1])
    }

    const scale = points[i].y / denom
    for (let k = 0; k < n; k++) {
      coeffs[k] += scale * basis[k]
    }
  }

  return coeffs
}

function polyMultiply(a: number[], b: number[]): number[] {
  const result = new Array(a.length + b.length - 1).fill(0)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j]
    }
  }
  return result
}

export function sampleCurve(
  coefficients: number[],
  xMin: number,
  xMax: number,
  samples = 120,
): { x: number; y: number }[] {
  const step = (xMax - xMin) / (samples - 1)
  return Array.from({ length: samples }, (_, i) => {
    const x = xMin + i * step
    return { x, y: evaluatePoly(coefficients, x) }
  })
}

/** Sum two polynomials (low-to-high coefficient arrays). */
export function addPolynomials(a: number[], b: number[]): number[] {
  const length = Math.max(a.length, b.length)
  return Array.from({ length }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0))
}

/**
 * Find an x in (a, b) where f'(x) equals `target` (e.g. the MVT point).
 * Scans for a sign change in f'(x) - target and linearly interpolates the root.
 */
export function findWhereDerivativeEquals(
  coefficients: number[],
  target: number,
  a: number,
  b: number,
  step = 0.0005,
): number | null {
  const derivative = derivativeCoefficients(coefficients)
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  let prevX = lo
  let prevG = evaluatePoly(derivative, lo) - target

  for (let x = lo + step; x <= hi; x += step) {
    const g = evaluatePoly(derivative, x) - target
    if (g === 0) return x
    if (prevG * g < 0) {
      return prevX + (step * Math.abs(prevG)) / (Math.abs(prevG) + Math.abs(g))
    }
    prevX = x
    prevG = g
  }
  return null
}

/**
 * Find an x in [a, b] where f(x) equals `target` (the IVT reveal point).
 * Scans for a sign change in f(x) - target and linearly interpolates the root.
 */
export function findWhereEquals(
  coefficients: number[],
  target: number,
  a: number,
  b: number,
  step = 0.0005,
): number | null {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  let prevX = lo
  let prevG = evaluatePoly(coefficients, lo) - target

  for (let x = lo + step; x <= hi; x += step) {
    const g = evaluatePoly(coefficients, x) - target
    if (g === 0) return x
    if (prevG * g < 0) {
      return prevX + (step * Math.abs(prevG)) / (Math.abs(prevG) + Math.abs(g))
    }
    prevX = x
    prevG = g
  }
  return null
}
