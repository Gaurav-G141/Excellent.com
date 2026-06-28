/**
 * Recency-weighted topic picker for the Applications tab.
 *
 * Goal: keep variety high by deprioritizing topics the learner has seen recently
 * without ever locking one out. Each topic carries a weight that drops to a small
 * floor the moment it's served and then rises linearly back to 1 over RECOVERY_MS
 * (about a day), at which point the draw is uniform again ("fully random"). Pure
 * and side-effect free so it's trivially testable; the page owns the recency map.
 */

/** The picker only reads a topic's id, so it works for any id-bearing topic. */
interface IdentifiedTopic {
  id: string
}

/** How long after a topic is served until its weight fully recovers to 1. */
export const RECOVERY_MS = 24 * 60 * 60 * 1000

/**
 * Floor weight for a just-served topic. >0 so a recently seen concept is strongly
 * deprioritized but never impossible (and a single-topic pool still works).
 */
export const MIN_WEIGHT = 0.1

/** Map of topic id -> epoch ms it was last served. Missing => never served. */
export type TopicRecency = Record<string, number>

/**
 * Weight in [MIN_WEIGHT, 1]: MIN_WEIGHT right when a topic is served, climbing
 * linearly to 1 over RECOVERY_MS. Never served (undefined) counts as fully
 * recovered. Future timestamps (clock skew) are clamped to "just served".
 */
export function topicWeight(lastSeen: number | undefined, now: number): number {
  if (lastSeen === undefined) return 1
  const elapsed = now - lastSeen
  if (elapsed <= 0) return MIN_WEIGHT
  if (elapsed >= RECOVERY_MS) return 1
  return MIN_WEIGHT + (1 - MIN_WEIGHT) * (elapsed / RECOVERY_MS)
}

/**
 * Pick a topic, favoring ones not served recently. Returns null for an empty
 * pool. `rng` (default Math.random) yields [0, 1) and is injectable for tests.
 */
export function pickWeightedTopic<T extends IdentifiedTopic>(
  topics: T[],
  recency: TopicRecency,
  now: number,
  rng: () => number = Math.random,
): T | null {
  if (topics.length === 0) return null
  if (topics.length === 1) return topics[0]

  const weights = topics.map((topic) => topicWeight(recency[topic.id], now))
  const total = weights.reduce((sum, w) => sum + w, 0)
  // MIN_WEIGHT > 0 keeps this positive, but guard against degenerate inputs.
  if (total <= 0) return topics[Math.floor(rng() * topics.length)]

  let threshold = rng() * total
  for (let i = 0; i < topics.length; i++) {
    threshold -= weights[i]
    if (threshold < 0) return topics[i]
  }
  return topics[topics.length - 1]
}
