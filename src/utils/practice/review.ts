/**
 * Pure ranking helpers for the Practice tab's spaced-repetition review panel.
 *
 * Staleness is judged across all three sections: a topic counts as recently
 * "studied" if the learner practiced that exact topic, OR recently engaged with
 * its lesson in any other way (a Lessons slide or an Applications problem for the
 * same lesson). Per-topic practice times come in keyed by topic id; the coarser
 * lesson-level signal (Lessons + Applications, which use different id namespaces)
 * comes in keyed by lesson id and applies to every topic in that lesson. Topics
 * are ordered "stalest first" so the UI can nudge the learner toward what they
 * haven't touched in a while. No I/O, so it's trivially tested.
 */

import type { PracticeActivity } from '../../lib/practiceActivity'
import type { PracticeLessonGroup } from './types'

/** A topic annotated with how long since it was last studied (any section). */
export interface ReviewItem {
  groupId: string
  groupTitle: string
  topicId: string
  label: string
  /** Epoch ms it was last studied (practice/lesson/applications), or null if never. */
  lastPracticedAt: number | null
  /** Whole days since it was last studied, or null if never. */
  daysAgo: number | null
}

const DAY_MS = 24 * 60 * 60 * 1000

/** A topic counts as "due" once it's never been practiced or is this many days old. */
export const STALE_DAYS = 3

/** Whole days since `ms` (floored, never negative); null passes through. */
export function daysSince(ms: number | null, now: number): number | null {
  if (ms === null) return null
  return Math.max(0, Math.floor((now - ms) / DAY_MS))
}

/** Larger of two timestamps, treating null as "no signal". */
function latest(a: number | null, b: number | null): number | null {
  if (a === null) return b
  if (b === null) return a
  return Math.max(a, b)
}

/**
 * Flatten every topic in `groups`, annotate it with how recently it was studied
 * (the later of its own practice time and its lesson-level activity), and sort
 * stalest first: never-studied topics lead, then the longest-ago ones.
 *
 * `lessonActivity` maps lesson id -> epoch ms of the most recent Lessons or
 * Applications engagement for that lesson; it bumps the freshness of every topic
 * in the lesson. Omit it (default `{}`) to rank on practice activity alone.
 */
export function buildReviewItems(
  groups: PracticeLessonGroup[],
  activity: PracticeActivity,
  now: number,
  lessonActivity: Record<string, number> = {},
): ReviewItem[] {
  const items: ReviewItem[] = groups.flatMap((group) =>
    group.topics.map((topic) => {
      const last = latest(activity[topic.id] ?? null, lessonActivity[group.lessonId] ?? null)
      return {
        groupId: group.lessonId,
        groupTitle: group.lessonTitle,
        topicId: topic.id,
        label: topic.label,
        lastPracticedAt: last,
        daysAgo: daysSince(last, now),
      }
    }),
  )

  return items.sort((a, b) => {
    if (a.lastPracticedAt === null && b.lastPracticedAt === null) return 0
    if (a.lastPracticedAt === null) return -1
    if (b.lastPracticedAt === null) return 1
    return a.lastPracticedAt - b.lastPracticedAt
  })
}

/** True when a topic is worth reviewing (never studied, or >= STALE_DAYS old). */
export function isDue(item: ReviewItem): boolean {
  return item.daysAgo === null || item.daysAgo >= STALE_DAYS
}

/**
 * Human-friendly "last studied" phrase for one item. "Studied" spans all three
 * sections (practice, lessons, applications), matching how staleness is judged.
 */
export function lastPracticedLabel(item: ReviewItem): string {
  if (item.daysAgo === null) return 'Not studied yet'
  if (item.daysAgo === 0) return 'Studied today'
  if (item.daysAgo === 1) return 'Studied yesterday'
  return `Studied ${item.daysAgo} days ago`
}
