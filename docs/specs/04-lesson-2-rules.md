# Spec 04 — Lesson 2: Rules of Derivatives

## Purpose

Second JSON-driven lesson teaching the algebraic rules of differentiation. Content in
[`content/lessons/derivative-rules.json`](../../content/lessons/derivative-rules.json),
registered in [`src/lessons/index.ts`](../../src/lessons/index.ts).

## Multi-lesson plumbing

- `src/lessons/index.ts` holds the lesson registry (`lessons`, `lessonList`, `LESSON_ICONS`).
- Route is `/lessons/:lessonId`; `LessonPlayer` selects the lesson from the param.
- Progress is persisted per `lesson.id` (Firestore `progress/{uid}/lessons/{lessonId}`).
- Randomized review questions are appended only when a lesson sets
  `"appendRandomQuestions": true` (Lesson 1 only).

## Shared utilities

- `src/utils/polynomial.ts`: `addPolynomials`, `multiplyPolynomials`,
  `composePolynomials`, `findWhereDerivativeEquals` (for the MVT point).
- `src/utils/expression.ts`: dependency-free expression evaluator with implicit
  multiplication. `matchesPolynomial` grades type-in answers by numeric sampling, so
  any algebraically-equivalent form (factored or expanded) is accepted.

## Slides

| # | id | component | type | Notes |
|---|----|-----------|------|-------|
| 0 | power-rule | `powerRuleExponent` | demo | Drag the exponent down; repeatable with Reset. |
| 1 | power-match | `dragMatch` | problem | Tap-to-match; Check disabled until every prompt filled (no blank submit). |
| 2 | sum-rule | `sumRule` | demo | 3 synced graphs share one viewport; tangent arrows use a fixed data run so heights ∝ slope. Bottom strip stacks f′ + g′ at the same px scale, equal to (f+g)′. |
| 3 | sum-type-in | `typeInDerivative` | problem | f(x)=x²+3x → 2x+3. |
| 4 | chain-rule | `chainRule` | demo | Two-step animation (Play / Back / Next), ~1.5s per step, each step highlighted. |
| 5 | chain-type-in | `typeInDerivative` | problem | (3x+2)² → 18x+12 (accepts factored 6(3x+2)). |
| 6 | mvt | `meanValueTheorem` | demo | Drag A & B → secant; button reveals the parallel interior tangent at c. |
| 7 | mvt-multipart | `mvtMultiPart` | problem | 3 parts: secant slope, f′(x), interior c. |
| 8 | combining | `typeInDerivative` | problem | (2x+1)²+3x³ → 9x²+8x+4 (chain + power + sum). |

## Feedback incorporated

- Slide 0: differentiation is repeatable; **Reset** restores the original term.
- Slide 1: **Check** is disabled until all prompts are matched.
- Slide 2: every slope arrow uses an identical horizontal run; the bottom comparison
  arrows reuse the graph's exact pixels-per-unit scale (`PLOT` export from `GraphCanvas`).
- Slide 4: each of the two chain-rule steps gets a clearly-paced, highlighted reveal.

## Acceptance criteria

- [x] Lesson 2 appears on the home page and loads via `/lessons/derivative-rules`.
- [x] All type-in answers graded by sampling (equivalent forms accepted).
- [x] Build passes (`npm run build`); content math verified against the utils.
