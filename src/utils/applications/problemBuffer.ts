/**
 * A small, framework-free buffer of pre-prepared problems keyed by difficulty
 * level. Its only job is to keep a target number of ready-to-serve problems on
 * hand per warmed level so a learner almost never waits on the (slow, async)
 * preparation step.
 *
 * Guarantees the Applications tab relies on:
 *  - Each warmed level is filled to at most `depth` problems.
 *  - `topUp` only ever starts preparing the SHORTFALL (depth − buffered − in
 *    flight): a level that is already full or has enough in flight does nothing,
 *    so we never over-generate.
 *  - `take` hands back the next *accepted* problem (e.g. one whose lesson is
 *    still unlocked), discarding any that no longer qualify.
 *  - `reset` invalidates every in-flight preparation: late settles from before a
 *    reset can never push into — or corrupt the counts of — the new generation.
 *
 * Pure of React/Firebase; all I/O is injected so it can be unit-tested directly.
 */

export interface ProblemBufferConfig<T> {
  /** Target ready problems to keep on hand per warmed level (e.g. 2). */
  depth: number
  /** Pick a fresh base problem for `level` synchronously, or null if none. */
  pick: (level: number) => T | null
  /** Asynchronously prepare (e.g. AI-rewrite) a base problem for `level`. */
  prepare: (base: T, level: number) => Promise<T>
  /**
   * Whether a prepared problem is still servable right now (e.g. its lesson is
   * unlocked). Checked both when storing and when taking, so a problem that
   * becomes invalid after preparation is quietly dropped.
   */
  accept: (problem: T) => boolean
  /**
   * Optional liveness gate. When it returns false (e.g. the owning component
   * unmounted), settled preparations are ignored. Defaults to always-live.
   */
  isLive?: () => boolean
}

export class ProblemBuffer<T> {
  private readonly queues = new Map<number, T[]>()
  private readonly pending = new Map<number, number>()
  /** Bumped on reset; in-flight work tagged with an old value is ignored. */
  private generation = 0
  private readonly config: ProblemBufferConfig<T>

  constructor(config: ProblemBufferConfig<T>) {
    if (config.depth < 0) throw new Error('ProblemBuffer depth must be >= 0')
    this.config = config
  }

  /** How many ready problems are buffered for `level`. */
  buffered(level: number): number {
    return this.queues.get(level)?.length ?? 0
  }

  /** How many preparations are currently in flight for `level`. */
  inFlight(level: number): number {
    return this.pending.get(level) ?? 0
  }

  /**
   * Take the next servable problem for `level`, or null if none is ready.
   * Skips (and drops) any buffered problem that no longer passes `accept`.
   */
  take(level: number): T | null {
    const queue = this.queues.get(level)
    while (queue && queue.length > 0) {
      const next = queue.shift() as T
      if (this.config.accept(next)) return next
    }
    return null
  }

  /** Top each of `levels` up toward `depth`, generating only the shortfall. */
  topUp(levels: Iterable<number>): void {
    for (const level of levels) this.topUpLevel(level)
  }

  private topUpLevel(level: number): void {
    const needed = this.config.depth - this.buffered(level) - this.inFlight(level)
    for (let i = 0; i < needed; i++) {
      const base = this.config.pick(level)
      // No base available for this level (e.g. empty pool); stop trying.
      if (base == null) return
      const generation = this.generation
      this.pending.set(level, this.inFlight(level) + 1)
      void this.config
        .prepare(base, level)
        .then((prepared) => {
          if (this.generation !== generation) return
          if (this.config.isLive && !this.config.isLive()) return
          if (!this.config.accept(prepared)) return
          const queue = this.queues.get(level) ?? []
          // Guard against several landing at once and overshooting depth.
          if (queue.length < this.config.depth) {
            queue.push(prepared)
            this.queues.set(level, queue)
          }
        })
        // A failed preparation just frees its slot (decremented below); the next
        // topUp will try again. (rewriteProblem is contracted never to throw.)
        .catch(() => {})
        .finally(() => {
          // Ignore settles from an invalidated generation so we never corrupt
          // the live in-flight counts.
          if (this.generation !== generation) return
          this.pending.set(level, Math.max(0, this.inFlight(level) - 1))
        })
    }
  }

  /** Drop all buffered problems and invalidate every in-flight preparation. */
  reset(): void {
    this.generation += 1
    this.queues.clear()
    this.pending.clear()
  }
}
