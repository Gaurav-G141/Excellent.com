# Dead Code Audit

> **Historical / superseded as of 2026-06-28.** Point-in-time audit (2026-06-24);
> kept for reference. The codebase has changed substantially since.

Read-only audit of unused/dead code across the repository. No source files were modified to produce this report.

- Date: 2026-06-24
- Method: 4 parallel read-only sub-audits (slides, graph/lesson/pages, utils/hooks/types, lib/contexts/root/content), each cross-referencing the whole repo (`src/` + `content/`) with ripgrep, plus manual verification of the high-confidence items.
- Guardrails applied: slide components verified against the `SlideRenderer` registry and `content/lessons/*.json` `component` fields; code used only by `*.test.ts(x)` is reported separately as "test-only" (not outright dead); type-only/dynamic/composed references were accounted for.

## How to read confidence

- High: zero references found; safe to remove after a quick sanity check.
- Medium: no references today, but plausibly intentional (public API, future feature).
- Test-only: referenced only by unit tests; the export exists to be tested.

---

## 1. High-confidence dead code (safe to remove)

### 1a. Unused files

| Path | Evidence | Action |
|------|----------|--------|
| [src/App.css](src/App.css) | Imported by nothing (`main.tsx` imports only `index.css`; `App.tsx` imports no CSS). Entire file is leftover Vite starter styling (`.counter`, `.hero`, `.base`, `.framework`, `.vite`, `#center`, `#next-steps`, `#docs`, `#spacer`, `.ticks`). Also references undefined vars `--accent-border`, `--social-bg`. | Delete |
| [public/icons.svg](public/icons.svg) | Vite starter social/docs icon sprite (`bluesky-icon`, `github-icon`, ...). No reference in `index.html`, `src/`, or `content/`. | Delete |

### 1b. Broken asset reference (not dead code, but a runtime 404)

| Path | Evidence | Action |
|------|----------|--------|
| [index.html](index.html) line 5 | `href="/favicon.svg"` but `public/` contains only `icons.svg` — no `favicon.svg` exists. | Add a real favicon or fix the path |

### 1c. Unused functions in [src/utils/polynomial.ts](src/utils/polynomial.ts)

A self-contained dead cluster (the only caller of each is another dead function):

| Symbol | Lines | Evidence | Action |
|--------|-------|----------|--------|
| `findCriticalPoints` | 50–83 | 0 call sites repo-wide (only a mention in `docs/specs/04-lesson-2-rules.md`) | Delete |
| `composePolynomials` | 159–165 | 0 call sites repo-wide | Delete |
| `multiplyPolynomials` | 140–149 | Only caller is `composePolynomials` (line 162) | Delete |
| `trimTrailingZeros` (private) | 152–156 | Only caller is `composePolynomials` (line 164) | Delete |

Est. ~50 lines. Note: spec 04 lists `multiplyPolynomials`/`composePolynomials` as planned for the chain rule, but `ChainRuleSlide.tsx` uses only `derivativeCoefficients` — this is spec drift, not live usage.

### 1d. Dead feature path in [src/components/graph/GraphCanvas.tsx](src/components/graph/GraphCanvas.tsx)

| Item | Lines | Evidence | Action |
|------|-------|----------|--------|
| `showArrowHead` prop + its polygon branch | ~406–426 | `showArrowHead` appears only in `GraphCanvas.tsx`; no caller ever passes it | Remove prop + branch |
| `.graph-tangent-head` CSS | [GraphCanvas.css](src/components/graph/GraphCanvas.css) 69–71 | Only rendered via the never-true `showArrowHead` path | Remove with the prop |

### 1e. Unused CSS selectors

| Selector | File | Lines | Evidence |
|----------|------|-------|----------|
| `.graph-hint-arrow` (+ descendants) | [GraphCanvas.css](src/components/graph/GraphCanvas.css) | 133–142 | No `className="graph-hint-arrow"` anywhere |
| `.graph-tangent-hint` | [GraphCanvas.css](src/components/graph/GraphCanvas.css) | 17, 203–209 | No usage anywhere |
| `.graph-reference-label` | [GraphCanvas.css](src/components/graph/GraphCanvas.css) | 14, 217–222 | `graph-reference-dot` is used, but the label class never is |
| `.home-status` | [src/pages/HomePage.css](src/pages/HomePage.css) | 112–117 | No usage anywhere |
| `.lesson-end-note` | [src/components/lesson/LessonPlayer.css](src/components/lesson/LessonPlayer.css) | 354–359 | No usage anywhere |

### 1f. Stale CSS custom properties in [src/index.css](src/index.css)

| Variable | Line | Evidence |
|----------|------|----------|
| `--sans` | 7 | No `var(--sans)` anywhere (comment calling these "legacy aliases referenced throughout" is stale) |
| `--heading` | 8 | No `var(--heading)` anywhere |
| `--success` | 30 | Only `--success-flash` is used; `--success` is never referenced |

### 1g. Unused dependency

| Package | Evidence | Action |
|---------|----------|--------|
| `@vitest/coverage-v8` ([package.json](package.json) line 29) | No `coverage` config in `vite.config.ts`, no `--coverage` script/usage | Remove, or add a coverage script if intended |

---

## 2. Orphan className (used in JSX, no matching rule)

| Class | File | Evidence | Action |
|-------|------|----------|--------|
| `home-loading` | [src/pages/HomePage.tsx](src/pages/HomePage.tsx) line 113 | Applied to the loading text, but no `.home-loading` rule exists in any CSS file | Remove the token or add a rule |

---

## 3. Medium-confidence: exported but unused externally

These are exported but have no importer outside their own module (or only inside it). Safe to drop the `export` keyword; not removable as whole functions because the logic is used internally.

| Symbol | File:line | Note |
|--------|-----------|------|
| `GraphPoint` (interface) | [GraphCanvas.tsx](src/components/graph/GraphCanvas.tsx) ~13 | Only used inside `GraphCanvas.tsx` |
| `PlotBounds` (interface) | [GraphCanvas.tsx](src/components/graph/GraphCanvas.tsx) ~18 | Only used inside `GraphCanvas.tsx` |
| `CriticalPointType` | [polynomial.ts](src/utils/polynomial.ts) 29 | Duplicate of the type in `types/lesson.ts:70`; the `polynomial.ts` export has no external importer |
| `CriticalPoint` (interface) | [polynomial.ts](src/utils/polynomial.ts) 31–35 | Return type is inferred at call sites; no external type import |
| `mulberry32` | [random.ts](src/utils/random.ts) 4 | Used only internally (via `rngFromSeed`) + tests |
| `readStreak` | [streak.ts](src/lib/streak.ts) 42 | Called only inside `recordDailyActivity` |
| `LessonProgress` (interface) | [progress.ts](src/lib/progress.ts) 4 | Used internally; no external type import |
| `LessonAccess` (type) | [lessonAccess.ts](src/lib/lessonAccess.ts) 2 | Used only as an internal return type |

Also: `TangentArrow` / `TangentIndicator` accept a `variant: 'default'` that no call site uses (all pass `variant="tangent"`). The components are live; only the `'default'` branch is dead. Consider narrowing the type.

---

## 4. Test-only exports (lower confidence — not outright dead)

Exported primarily so unit tests can target them. Keep if you value the test contract; otherwise unexport and test through the public API.

| Symbol | File:line | Test |
|--------|-----------|------|
| `parseExpression` | [expression.ts](src/utils/expression.ts) 216 | `expression.test.ts` |
| `evaluateNumericExpression` | [expression.ts](src/utils/expression.ts) 230 | `expression.test.ts` (also used internally by `matchesNumber`) |
| `dayKey` | [streak.ts](src/lib/streak.ts) 13 | `streak.test.ts` |
| `rollStreak` | [streak.ts](src/lib/streak.ts) 56 | `streak.test.ts` |
| `StreakState` (interface) | [streak.ts](src/lib/streak.ts) 4 | `streak.test.ts` |
| `isValidUserPatch` | [firestoreValidation.ts](src/lib/firestoreValidation.ts) 34 | `firestoreValidation.test.ts` (intentional mirror of `firestore.rules`) |
| `isValidProgressDoc` | [firestoreValidation.ts](src/lib/firestoreValidation.ts) 55 | `firestoreValidation.test.ts` (intentional mirror of `firestore.rules`) |

Note: `clipLineThroughPoint` (GraphCanvas) and `GraphApi` are exercised by tests but ALSO used in production — not dead.

---

## 5. Content / JSON findings (`content/lessons/*.json`)

| Field | Evidence | Confidence |
|-------|----------|------------|
| `feedback.correct` | No code reads `feedback.correct` anywhere in `src/`; it is `""` on all 12 problem slides | High (unused, by design — correct answers show only the green flash) |
| `attempts` | Required by the `ProblemSlide` type but never read at runtime | High (schema placeholder) |
| `animation.loop` (slide-0 rate-of-change) | `RateOfChangeArrowSlide` reads only `animation.mode` and `animation.durationMs` | High |
| `outerDisplay`, `viewport` (l2 chain-rule demo) | `ChainRuleSlide` destructures only `outerCoefficients`, `innerCoefficients`, `innerDisplay` (no graph) | High |
| `cTolerance` (l2 mvt-multipart) | `MvtMultiPartSlide` reads `slopeTolerance`/`derivativeTolerance` only | High |
| `cTolerance` (l3 ivt-problem) | `IvtProblemSlide` is multiple-choice; never reads it | High |
| `criticalPoints[].type` (derivative-critical PROBLEM slide) | `DerivativeCriticalPointsSlide` grades on `.x` only. Still used by the `horizontalCritical` demo slide, so keep the type field there | Medium |

Removing JSON-schema fields like `feedback.correct`/`attempts` would also require narrowing `ProblemSlide` in [src/types/lesson.ts](src/types/lesson.ts).

---

## 6. Not dead, but worth a look (styling gaps / duplication)

These are correctness/cleanliness issues surfaced during the audit, not dead code:

- Missing CSS imports (styles only render if another slide already loaded the sheet this session; a direct refresh on these slides could miss styling):
  - `typein-expression` / `typein-fx` / `typein-display` used in `TypeInDerivativeSlide.tsx` but it does not import `Lesson2.css`.
  - `mvt-given` used in `IvtProblemSlide.tsx` (imports only `Lesson3.css`; class defined in `Lesson2.css`).
  - `cr-step-btn` used in `SecondDerivativeProblemSlide.tsx` (same cross-sheet issue).
  - `ProtectedRoute.tsx` uses `auth-page`/`auth-subtitle` without importing `Auth.css`.
  - `HomePage.tsx` loading text uses `slide-hint` (defined in `LessonPlayer.css`, not loaded on `/`).
- className tokens with no matching rule in the scoped sheet: `pr-rule-body` (PowerRuleExponentSlide), `cr-outer` / `cr-term` / `cr-equals` (ChainRuleSlide).
- Duplicated local helpers: `shuffle()` in `DragMatchSlide.tsx` and `IvtProblemSlide.tsx`; `authErrorMessage()` in `LoginPage.tsx` and `SignupPage.tsx`.
- `SecantToTangentSlide` reads `coincidentThreshold` for `closeEnough` but passes a hardcoded `0` to `api.secantSegment(...)` (line ~87) — config partially unused.
- `buildRelatedRatesProblem()` fallback in `RelatedRatesProblemSlide.tsx` is defensive (reachable only if JSON omits `problem`); keep.

---

## 7. Confirmed healthy

- All 21 slide components are live via `SlideRenderer` + lesson JSON; none are unused.
- All pages/routes (`HomePage`, `LoginPage`, `SignupPage`, `LessonPage`, `FirebaseSetupPage`, `ProtectedRoute`, `PublicOnlyRoute`) are reachable from `App.tsx`.
- `easing.ts`, `viewport.ts`, `svgCoords.ts` are each imported in production (these were flagged as suspects but are live).
- All `package.json` dependencies except `@vitest/coverage-v8` are used (runtime, build, test, types, or CLI).
- No commented-out executable code blocks anywhere in scope.
- `index.css` is imported and has no unused class selectors (only the three stale `:root` variables noted in 1f).

---

## 8. Needs manual confirmation

1. `feedback.correct` / `attempts` — likely reserved for a future feedback/attempt-limit UI. Removal also means narrowing `ProblemSlide`.
2. `findCriticalPoints`, `composePolynomials`, `multiplyPolynomials` — confirm no upcoming slide will scan for critical points or compose polynomials before deleting (docs still reference them).
3. `GraphPoint` / `PlotBounds` / `CriticalPoint` exports — may be intentional public typing surface.
4. `@vitest/coverage-v8` — keep if you plan to add a coverage script soon.
5. `--sans` / `--heading` / `--success` — confirm no CSS outside the repo references them.
6. `criticalPoints[].type` on the problem slide — pedagogically meaningful even though unused for grading.

---

## Suggested removal priority (when you decide to act)

1. Delete `src/App.css` and `public/icons.svg`; fix the `favicon.svg` reference in `index.html`.
2. Delete the dead polynomial cluster (`findCriticalPoints`, `composePolynomials`, `multiplyPolynomials`, `trimTrailingZeros`).
3. Remove the `showArrowHead` path in `GraphCanvas.tsx` + `.graph-tangent-head`.
4. Remove unused CSS selectors (1e) and stale `:root` vars (1f); drop the `home-loading` token or add a rule.
5. Remove `@vitest/coverage-v8` (or add coverage).
6. Unexport the medium/test-only symbols (sections 3–4) as desired.
7. Decide on the JSON/type cleanup (`feedback.correct`, `attempts`) as a coordinated change.
