/**
 * Shared helpers for practice-problem generators. Everything here is unseeded
 * (uses Math.random) so each generated problem differs from the last.
 */

// Polynomial formatting helpers live in ../polynomial; re-exported here so
// existing imports from this module keep working unchanged.
export { formatPolynomial, formatMonomial, superscript } from '../polynomial'

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

let seq = 0

/** Unique id for a freshly generated problem so React remounts it cleanly. */
export function uniqueId(prefix: string): string {
  seq += 1
  return `${prefix}-${seq}`
}
