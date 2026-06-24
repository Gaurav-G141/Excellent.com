# Post-Remediation Codebase Audit

**Date:** 2026-06-23
**Scope:** Full read-only diagnostic of the React + Vite + Firebase calculus app after completing remediation Tiers 1–4.
**Method:** Source review of `src/`, `content/`, and `firestore.rules`, plus the new automated test suite (`vitest`, 86 tests across 14 files). No further code changes were made while producing this document (the one exception — a crash regression introduced by Tier 2 — was fixed and is noted under "Remediation verification").

---

## 1. Remediation verification (Tiers 1–4)

All items below were fixed during this pass and are covered by unit tests. `npm run build` and `npm test` pass clean (86/86).

### Tier 1 — Critical

| Item | Fix | Tests |
|------|-----|-------|
| Unary-minus vs `^` precedence | `UNARY_PRECEDENCE = 3.5` (between `*` and `^`) so `-x^2 = -(x^2)` | `src/utils/expression.test.ts` (incl. `-x^2` regression, `2^-1`, `-(x+1)^2`, `-2^2*3`) |
| Firestore rules wide-open | Field whitelists (`hasOnly`), type + range validation for `users`/`progress`; TS mirror `firestoreValidation.ts`; client write sanitization in `progress.ts` | `src/lib/firestoreValidation.test.ts` |
| Prereq lock failed open | `LessonPlayer` access state machine (`checking`/`unlocked`/`locked`/`error`) fails **closed** with a retry screen; pure `evaluatePrereqAccess` | `src/lib/lessonAccess.test.ts` |
| MVT `c` grading too strict | `isValidMeanValuePoint` accepts **any** interior `c` with `f'(c)≈slope`; removed stray root-distance clause | `src/utils/grading.test.ts` (two-valid-`c` regression) |

### Tier 2 — High

| Item | Fix | Tests |
|------|-----|-------|
| RAF leak / replay-while-playing | New `useTween` hook owns RAF lifecycle (cancel on unmount/replay); 4 slides migrated (`LimitSecantDemo`, `ExpandingCircle`, `MotionVectors`, `SecondDerivative`) | `src/hooks/useTween.test.ts` (replay, stop, unmount-cancel) |
| `feedback.wrong.replace` crash on undefined | `formatFeedback` guards undefined/blank and substitutes tokens via split/join | `src/utils/feedback.test.ts` |
| HomePage setState-after-unmount | `active` guard + `.catch` + `loaded` gate (no "locked flash"); pure `isUnlockedByPrereq` | `src/lib/lessonAccess.test.ts` |
| Ending questions non-deterministic on resume | Seeded RNG (`mulberry32` + `hashStringToSeed(uid:lesson)`); related-rates problem moved into config at generation time | `src/utils/random.test.ts`, `src/utils/generateQuestion.test.ts` |

### Tier 3 — Medium

| Item | Fix | Tests |
|------|-----|-------|
| Streak race on concurrent writes | `recordDailyActivity` wrapped in `runTransaction`; pure `rollStreak` | `src/lib/streak.test.ts` |
| Orphan auth user / whitespace name | Sign-up validates display name and rolls back the auth account if the profile write fails | `src/lib/authValidation.test.ts` |
| IVT reveal with no crossing | Reveal blocked unless `findWhereEquals` returns a root | (component guard; math covered indirectly) |
| PowerRule stale-state commit | Commit decision uses live pointer delta via `isPullCommitted` | `src/utils/drag.test.ts` |
| Persistence errors swallowed | `saveError` banner surfaced in `LessonPlayer` | (UI) |

### Tier 4 — A11y / performance

| Item | Fix | Tests |
|------|-----|-------|
| `clipLineThroughPoint` `±Infinity` | Returns a finite degenerate segment when the line misses the plot | `src/components/graph/GraphCanvas.test.ts` |
| Grid arrays recomputed each render | Memoized with `useMemo` | — |
| Nested interactive in `DragMatchSlide` | Clear action moved to a sibling button | — |
| Drag point keyboard/ARIA + capture leak | `role="slider"`, arrow keys, `aria-value*`, pointer-capture released on unmount | `src/components/graph/DraggableGraphPoint.test.tsx` |
| Greatest-derivative options keyboard | `role="radio"`, `aria-checked`, Enter/Space activation | — |

**Regression caught & fixed during the final scan:** the static lesson slide `l3-slide-1-related-rates` had `config: {}` while the Tier 2 refactor made `RelatedRatesProblemSlide` read `config.problem` → render crash. Fixed via (a) a component fallback to a generated problem and (b) backfilling the lesson JSON with a concrete problem. Covered by `src/components/slides/RelatedRatesProblemSlide.test.tsx`.

---

## 2. Open findings (not in Tiers 1–4)

These remain and are candidates for a future pass. None block the current build.

### High

| Location | Finding |
|----------|---------|
| `src/components/slides/PowerRuleExponentSlide.tsx:100–137` | Drag handles are `<span>` with pointer handlers only — no `tabIndex`/`role`/keyboard/`aria`. The slide is unusable by keyboard. |
| `src/components/slides/DerivativeCriticalPointsSlide.tsx` (`GraphTapLayer`) | Plot tap area is a transparent `<rect>` with `onClick` only — not focusable, no keyboard activation, no `role`/`aria-label`. |
| `src/components/lesson/LessonPlayer.tsx:28–38` | Random-question RNG is seeded only when a user is present; an unauthenticated render uses `Math.random`. If auth resolves slightly after first render, the seed changes and a resumed index can map to different content. (Lessons require auth, so impact is small, but the seam exists.) |

### Medium

| Location | Finding |
|----------|---------|
| `src/components/lesson/CorrectFlash.tsx` + `MvtMultiPartSlide.tsx`, `IvtProblemSlide.tsx` | `CorrectFlash` only animates when `active` *changes* `false→true`. Multi-part slides set it `true` on part 1 and again on part 2, so the second correct answer does not re-flash. (Reset `flash` to `false` between parts, or key the flash on a counter.) |
| `src/components/slides/SecantZoomDerivativeSlide.tsx:~55`, `SecantToTangentSlide.tsx:~62` | `Number.parseFloat`-only grading: silently returns on `NaN` (no feedback) and rejects `π`/expressions that `matchesNumber` would accept elsewhere — inconsistent grading across slides. |
| `src/utils/polynomial.ts` (`findWhereEquals`, `findWhereDerivativeEquals`) | Interval scan starts at `lo + step` and relies on an exact in-loop `=== 0`; a root exactly at an endpoint can be missed. No tests cover endpoint roots. |
| `src/utils/generateQuestion.ts` (`generateGreatest`) | The 60-attempt loop can exit without a clear steepest point (`sorted[0]-sorted[1] > 0.8` not met), yielding an ambiguous "greatest derivative" question. |
| Bundle size (~882 kB single chunk) | No route-based `React.lazy`, no `manualChunks` for Firebase, `SlideRenderer` statically imports all 21 slides. |
| `src/components/slides/SumRuleSlide.tsx`, `DerivativeCriticalPointsSlide.tsx` | Multiple `GraphCanvas` instances and arrays recreated each render; candidates for memoization. |
| Lesson config typing | Pervasive `as unknown as XxxConfig` casts with no runtime validation; malformed lesson JSON fails at the use site rather than at load. |

### Low

| Location | Finding |
|----------|---------|
| `src/components/slides/IvtProblemSlide.tsx` | Options keyed by `key={value}`; duplicate values would collide (current JSON is safe). Options shuffled with unseeded `Math.random`. |
| `content/lessons/derivative-rules.json` + `MvtMultiPartSlide.tsx` | `cTolerance` is defined in JSON but no longer read (dead config field after the MVT grading fix). |
| `src/lib/streak.ts` | Streak uses the device's **local calendar date**; timezone travel / clock skew can extend or break a streak. Documented as intentional. |
| App-wide | No offline/local persistence; progress is lost if Firestore is unreachable. |
| `src/utils/expression.ts` (`matchesPolynomial`) | Equivalence checked by sampling 6 points — theoretically accepts a wrong polynomial that agrees at all samples. Acceptable for the small polynomials used. |
| `src/components/graph/GraphCanvas.tsx` | Generic `aria-label="Function graph"`; could be slide-specific. |

---

## 3. Confirmed healthy

- **No timer/RAF leaks** remain: `useTween`, `RateOfChangeArrowSlide`, `ChainRuleSlide`, `CorrectFlash`, and `DraggableGraphPoint` all clean up on unmount.
- **Rules ↔ validator parity**: `firestore.rules` and `firestoreValidation.ts` agree on field sets, types, and bounds; `progress.ts` sanitizes before writing.
- **Access gating consistency**: home (`isUnlockedByPrereq`) and player (`evaluatePrereqAccess`) follow the same lesson order and the player fails closed.
- **Seeded determinism**: `mulberry32`/`hashStringToSeed` produce reproducible question sets for a given `uid:lesson`.

---

## 4. Recommended next pass (priority order)

1. **A11y for pointer-only interactions** — `PowerRuleExponentSlide` handles and `GraphTapLayer` (keyboard + ARIA, mirror the `DraggableGraphPoint` pattern).
2. **Multi-part `CorrectFlash`** — reset between parts so each correct step animates.
3. **Unify numeric grading** — route `SecantZoom`/`SecantToTangent` through `matchesNumber` and add NaN feedback.
4. **Endpoint-aware root finding** — check interval endpoints in `findWhereEquals`/`findWhereDerivativeEquals`; add tests.
5. **Bundle splitting** — route-level `React.lazy` + Firebase `manualChunks` to cut the 882 kB chunk.
6. **Runtime config validation** — validate lesson JSON against the config types at load instead of relying on `as unknown as`.

---

## 5. Test suite snapshot

```
14 files · 86 tests · all passing
expression · firestoreValidation · lessonAccess · grading · useTween ·
feedback · random · generateQuestion · streak · authValidation · drag ·
GraphCanvas · DraggableGraphPoint · RelatedRatesProblemSlide
```

Run with `npm test` (`vitest run`) or `npm run test:watch`.
