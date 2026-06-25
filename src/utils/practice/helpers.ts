/**
 * Shared helpers for practice-problem generators. Everything here is unseeded
 * (uses Math.random) so each generated problem differs from the last.
 */

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

/** Random integer in [min, max], inclusive. */
export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/** Pick a uniformly random element. */
export function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)]
}

/** Return a shuffled copy (Fisher–Yates). */
export function shuffle<T>(values: T[]): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Format a single term `coeff·variable^power` with a unicode superscript and
 * no leading sign (use the polynomial formatter for signs). A coefficient of
 * ±1 drops the digit for powers ≥ 1 (e.g. "x²", not "1x²").
 */
export function formatMonomial(coeff: number, power: number, variable = 'x'): string {
  const abs = Math.abs(coeff)
  if (power === 0) return `${abs}`
  const coeffStr = abs === 1 ? '' : `${abs}`
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

let seq = 0

/** Unique id for a freshly generated problem so React remounts it cleanly. */
export function uniqueId(prefix: string): string {
  seq += 1
  return `${prefix}-${seq}`
}
