import { describe, expect, it } from 'vitest'
import {
  buildReviewItems,
  daysSince,
  isDue,
  lastPracticedLabel,
  STALE_DAYS,
} from './review'
import type { PracticeLessonGroup } from './types'
import type { ProblemSlide } from '../../types/lesson'

const NOW = 1_000 * 24 * 60 * 60 * 1000 // a round day boundary in epoch ms
const DAY = 24 * 60 * 60 * 1000

function fakeSlide(): ProblemSlide {
  return {
    id: 'x',
    type: 'problem',
    component: 'multipleChoice',
    title: '',
    body: '',
    config: {},
    feedback: { correct: '', wrong: '' },
    attempts: 'unlimited',
  }
}

function group(lessonId: string, title: string, topicIds: string[]): PracticeLessonGroup {
  return {
    lessonId,
    lessonTitle: title,
    topics: topicIds.map((id) => ({ id, label: id.toUpperCase(), generate: fakeSlide })),
  }
}

describe('daysSince', () => {
  it('floors to whole days and never goes negative', () => {
    expect(daysSince(null, NOW)).toBeNull()
    expect(daysSince(NOW, NOW)).toBe(0)
    expect(daysSince(NOW - DAY - 1, NOW)).toBe(1)
    expect(daysSince(NOW - 5 * DAY, NOW)).toBe(5)
    expect(daysSince(NOW + DAY, NOW)).toBe(0)
  })
})

describe('buildReviewItems', () => {
  it('orders never-practiced first, then oldest-practiced first', () => {
    const groups = [group('l1', 'One', ['a', 'b']), group('l2', 'Two', ['c'])]
    const activity = {
      a: NOW - 2 * DAY, // 2 days ago
      c: NOW - 10 * DAY, // 10 days ago
      // b never practiced
    }
    const items = buildReviewItems(groups, activity, NOW)
    expect(items.map((i) => i.topicId)).toEqual(['b', 'c', 'a'])
    expect(items[0].daysAgo).toBeNull()
    expect(items[1].daysAgo).toBe(10)
    expect(items[2].daysAgo).toBe(2)
    expect(items[1].groupTitle).toBe('Two')
  })
})

describe('isDue', () => {
  it('flags never-practiced and stale topics', () => {
    const [item] = buildReviewItems([group('l1', 'One', ['a'])], {}, NOW)
    expect(isDue(item)).toBe(true) // never practiced

    const fresh = buildReviewItems([group('l1', 'One', ['a'])], { a: NOW }, NOW)[0]
    expect(isDue(fresh)).toBe(false)

    const stale = buildReviewItems(
      [group('l1', 'One', ['a'])],
      { a: NOW - STALE_DAYS * DAY },
      NOW,
    )[0]
    expect(isDue(stale)).toBe(true)
  })
})

describe('lastPracticedLabel', () => {
  it('reads naturally for each recency', () => {
    const mk = (last: number | null) =>
      buildReviewItems([group('l1', 'One', ['a'])], last === null ? {} : { a: last }, NOW)[0]
    expect(lastPracticedLabel(mk(null))).toBe('Not studied yet')
    expect(lastPracticedLabel(mk(NOW))).toBe('Studied today')
    expect(lastPracticedLabel(mk(NOW - DAY - 1))).toBe('Studied yesterday')
    expect(lastPracticedLabel(mk(NOW - 4 * DAY))).toBe('Studied 4 days ago')
  })
})

describe('buildReviewItems with lesson-level activity', () => {
  it('treats recent lesson/applications work as freshness for every topic in the lesson', () => {
    const groups = [group('l1', 'One', ['a', 'b'])]
    // Neither topic was practiced, but the lesson itself was studied today.
    const items = buildReviewItems(groups, {}, NOW, { l1: NOW })
    expect(items.every((i) => i.daysAgo === 0)).toBe(true)
    expect(items.every((i) => isDue(i))).toBe(false)
  })

  it('uses the most recent of per-topic practice and lesson activity', () => {
    const groups = [group('l1', 'One', ['a'])]
    // Topic practiced 10 days ago, but its lesson touched 1 day ago => 1 day old.
    const [item] = buildReviewItems(groups, { a: NOW - 10 * DAY }, NOW, { l1: NOW - DAY })
    expect(item.daysAgo).toBe(1)
  })

  it('does not let stale lesson activity override fresher practice', () => {
    const groups = [group('l1', 'One', ['a'])]
    const [item] = buildReviewItems(groups, { a: NOW }, NOW, { l1: NOW - 30 * DAY })
    expect(item.daysAgo).toBe(0)
  })

  it('only applies lesson activity to topics in that lesson', () => {
    const groups = [group('l1', 'One', ['a']), group('l2', 'Two', ['b'])]
    const items = buildReviewItems(groups, {}, NOW, { l1: NOW })
    const a = items.find((i) => i.topicId === 'a')!
    const b = items.find((i) => i.topicId === 'b')!
    expect(a.daysAgo).toBe(0)
    expect(b.daysAgo).toBeNull()
  })
})
