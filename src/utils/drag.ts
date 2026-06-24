/** Clamp a raw vertical drag delta into the [0, max] pull range. */
export function clampPull(dy: number, max: number): number {
  return Math.max(0, Math.min(dy, max))
}

/**
 * Whether a pull (computed live from pointer positions, not React state) has
 * crossed the commit threshold. Computing from the delta avoids a stale-state
 * race on pointer-up where the last move hasn't been flushed to state yet.
 */
export function isPullCommitted(dy: number, threshold: number, max: number): boolean {
  return clampPull(dy, max) >= threshold
}
