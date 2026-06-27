import { describe, expect, it } from 'vitest'
import {
  MIN_WEIGHT,
  RECOVERY_MS,
  pickWeightedTopic,
  topicWeight,
  type TopicRecency,
} from './topicPicker'
import type { ApplicationTopicDef } from './types'

const NOW = 1_000_000_000_000

function topic(id: string): ApplicationTopicDef {
  return {
    id,
    label: id,
    generate: () => ({
      id: `${id}-1`,
      topicId: id,
      title: id,
      prompt: id,
      fields: [],
      hint: '',
    }),
  }
}

describe('topicWeight', () => {
  it('is full for a never-served topic', () => {
    expect(topicWeight(undefined, NOW)).toBe(1)
  })

  it('drops to the floor right after being served', () => {
    expect(topicWeight(NOW, NOW)).toBe(MIN_WEIGHT)
  })

  it('recovers fully after the recovery window', () => {
    expect(topicWeight(NOW - RECOVERY_MS, NOW)).toBe(1)
    expect(topicWeight(NOW - RECOVERY_MS * 2, NOW)).toBe(1)
  })

  it('rises linearly across the window (half a day => halfway back)', () => {
    const mid = topicWeight(NOW - RECOVERY_MS / 2, NOW)
    expect(mid).toBeCloseTo(MIN_WEIGHT + (1 - MIN_WEIGHT) * 0.5, 6)
  })

  it('clamps future timestamps to just-served', () => {
    expect(topicWeight(NOW + RECOVERY_MS, NOW)).toBe(MIN_WEIGHT)
  })
})

describe('pickWeightedTopic', () => {
  it('returns null for an empty pool', () => {
    expect(pickWeightedTopic([], {}, NOW)).toBeNull()
  })

  it('returns the only topic regardless of recency', () => {
    const only = topic('a')
    expect(pickWeightedTopic([only], { a: NOW }, NOW)).toBe(only)
  })

  it('never serves a recently-seen topic when a fresh one exists at low rng', () => {
    const topics = [topic('seen'), topic('fresh')]
    const recency: TopicRecency = { seen: NOW }
    // rng=0 selects from the front of the cumulative weights; with "seen" at the
    // floor and "fresh" at full weight, the lowest slice still goes to "seen"
    // only for its tiny floor share, so a draw past it lands on "fresh".
    const picked = pickWeightedTopic(topics, recency, NOW, () => 0.5)
    expect(picked.id).toBe('fresh')
  })

  it('strongly favors the stalest topic over many draws', () => {
    const topics = [topic('a'), topic('b'), topic('c')]
    // a & b served just now (floor weight), c never served (full weight).
    const recency: TopicRecency = { a: NOW, b: NOW }
    let seq = 0
    const rng = () => {
      // Deterministic spread of rng values across [0,1).
      seq += 0.137
      return seq % 1
    }
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
    for (let i = 0; i < 1000; i++) {
      const picked = pickWeightedTopic(topics, recency, NOW, rng)
      counts[picked.id]++
    }
    // c (weight 1) should dominate a and b (weight MIN_WEIGHT each).
    expect(counts.c).toBeGreaterThan(counts.a + counts.b)
  })

  it('is uniform once everything has fully recovered', () => {
    const topics = [topic('a'), topic('b')]
    // Both served more than a day ago => equal full weight.
    const recency: TopicRecency = { a: NOW - RECOVERY_MS * 2, b: NOW - RECOVERY_MS * 3 }
    expect(pickWeightedTopic(topics, recency, NOW, () => 0.25).id).toBe('a')
    expect(pickWeightedTopic(topics, recency, NOW, () => 0.75).id).toBe('b')
  })
})
