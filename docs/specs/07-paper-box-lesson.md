# Spec 07 — The Biggest Paper Box (real-world lesson)

Status: current. Summarizes
[`content/lessons/paper-box.json`](../../content/lessons/paper-box.json), its
slide components in `src/components/slides/`, and the always-open gating in
[`src/lessons/index.ts`](../../src/lessons/index.ts).

## Overview

An interactive optimization lesson: cut equal squares from the corners of a
sheet, fold up the sides, and maximize the resulting open box's volume. It is the
app's flagship "interactivity over video" lesson — the learner physically cuts
and folds, derives the volume formula, then uses calculus to find the best cut.

- Lesson id: `paper-box`, title "The Biggest Paper Box", subject
  "Calculus · Real world".
- **Always open** (`ALWAYS_OPEN`), so it is reachable regardless of the unlock
  chain, with a non-blocking **recommended** prereq of `derivative-rules`
  (`RECOMMENDED_PREREQ`). `HomePage` shows the recommendation as a hint, not a
  lock. Icon: a package emoji.

## Slides

1. `pb-slide-0-explore` (demo, `paperBoxExplorer`; `width: 8.5`, `length: 11`,
   `unit: "in"`, `initialCut: 1`) — set a corner cut on a realistic 8.5 × 11
   college-ruled sheet, then watch an animation: 8 cut marks appear, a scissors
   makes 8 distinct cuts, the four flaps fold into a box, and the volume is
   computed and displayed. The learner is encouraged to play and find where the
   volume is highest.
2. `pb-slide-1-derive` (problem, `boxVolumeDerive`; 8.5 × 11) — derive the volume
   as `V(x) = x · (8.5 − 2x) · (11 − 2x)` using the polynomial calculator
   (`PolynomialBuilder`, decimals enabled), with progressive hints on wrong
   attempts. A second free-response question ("how would you find the max?") is
   AI-graded via [`lib/aiGrade.ts`](../../src/lib/aiGrade.ts); on success it shows
   a fixed "ideal solution" line.
3. `pb-slide-2-optimize` (problem, `boxOptimize`; 8.5 × 11) — differentiate
   `V(x)` with the calculator, find the critical cut (rejecting the degenerate
   root), and read off the maximum volume.
4. `pb-slide-3-transfer` (problem, `boxTransfer`; 12 × 12) — a transfer task on a
   fresh square sheet: find the optimal cut and the maximum volume as numeric
   inputs, with hints toward the derivative method. The volume formula is **not**
   shown, so the learner solves it fully from scratch.

All problem slides are `attempts: "unlimited"`.

## Components and math

- `PaperBoxExplorerSlide` — the cut/fold animation. Built around a single
  persistent SVG with a constant `viewBox`; the flat-paper and folded-box layers
  crossfade by opacity (avoids the layout collapse that an earlier two-SVG
  version caused). Uses the `useTween` rAF hook for smooth, distinct cut and fold
  phases.
- `BoxVolumeDeriveSlide`, `BoxOptimizeSlide`, `BoxTransferSlide` — the three
  problem slides above.
- `IsoBox.tsx` — reusable isometric render of the folded box; accepts `baseW` /
  `baseL` for rectangular bases.
- `paperBox.ts` — centralizes the math + isometric projection: generalized for
  rectangular sheets (`volumeCoefficients`, `volumeDerivativeCoefficients`,
  `boxVolume`, `optimalCut`, `volumeCriticalCuts`, `maxVolume`, `fmt`,
  `isoProject`, `polyPoints`, `buildBox`). Covered by `paperBox.test.ts` for
  both 8.5 × 11 and 12 × 12 sheets.

## Grading details

- Volume/derivative builders grade via `matchesPolynomial` (algebraic
  equivalence by sampling); numeric answers via `matchesNumber`.
- `BoxVolumeDeriveSlide` provides escalating hints (rectangular prism → `l·w·h` →
  `11 − 2x` → adds `8.5 − 2x` → full formula) and AI-grades the free-response
  "find the max" step with a strict rubric requiring both differentiating AND
  setting the derivative to zero.
- Correct answers blink green via the shared `CorrectFlash` component.

## Related

- Slide schema: [`02-content-schema.md`](02-content-schema.md)
- AI grading + fallback: [`08-applications-scenarios.md`](08-applications-scenarios.md)
  (the scenario FRQ steps share the same `aiGrade.ts` path)
