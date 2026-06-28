# Spec 06 — Lesson 4: Exponents and the Product Rule

Status: current. Source of truth is the code; this spec summarizes
[`content/lessons/exponents-product-rule.json`](../../content/lessons/exponents-product-rule.json)
and its slide components in `src/components/slides/`.

## Overview

- Lesson id: `exponents-product-rule`, title "Exponents and the Product Rule",
  subject "Calculus BC".
- Fourth lesson in course order; unlocks after `related-rates`.
- No `randomQuestions` block, so there is no appended mastery quiz; the last two
  slides act as quick checks.

## Slides

1. `l4-slide-0-exp-triangle` (demo, `exponentialTriangle`, `variant: "exp"`) —
   drag a point along `y = eˣ`; the slope triangle has a leg on the x-axis with
   run 1, so the slope equals the height: `d/dx[eˣ] = eˣ`.
2. `l4-slide-1-npowerx` (demo, `nPowerXAnimation`, `base: 2`) — animates
   rewriting any `nˣ` with base `e`, pulling out a factor of `ln(n)` via the
   chain rule.
3. `l4-slide-2-exp-question` (problem, `exponentialTriangleQuestion`,
   `variant: "exp"`, `tolerance: 0.1`) — drag the tangent's x-intercept to build
   the slope triangle, then read off/type the slope of `eˣ`.
4. `l4-slide-3-ln-triangle` (demo, `exponentialTriangle`, `variant: "ln"`) —
   reflect `eˣ` across `y = x` to get `ln x`; the triangle flips so the slope is
   `1/x`.
5. `l4-slide-4-ln-question` (problem, `exponentialTriangleQuestion`,
   `variant: "ln"`, `tolerance: 0.1`) — build the triangle with rise 1 on the
   y-axis, then read off/type the slope of `ln(x)`.
6. `l4-slide-5-playground` (demo, `polynomialPlayground`, `maxDegree: 4`,
   `maxCoefficient: 100`) — build `u(x)` and `v(x)`, then animate the product
   rule `(uv)' = u'v + uv'` on your own functions.
7. `l4-slide-6-product-multipart` (problem, `productRuleMultiPart`) — given
   `u = 2x + 1`, `v = x² + 3`, work the product rule in three builder steps.
8. `l4-slide-7-exp-closing` (problem, `multipleChoice`) — `d/dx[3ˣ]`, correct
   option `ln(3) · 3ˣ` (`correctIndex: 0`).
9. `l4-slide-8-product-closing` (problem, `polynomialDerivative`) — differentiate
   `(x + 2)(3x − 1)`, expected coefficients `[-2, 5, 3]` (i.e. `f'(x) = 6x + 5`).

## Components

- `ExponentialTriangleSlide` / `ExponentialTriangleQuestionSlide` — shared demo +
  problem for the `exp`/`ln` slope-triangle visual.
- `NPowerXAnimationSlide` — the base-change animation.
- `PolynomialPlaygroundSlide` — uses `PolynomialBuilder` to assemble `u`, `v` and
  animate the product rule.
- `ProductRuleMultiPartSlide` — staged builder problem.
- `MultipleChoiceSlide`, `PolynomialDerivativeSlide` — shared closing-check
  components.

All problem slides use `attempts: "unlimited"`; the empty `feedback.correct`
means correct answers advance silently (with the standard green flash).

## Related

- Slide schema: [`02-content-schema.md`](02-content-schema.md)
- Shared polynomial grading utilities: `src/utils/polynomial.ts`,
  `src/utils/expression.ts`
- Applications scenarios for this lesson live in
  `src/utils/applications/scenarios/lesson4.ts` (see
  [`08-applications-scenarios.md`](08-applications-scenarios.md)).
