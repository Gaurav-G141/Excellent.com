# Spec 09 — Practice tab

Status: current. Summarizes the Practice tab: `src/pages/PracticePage.tsx`, the
generators in `src/utils/practice/`, and the spaced-repetition review ranking.

## Overview

Practice offers endlessly generated problems for each lesson topic. A generated
problem is a `ProblemSlide` (the same type lessons use), so it renders and grades
through the shared [`SlideRenderer`](../../src/components/lesson/SlideRenderer.tsx).
The tab unlocks once the learner finishes the first lesson.

## Topic registry

[`practice/index.ts`](../../src/utils/practice/index.ts) assembles
`PRACTICE_LESSONS` from per-lesson modules (`lesson1`..`lesson4`), filtering out
empty groups. Each group is a `PracticeLessonGroup` (`lessonId`, `lessonTitle`,
`topics`), and each `PracticeTopicDef`
([`types.ts`](../../src/utils/practice/types.ts)) has:

- `id` — unique across all lessons (e.g. `l2-power`),
- `label` — short chip label,
- `generate()` — returns one fresh, self-contained `ProblemSlide` with a new
  random polynomial each call.

Shared number/polynomial generation utilities live in
[`practice/helpers.ts`](../../src/utils/practice/helpers.ts). Generators are pure
(no Firebase/React) and unit-tested (`lesson*.test.ts`).

## Review / staleness ranking

[`review.ts`](../../src/utils/practice/review.ts) powers a "worth reviewing"
panel that nudges the learner toward neglected topics:

- `buildReviewItems(groups, activity, now, lessonActivity)` flattens every topic,
  annotates each with how recently it was studied (the later of its own practice
  time and lesson-level activity), and sorts **stalest first** (never-studied
  lead, then longest-ago).
- "Studied" spans all three sections: per-topic practice time
  (`practice/{uid}/topics/{topicId}.lastPracticedAt`) plus a coarser lesson-level
  signal (Lessons + Applications engagement for the same lesson).
- `isDue(item)` is true when never studied or `daysAgo >= STALE_DAYS` (3).
- `lastPracticedLabel(item)` renders the human phrase ("Studied 4 days ago").

## Persistence

Completing a practice problem records `lastPracticedAt` under
`practice/{uid}/topics/{topicId}` (validated by `validPractice` in
[`firestore.rules`](../../firestore.rules)).

## Related

- Slide schema and shared components: [`02-content-schema.md`](02-content-schema.md)
- Applications scenarios reuse the same lesson/topic grouping and feed the
  lesson-level activity signal: [`08-applications-scenarios.md`](08-applications-scenarios.md)
