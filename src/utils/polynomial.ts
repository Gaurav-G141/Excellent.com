/** Evaluate polynomial sum(c[i] * x^i) for i = 0..n */
import type { CriticalPointConfig } from '../types/lesson'

/**
 * Snap a coefficient to a clean value, killing floating-point artifacts (e.g.
 * 0.1 * 0.2 = 0.020000000000000004) that arise when arithmetic is done on
 * decimal inputs. We round to nine decimal places: the calculator only accepts
 * ≤2-decimal inputs, so every exact product/derivative/sum the lessons can
 * produce has at most four decimal places — far coarser than 1e-9 — making this
 * rounding lossless for real values while still erasing the tiny binary tails.
 */
function roundCoeff(n: number): number {
  if (!Number.isFinite(n)) return n
  return Math.round(n * 1e9) / 1e9
}

export function evaluatePoly(coefficients: number[], x: number): number {
  return coefficients.reduce((sum, coeff, power) => sum + coeff * x ** power, 0)
}

/** Derivative coefficients: c[i] * i for i >= 1 */
export function derivativeCoefficients(coefficients: number[]): number[] {
  return coefficients.slice(1).map((coeff, index) => roundCoeff(coeff * (index + 1)))
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

/** Multiply two polynomials (low-to-high coefficient arrays). */
export function multiplyPolynomials(a: number[], b: number[]): number[] {
  if (a.length === 0 || b.length === 0) return []
  const result = new Array(a.length + b.length - 1).fill(0)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j]
    }
  }
  return result.map(roundCoeff)
}

/**
 * Product rule on two polynomials (low-to-high coefficient arrays). Returns the
 * factor derivatives, the two simplified product terms, and two
 * algebraically-equal forms of (u·v)′:
 * - `uPrimeV` = u′·v (simplified)
 * - `uVPrime` = u·v′ (simplified)
 * - `sum`     = u′·v + u·v′ (the product-rule expansion)
 * - `total`   = derivative of the expanded product u·v
 * `sum` and `total` are kept because they are pedagogically distinct.
 */
export function productRuleDerivative(
  u: number[],
  v: number[],
): {
  uPrime: number[]
  vPrime: number[]
  uPrimeV: number[]
  uVPrime: number[]
  sum: number[]
  total: number[]
} {
  const uPrime = derivativeCoefficients(u)
  const vPrime = derivativeCoefficients(v)
  const uPrimeV = multiplyPolynomials(uPrime, v)
  const uVPrime = multiplyPolynomials(u, vPrime)
  const sum = addPolynomials(uPrimeV, uVPrime)
  const total = derivativeCoefficients(multiplyPolynomials(u, v))
  return { uPrime, vPrime, uPrimeV, uVPrime, sum, total }
}

/** Private alias kept for existing callers; behavior is identical. */
function polyMultiply(a: number[], b: number[]): number[] {
  return multiplyPolynomials(a, b)
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
  return Array.from({ length }, (_, i) => roundCoeff((a[i] ?? 0) + (b[i] ?? 0)))
}

/** Subtract b from a (low-to-high coefficient arrays), padding the shorter. */
export function subtractPolynomials(a: number[], b: number[]): number[] {
  const length = Math.max(a.length, b.length)
  return Array.from({ length }, (_, i) => roundCoeff((a[i] ?? 0) - (b[i] ?? 0)))
}

/** Drop trailing (high-power) zero coefficients; never returns empty ([0] if all zero). */
export function trimPolynomial(c: number[]): number[] {
  let end = c.length
  while (end > 0 && c[end - 1] === 0) end--
  return end === 0 ? [0] : c.slice(0, end)
}

/** Compare two polynomials termwise within `tol` after trimming trailing zeros. */
export function polynomialsEqual(a: number[], b: number[], tol = 1e-9): boolean {
  const ta = trimPolynomial(a)
  const tb = trimPolynomial(b)
  if (ta.length !== tb.length) return false
  return ta.every((coeff, i) => Math.abs(coeff - tb[i]) <= tol)
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

const SUPERSCRIPTS: Record<string, string> = {
  '0': '\u2070',
  '1': '\u00b9',
  '2': '\u00b2',
  '3': '\u00b3',
  '4': '\u2074',
  '5': '\u2075',
  '6': '\u2076',
  '7': '\u2077',
  '8': '\u2078',
  '9': '\u2079',
}

/** Render an integer power as unicode superscript digits, e.g. 3 -> "³". */
export function superscript(power: number): string {
  return String(power)
    .split('')
    .map((d) => SUPERSCRIPTS[d] ?? d)
    .join('')
}

/**
 * Format a single term `coeff·variable^power` with a unicode superscript and
 * no leading sign (use the polynomial formatter for signs). A coefficient of
 * ±1 drops the digit for powers ≥ 1 (e.g. "x²", not "1x²").
 */
export function formatMonomial(coeff: number, power: number, variable = 'x'): string {
  // Emit at most two decimals with no trailing zeros (3 -> "3", 3.5 -> "3.5",
  // 12.34 -> "12.34") so a float tail like 2.0000000001 never leaks into the UI.
  const abs = Number(Math.abs(coeff).toFixed(2))
  const absStr = `${abs}`
  if (power === 0) return absStr
  const coeffStr = abs === 1 ? '' : absStr
  const varStr = power === 1 ? variable : `${variable}${superscript(power)}`
  return `${coeffStr}${varStr}`
}

/**
 * Format a polynomial from low-to-high coefficients (index = power), e.g.
 * [3, 0, 2] -> "2x² + 3". Zero terms are skipped; an empty polynomial is "0".
 */
export function formatPolynomial(coefficients: number[], variable = 'x'): string {
  const parts: string[] = []
  for (let power = coefficients.length - 1; power >= 0; power--) {
    const c = coefficients[power]
    if (c === 0) continue
    const term = formatMonomial(c, power, variable)
    if (parts.length === 0) parts.push(c < 0 ? `-${term}` : term)
    else parts.push(c < 0 ? `\u2212 ${term}` : `+ ${term}`)
  }
  return parts.length > 0 ? parts.join(' ') : '0'
}
