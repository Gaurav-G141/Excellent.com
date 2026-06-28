# Spec 08 — Applications: scenario system

Status: current. This is the **live** Applications tab as built. It describes the
multi-step scenario problems, adaptive difficulty, recency picking, prefetch
buffer, AI surface-rewrite, and AI/heuristic grading. Source lives in
`src/utils/applications/` and `src/pages/ApplicationsPage.tsx`.

> The earlier single-shot `WordProblem` path (see
> [`word-problems.md`](../word-problems.md)) still exists in code and shares the
> difficulty/rewrite plumbing, but the page now serves multi-step **scenarios**.

## Core idea

A scenario is a paper-box-style guided problem: a real-world `prompt` (with the
calculus hidden) plus an ordered list of `steps` revealed one at a time. The math
is owned entirely by code; the AI only ever restates surface wording (the title
and prompt) at a target difficulty and may theme the scene to a learner interest.
Every AI path degrades gracefully — with no key, the base wording and code
grading still work.

## Types

Defined in [`scenarioTypes.ts`](../../src/utils/applications/scenarioTypes.ts):

- `ScenarioProblem` — `id`, `topicId`, `title`, `prompt`, optional `given`
  (verbatim formula block, never AI-changed), `steps`, optional `idealAnswer`,
  optional `stickerSubject`, and `subjectTerms` (concrete nouns the steps name,
  which the rewrite must keep referring to).
- `ScenarioStep` is one of:
  - `FrqStep` (`kind: 'frq'`) — conceptual free-response; the **only** AI-graded
    step. Has a `rubric`, optional `fallbackKeywords` (OR within a group, AND
    across groups), and an optional confirming `idealAnswer`.
  - `NumberStep` (`kind: 'number'`) — numeric, graded by `matchesNumber` with a
    tolerance.
  - `ExpressionStep` (`kind: 'expression'`) — polynomial in x, graded by
    `matchesPolynomial`; `builder: true` uses the polynomial calculator.
  - `ChoiceStep` (`kind: 'choice'`) — multiple-choice numeric.
- Each step has a `tier`: `'guide'` (only in the explicit band), `'core'`
  (always), or `'scaffold'` (hidden in the story band). `visibleSteps(steps,
  level)` filters by difficulty; `resolveStepPrompt(prompt, level)` resolves a
  band-varying `BandText` prompt.

Scenarios are registered per lesson in
[`scenarios/index.ts`](../../src/utils/applications/scenarios/index.ts)
(`SCENARIO_LESSONS`), mirroring the practice/lesson grouping by `lessonId` +
`topicId`.

## Unlock gating

`APPLICATIONS_UNLOCK_LESSON = 'derivative-rules'` — the tab and page both gate on
completing _Rules of Derivatives_, so no scenario is served before the power rule
has been taught. The prefetch buffer's `accept` predicate also drops any prepared
problem whose lesson is no longer unlocked.

## Adaptive difficulty (Elo)

[`difficulty.ts`](../../src/utils/applications/difficulty.ts): the learner carries
a single floating `rating` in `[1, 15]` (persisted as `applicationsRating` /
`applicationsGames`). Served level is `round(rating)`. After each problem an
`Outcome` maps to a score in `[0, 1]` (`scoreFromOutcome`: first-try = 1.0, one
miss = 0.6, more = 0.3, skip/fail = 0.0) and the rating moves toward it by a
decaying K-factor (`K_MAX=5 → K_MIN=0.75`, `TAU=8`): large early swings, gentle
later. `INITIAL_RATING = 4`.

> Testing toggle: `TEST_FIXED_STEPS = { up: 0.5, down: 0.4 }` currently overrides
> the Elo move with fixed asymmetric steps. Set to `null` (and revert
> `difficulty.test.ts`) to restore real progression before production.

## Difficulty bands and AI rewrite

[`levelPrompts.ts`](../../src/utils/applications/levelPrompts.ts) defines the
1..15 gradient (1 = maximally explicit, 15 = a short story whose question is only
implied) via `LEVEL_PROMPTS`, shared `SYSTEM_LINE` / `RULES_BLOCK` / `STYLE_BLOCK`,
and bands: `explicit` (<7), `implied` (7..12), `story` (≥13). `bandFor(level)`
and `IMPLIED_BAND_MIN` / `STORY_BAND_MIN` drive both prompt wording and step
visibility.

[`scenarioRewrite.ts`](../../src/utils/applications/scenarioRewrite.ts)
(`rewriteScenario`) rewrites **only** the `title` + `prompt`. It:

- composes a prompt from the level fragment, rules, style, interest clause, and a
  "KEEP THESE SUBJECTS" clause built from `subjectTerms`;
- times out at `REWRITE_TIMEOUT_MS = 9000` per attempt, up to `MAX_ATTEMPTS = 2`
  (a timeout returns the original; only invalid-but-fast results retry);
- validates via `validateScenarioRewrite`: strips jargon, enforces high-band
  giveaway rules at `story` level, requires every `subjectTerm` to still appear,
  and rejects any answer value that leaks into the prose (unless already in the
  base);
- returns the scenario unchanged on any failure. Never throws.

Interest theming: `buildInterestClause` themes the surface scene to a learner
interest. Default mode is "highly encouraged but optional".

> Testing toggle: `FORCE_INTEREST_PERSONALIZATION` (currently `false`) forces
> every rewrite into an interest. Keep `false` for production.

## Prefetch buffer and topic picking

- [`problemBuffer.ts`](../../src/utils/applications/problemBuffer.ts) keeps up to
  `depth` ready problems per warmed level so the (slow, async) AI rewrite rarely
  blocks. `topUp` prepares only the shortfall; `take` discards any no-longer-valid
  problem; `reset` invalidates in-flight work.
- [`topicPicker.ts`](../../src/utils/applications/topicPicker.ts) draws topics by
  a recency weight that drops to `MIN_WEIGHT = 0.1` when served and recovers
  linearly to 1 over `RECOVERY_MS` (~1 day). Recency comes from
  `applications/{uid}/topics/{topicId}.lastSeenAt`.

## Grading

- [`scenarioGrade.ts`](../../src/utils/applications/scenarioGrade.ts)
  `gradeCodeStep` handles number/expression/choice steps (reusing
  `matchesNumber` / `matchesPolynomial`); FRQ steps always return `false` here.
- FRQ steps are graded by [`lib/aiGrade.ts`](../../src/lib/aiGrade.ts)
  (`gradeFreeResponse`, run cold at `temperature: 0.2`, returns a verdict +
  feedback). Rigor scales with the band via `rigorForLevel`: `explicit →
  lenient`, `implied → standard`, `story → strict`.
- When AI is unavailable, `heuristicGradeFrq` is the local fallback: a minimum
  length plus the `fallbackKeywords` AND/OR check, and at `strict` rigor it also
  requires a rate-of-change term.

## Stickers and losses

A correctly-solved scenario can earn a sticker (see
[`10-stickers-scrapbook.md`](10-stickers-scrapbook.md)); repeated misses/skips
(`WRONG_ANSWERS_PER_STICKER_LOSS = 3` consecutive) remove one.

## Related

- Difficulty design: [`adaptive-difficulty.md`](../adaptive-difficulty.md),
  [`adaptive-difficulty-prompts.md`](../adaptive-difficulty-prompts.md),
  [`adaptive-difficulty-examples.md`](../adaptive-difficulty-examples.md)
- Problem-writing style: [`uil-calc-problems.md`](../uil-calc-problems.md)
- OpenAI wiring: [`openai-setup.md`](../openai-setup.md)
