# Architecture

The current, canonical overview of the app. Per-feature detail lives in
[`docs/specs/`](specs/); this document is the map that ties it together. When the
code and an older doc disagree, treat the code and this file as the source of
truth.

## What the app is

A mobile-sized single-page React app for learning Calculus through interactive
lessons, generated practice, and AI-personalized real-world problems. State and
auth live in Firebase; an optional OpenAI layer rewrites problem wording and
grades free-response answers but never owns any math.

## Tech stack

- React 19 + TypeScript + Vite 8, React Router 7 (client-side routing)
- Firebase 12: Auth (email/password) + Cloud Firestore + Hosting
- OpenAI Chat Completions (`gpt-4o-mini`), strict JSON-schema output, direct or
  via a Cloudflare Worker proxy. Always optional — every caller degrades.
- Vitest 4 + Testing Library; oxlint

## High-level structure

```mermaid
flowchart TD
  user["Learner (mobile-sized SPA)"] --> app["App.tsx (BrowserRouter)"]
  app --> auth["AuthProvider + ProtectedRoute"]
  auth --> shell["AppHeader + TabNav shell"]

  shell --> lessons["Lessons / (HomePage -> LessonPage)"]
  shell --> practice["Practice /practice"]
  shell --> applications["Applications /applications"]
  shell --> scrapbook["Scrapbook /scrapbook"]
  shell --> interests["Interests /interests"]

  lessons --> content["content/lessons/*.json"]
  lessons --> renderer["SlideRenderer -> slide components"]
  practice --> generators["utils/practice generators"]
  applications --> scenarios["utils/applications scenarios + difficulty"]
  applications --> stickers["lib/stickers"]

  renderer --> graph["components/graph + math utils"]
  scenarios --> ai["lib/ai (OpenAI)"]
  applications --> ai
  stickers --> ai

  auth --> fb[("Firebase Auth + Firestore")]
  practice --> fb
  applications --> fb
  scenarios --> fb
  stickers --> fb
  ai -->|"proxy mode"| worker["Cloudflare Worker"]
  worker --> openai["OpenAI"]
```

## Routing

Defined in [`src/App.tsx`](../src/App.tsx). `BrowserRouter` is created with
`useTransitions={false}` (a deliberate workaround so `<Link>` navigation commits
in this React version).

- Public-only (redirect away if signed in): `/login`, `/signup`
- Protected (require auth): `/`, `/practice`, `/applications`, `/scrapbook`,
  `/interests`, `/lessons/:lessonId`
- `*` redirects to `/`

If `firebaseConfigError` is set (missing `VITE_FIREBASE_*`), the whole app is
replaced by `FirebaseSetupPage` before the router mounts.

## Feature map

- **Lessons** — `HomePage` lists lessons from the registry in
  [`src/lessons/index.ts`](../src/lessons/index.ts); `LessonPage` drives a slide
  sequence via [`SlideRenderer`](../src/components/lesson/SlideRenderer.tsx),
  which maps each slide's `type` + `component` to a React component in
  `src/components/slides/`. Content is JSON in `content/lessons/`.
  - Five lessons, in course (and unlock) order: `derivatives-basics`,
    `derivative-rules`, `related-rates`, `exponents-product-rule`, `paper-box`.
  - Each lesson opens when the previous is completed. `paper-box` is
    **always open** with a non-blocking _recommended_ prereq
    (`derivative-rules`); see `isAlwaysOpen` / `prerequisiteLessonId`.
  - Lessons with `randomQuestions` append a generated mastery quiz at the end.
- **Practice** — `PracticePage` + `src/utils/practice/`: per-topic generators
  grouped by lesson, plus a recency/staleness "worth reviewing" ranking.
  Rendered through the same slide components as lessons.
- **Applications** — `ApplicationsPage` + `src/utils/applications/`: multi-step
  scenario problems with an Elo-style difficulty rating
  ([`difficulty.ts`](../src/utils/applications/difficulty.ts)), recency-weighted
  topic picking ([`topicPicker.ts`](../src/utils/applications/topicPicker.ts)),
  a prefetch buffer ([`problemBuffer.ts`](../src/utils/applications/problemBuffer.ts)),
  AI surface-rewrites ([`scenarioRewrite.ts`](../src/utils/applications/scenarioRewrite.ts)),
  and AI-graded free-response steps ([`lib/aiGrade.ts`](../src/lib/aiGrade.ts)).
  Gated behind completing `derivative-rules` (`APPLICATIONS_UNLOCK_LESSON`).
- **Stickers / Scrapbook** — `src/lib/stickers/` earns an image "sticker" after
  a correct Applications problem (and removes one after repeated misses), stored
  per-user; `ScrapbookPage` renders the gallery.
- **Interests** — `InterestsPage` edits up to 12 interests (AI-moderated on add
  via `src/lib/interestsModeration.ts`), used to theme Applications scenarios and
  sticker art.

## AI layer

[`src/lib/ai.ts`](../src/lib/ai.ts) builds a JSON-schema-bound model or returns
`null` when AI is not configured. Two modes:

- **Direct:** `VITE_OPENAI_API_KEY` present → requests sent to OpenAI with that
  key as the bearer token.
- **Proxy:** key empty + `VITE_OPENAI_BASE_URL` set → bearer is the signed-in
  user's Firebase ID token, which the Worker verifies before attaching the real
  key.

`aiConfigured` is true when either mode is available. Callers (`scenarioRewrite`,
`rewrite`, `aiGrade`, `interestsModeration`, stickers) always fall back to static
behavior on any failure. Model defaults to `gpt-4o-mini`; rewrite calls time out
at 9000ms.

## Firestore data model

Owner-only access enforced by [`firestore.rules`](../firestore.rules), each
collection mirrored by a validator in `src/lib/firestoreValidation.ts`:

- `users/{uid}` — `displayName`, `email`, `createdAt`, streak fields
  (`streakCount`, `lastActiveDate`, `longestStreak`), Applications rating
  (`applicationsRating` 1..15, `applicationsGames`), and `interests` (≤12
  strings, each 1..60 chars).
- `progress/{uid}/lessons/{lessonId}` — `currentSlideIndex`, `lessonCompleted`,
  `updatedAt`.
- `practice/{uid}/topics/{topicId}` — `lastPracticedAt` (spaced-repetition).
- `applications/{uid}/topics/{topicId}` — `lastSeenAt` (recency-weighted picker).
- `stickers/{uid}/items/{itemId}` — `subject`, `src`, `provider`
  (`openai`|`pollinations`), `slotIndex` 0..11, `createdAt`, `expiresAt`.
- `courses/{courseId}` — read-only in rules, **not used by the client** (legacy).

## Testing toggles (revert before production)

Several feature flags are currently set for testing and must be reverted before
a public launch:

- `src/utils/applications/difficulty.ts` — `TEST_FIXED_STEPS` (fixed rating
  steps instead of the decaying Elo K-factor). Set to `null` to restore.
- `src/utils/applications/levelPrompts.ts` — `FORCE_INTEREST_PERSONALIZATION`
  (forces every rewrite into an interest). Set to `false` (its current default).
- `src/lib/stickers/config.ts` — `SPAWN_CHANCE = 1` (always spawn). Set to
  `0.15` for production.

## Documentation index

- Specs (`docs/specs/`):
  - [`00-overview.md`](specs/00-overview.md) — historical
  - [`01-firebase-emulator.md`](specs/01-firebase-emulator.md) — Firebase + Firestore model
  - [`02-content-schema.md`](specs/02-content-schema.md) — slide JSON schema
  - [`03-design-system-shell.md`](specs/03-design-system-shell.md) — tokens + app/lesson shell
  - [`04-lesson-2-rules.md`](specs/04-lesson-2-rules.md) — Rules of Derivatives
  - [`05-lesson-3-related-rates.md`](specs/05-lesson-3-related-rates.md) — Related Rates and Motion
  - [`06-lesson-4-exponents-product-rule.md`](specs/06-lesson-4-exponents-product-rule.md)
  - [`07-paper-box-lesson.md`](specs/07-paper-box-lesson.md)
  - [`08-applications-scenarios.md`](specs/08-applications-scenarios.md)
  - [`09-practice.md`](specs/09-practice.md)
  - [`10-stickers-scrapbook.md`](specs/10-stickers-scrapbook.md)
- Applications / AI:
  [`adaptive-difficulty.md`](adaptive-difficulty.md),
  [`adaptive-difficulty-examples.md`](adaptive-difficulty-examples.md),
  [`adaptive-difficulty-prompts.md`](adaptive-difficulty-prompts.md),
  [`word-problems.md`](word-problems.md),
  [`uil-calc-problems.md`](uil-calc-problems.md),
  [`openai-setup.md`](openai-setup.md)
- Worker: [`../worker/README.md`](../worker/README.md)
- Historical: [`applications-problem-eval.md`](applications-problem-eval.md),
  [`stickers/PLAN.md`](stickers/PLAN.md),
  [`audits/dead-code.md`](audits/dead-code.md),
  [`audits/post-remediation-audit.md`](audits/post-remediation-audit.md)
