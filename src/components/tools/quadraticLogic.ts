/** Pure math for the quadratic solver, kept separate so it is easy to unit test. */

export type QuadResult =
  | { kind: 'identity' }
  | { kind: 'no-solution' }
  | { kind: 'linear'; x: number }
  | { kind: 'real-distinct'; x1: number; x2: number; discriminant: number }
  | { kind: 'real-repeated'; x: number; discriminant: number }
  | { kind: 'complex'; re: number; im: number; discriminant: number }

/**
 * Solves a*x^2 + b*x + c = 0, including the degenerate a == 0 cases.
 * Returns a tagged result describing the kind of solution found.
 */
export function solveQuadratic(a: number, b: number, c: number): QuadResult {
  if (a === 0) {
    // Not quadratic: falls back to the linear equation b*x + c = 0.
    if (b === 0) return c === 0 ? { kind: 'identity' } : { kind: 'no-solution' }
    return { kind: 'linear', x: -c / b }
  }

  const discriminant = b * b - 4 * a * c
  if (discriminant > 0) {
    const root = Math.sqrt(discriminant)
    return {
      kind: 'real-distinct',
      x1: (-b + root) / (2 * a),
      x2: (-b - root) / (2 * a),
      discriminant,
    }
  }
  if (discriminant === 0) {
    return { kind: 'real-repeated', x: -b / (2 * a), discriminant }
  }
  // Two complex conjugate roots: re ± im i. `+ 0` normalizes a -0 real part.
  return {
    kind: 'complex',
    re: -b / (2 * a) + 0,
    im: Math.abs(Math.sqrt(-discriminant) / (2 * a)),
    discriminant,
  }
}

/**
 * Rounds to at most 4 decimal places and trims trailing zeros. Normalizes -0 to
 * 0 so results never render as "-0".
 */
export function formatNum(n: number): string {
  if (!Number.isFinite(n)) return 'undefined'
  const rounded = Number(n.toFixed(4))
  return Object.is(rounded, -0) ? '0' : String(rounded)
}
