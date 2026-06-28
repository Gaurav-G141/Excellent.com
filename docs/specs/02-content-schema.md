# Spec 02 — Lesson content schema

Status: current. Describes the JSON schema lessons are authored in, and the
specifics of the first lesson (`derivatives-basics`). Per-lesson detail for the
others is in specs [04](04-lesson-2-rules.md), [05](05-lesson-3-related-rates.md),
[06](06-lesson-4-exponents-product-rule.md), and [07](07-paper-box-lesson.md).

## Where content lives

- JSON files in [`content/lessons/`](../../content/lessons/), statically imported
  and registered in [`src/lessons/index.ts`](../../src/lessons/index.ts).
- TypeScript types in [`src/types/lesson.ts`](../../src/types/lesson.ts).
- Rendered by [`SlideRenderer`](../../src/components/lesson/SlideRenderer.tsx),
  which maps each slide's (`type`, `component`) pair to a React component in
  `src/components/slides/`.

## Lesson shape

```jsonc
{
  "id": "derivatives-basics",
  "title": "Derivatives",
  "subject": "Calculus BC",
  "randomQuestions": { "kind": "derivatives", "count": 3 }, // optional mastery quiz
  "slides": [ /* Slide[] */ ]
}
```

- `randomQuestions` (optional) appends a generated end-of-lesson mastery quiz
  (`derivatives-basics` → 3, `related-rates` → 2). Lessons without it (e.g.
  `derivative-rules`, `exponents-product-rule`, `paper-box`) end on their last
  slide.

## Slide shape

Every slide has an `id`, a `type` (`"demo"` or `"problem"`), a `component`
string, a `title`, a `body`, and a `config` object specific to that component.

- **Demo slides** are non-graded explorations and carry a `ctaLabel` (the
  continue button). The component receives `onContinue`.
- **Problem slides** are graded; they carry `feedback` (`{ correct, wrong }`,
  where messages may use `{placeholders}`) and `attempts` (e.g. `"unlimited"`).
  The component receives `onCorrect` and advances on a correct answer (with the
  shared `CorrectFlash` green blink). An empty `feedback.correct` advances
  silently.

`SlideRenderer` falls back to an "Unknown slide" continue card if no
(`type`, `component`) branch matches.

## Registered components

Demo: `rateOfChangeArrow`, `draggableSecant`, `limitSecantDemo`,
`horizontalCritical`, `powerRuleExponent`, `sumRule`, `chainRule`,
`meanValueTheorem`, `expandingCircle`, `motionVectors`,
`intermediateValueTheorem`, `exponentialTriangle`, `nPowerXAnimation`,
`polynomialPlayground`, `paperBoxExplorer`.

Problem: `greatestDerivative`, `secantZoomDerivative`, `secantToTangent`,
`derivativeCriticalPoints`, `dragMatch`, `typeInDerivative`,
`polynomialDerivative`, `mvtMultiPart`, `relatedRates`, `secondDerivative`,
`ivtProblem`, `exponentialTriangleQuestion`, `productRuleMultiPart`,
`multipleChoice`, `boxVolumeDerive`, `boxOptimize`, `boxTransfer`.

(The exact list is the set of branches in `SlideRenderer.tsx` — keep them in sync
when adding a component.)

## `derivatives-basics` (8 slides)

1. `rateOfChangeArrow` (demo) — animated tangent arrow along a cubic; "how fast
   is this changing?".
2. `greatestDerivative` (problem) — tap the steepest point.
3. `draggableSecant` (demo) — drag two points; secant vs. the curve, coincide to
   see the tangent.
4. `secantZoomDerivative` (problem) — zoom in and estimate the slope
   (`tolerance: 0.15`).
5. `limitSecantDemo` (demo) — the derivative as a limit; a second point slides in.
6. `secantToTangent` (problem) — drag P toward the fixed point and estimate the
   slope.
7. `horizontalCritical` (demo) — slide a horizontal line to where the tangent is
   flat; `f'(x) = 0`. Quintic with three critical points (max ≈ 0.5, critical ≈
   1.4, min ≈ 2.5).
8. `derivativeCriticalPoints` (problem) — same `f`, stacked `f`/`f'` graphs; tap
   every zero of `f'`.

Plus a 3-question generated mastery quiz from `randomQuestions`.

## Related

- App shell and design tokens: [`03-design-system-shell.md`](03-design-system-shell.md)
- Practice reuses `ProblemSlide` + these components:
  [`09-practice.md`](09-practice.md)
