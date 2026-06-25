/**
 * In-memory pool of narrative themes per topic.
 *
 * Static themes are registered by each lesson module at import time and are
 * ALWAYS available, so problems generate correctly even with zero AI themes.
 * AI themes are merged in later (after a successful prefetch) purely to add
 * variety. `pickTheme` draws uniformly from the union.
 */

interface Pool {
  staticThemes: unknown[]
  aiThemes: unknown[]
}

/** Cap AI themes per topic so the pool can't grow without bound. */
const MAX_AI_THEMES = 40

const pools = new Map<string, Pool>()

export function registerStaticThemes<T>(topicId: string, themes: T[]): void {
  const existing = pools.get(topicId)
  if (existing) {
    existing.staticThemes = themes as unknown[]
  } else {
    pools.set(topicId, { staticThemes: themes as unknown[], aiThemes: [] })
  }
}

export function addAiThemes<T>(topicId: string, themes: T[]): void {
  const pool = pools.get(topicId)
  if (!pool || themes.length === 0) return
  pool.aiThemes.push(...(themes as unknown[]))
  if (pool.aiThemes.length > MAX_AI_THEMES) {
    pool.aiThemes.splice(0, pool.aiThemes.length - MAX_AI_THEMES)
  }
}

/** Random theme from the union of static + AI themes. Throws if none exist. */
export function pickTheme<T>(topicId: string): T {
  const pool = pools.get(topicId)
  const total = pool ? pool.staticThemes.length + pool.aiThemes.length : 0
  if (!pool || total === 0) {
    throw new Error(`No themes registered for topic "${topicId}"`)
  }
  const index = Math.floor(Math.random() * total)
  return (
    index < pool.staticThemes.length
      ? pool.staticThemes[index]
      : pool.aiThemes[index - pool.staticThemes.length]
  ) as T
}

export function aiThemeCount(topicId: string): number {
  return pools.get(topicId)?.aiThemes.length ?? 0
}

export function staticThemeCount(topicId: string): number {
  return pools.get(topicId)?.staticThemes.length ?? 0
}
