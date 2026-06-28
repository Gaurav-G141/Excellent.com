# Spec 10 — Stickers and Scrapbook (+ Interests)

Status: current. Describes the as-built motivation-sticker feature
(`src/lib/stickers/`, `src/contexts/StickerContext.tsx`,
`src/pages/ScrapbookPage.tsx`) and the Interests page that themes it.

## Overview

Solving an Applications problem can earn a "sticker": an AI-generated image of a
concrete subject drawn from the problem, pinned into a scrapbook. Repeated wrong
answers cost stickers. Stickers are short-lived, capped, and per-user.

## Lifecycle

[`stickers/trigger.ts`](../../src/lib/stickers/trigger.ts):

- `maybeSpawnSticker(problem, uid, interests)` — after a correct problem, with
  probability `SPAWN_CHANCE` it resolves a subject, generates an image, and
  persists the sticker. Generation runs **before** touching slots so a failed
  generation never evicts an existing sticker. Slots fill lowest-first; when all
  12 are taken the oldest is evicted and its slot reused.
- `loseStickers(uid, count)` — removes up to `count` random stickers as a penalty.
- Both are serialized through a per-tab `spawnQueue` so concurrent correct
  answers can't collide on a slot. Neither ever throws (a sticker failure must
  never disrupt solving).

## Configuration

[`stickers/config.ts`](../../src/lib/stickers/config.ts):

- `SPAWN_CHANCE` — **currently `1` (always spawn) for testing; set to `0.15` for
  production.**
- `LIFETIME_MS` — 2 days; a sticker expires after this.
- `WRONG_ANSWERS_PER_STICKER_LOSS` — 3 consecutive misses cost one sticker.
- `STICKER_SLOT_COUNT` — 12 scrapbook slots.
- `STICKER_SIZE_PX` — 100px rendered edge.

## Subject resolution

[`stickers/catalog.ts`](../../src/lib/stickers/catalog.ts) `resolveSubject`
picks a concrete, drawable noun, most-faithful first:

1. explicit `stickerSubject` hint,
2. a curated `subjectTerms` noun the problem is actually about (beats loose title
   guesses — a reworded title can't draw something unrelated),
3. a learner interest that literally appears in the themed text,
4. an ordered keyword→subject rule over title + prompt,
5. a per-`topicId` subject pool,
6. a generic celebratory fallback (gold star, trophy, …).

Both `WordProblem` and `ScenarioProblem` satisfy the `StickerableProblem` shape,
so either can earn a sticker.

## Image generation

[`stickers/generate.ts`](../../src/lib/stickers/generate.ts) uses **Pollinations**
exclusively — a keyless image URL that renders directly with no Firebase Storage
(Storage is unavailable on the Spark/free plan, so an OpenAI PNG would have
nowhere to live). The prompt ([`prompt.ts`](../../src/lib/stickers/prompt.ts)) is
built from the subject and a per-item pastel note color
([`palette.ts`](../../src/lib/stickers/palette.ts) `noteColorFor(itemId)`), the
same color the Scrapbook paints behind the sticker. The Firestore `provider`
field allows `openai` | `pollinations`; current code always writes
`pollinations`.

## Persistence and live updates

- Stored at `stickers/{uid}/items/{itemId}` (`subject`, `src`, `provider`,
  `slotIndex` 0..11, `createdAt`, `expiresAt`), validated by `validSticker` in
  [`firestore.rules`](../../firestore.rules).
- [`StickerContext`](../../src/contexts/StickerContext.tsx) (mounted at the app
  root) subscribes to the live active set and warms each image in the background
  one at a time with retries/backoff (Pollinations rate-limits bursts), exposing
  `items` and the `loaded` set to the whole app.
- [`stickers/store.ts`](../../src/lib/stickers/store.ts) holds the Firestore
  read/write/subscribe helpers (`subscribeActiveStickers`, `addSticker`,
  `deleteSticker`, `getActiveStickers`, `removeRandomSticker`).

## Interests

`src/pages/InterestsPage.tsx` edits up to 12 interests (each 1..60 chars), stored
on `users/{uid}.interests`. Adds are screened by
`src/lib/interestsModeration.ts` (AI moderation, with a graceful fallback).
Interests theme Applications scenario scenes (see
[`08-applications-scenarios.md`](08-applications-scenarios.md)) and can drive a
sticker subject.

## Related

- Applications flow that triggers spawns/losses:
  [`08-applications-scenarios.md`](08-applications-scenarios.md)
- Historical design intent: [`../stickers/PLAN.md`](../stickers/PLAN.md)
  (superseded; this spec reflects the as-built feature)
