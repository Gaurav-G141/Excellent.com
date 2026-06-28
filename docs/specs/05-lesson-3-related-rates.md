# Lesson 3: Related Rates and Motion

Lesson id `related-rates`, content in `content/lessons/related-rates.json`, rendered
through the existing `/lessons/:lessonId` plumbing. Built in the style of Lessons 1–2:
JSON-driven slides, `SlideRenderer` dispatch, `GraphCanvas`/`DraggableGraphPoint` for
plotted demos, `CorrectFlash` + `FeedbackPopup` for grading, and the rAF + easing
animation pattern.

## Slides

1. **Expanding circle** (`expandingCircle`, demo) — a geometric SVG circle with a radius
   slider and a "Grow it" animation. A highlighted rim of width `dr` is the added area
   `dA`; readouts show `A = πr²`, `C = 2πr`, `dA`, and the formula `dA = 2πr · dr`.
2. **Relate the rates** (`relatedRates`, problem) — randomizes among sphere / square /
   cube with random integer size and rate on load. Numeric type-in graded with a
   π-aware evaluator, so `72pi`, `72π`, `72*pi`, and `226.19` are all accepted.
3. **Velocity and acceleration** (`motionVectors`, demo) — parametric path `(x(t), y(t))`
   with an animated bug, a teal velocity vector `s′(t)` and a coral acceleration vector
   `s″(t)`, a legend, play, and a `t` scrubber.
4. **Acceleration at an instant** (`secondDerivative`, problem) — `s(t)` shown as an
   equation with a bug animating along a 1-D track. Asks `s″(t₀)`; graded numerically.
5. **Intermediate Value Theorem** (`intermediateValueTheorem`, demo) — drag A and B on
   the curve, enter a target `k` between `f(a)` and `f(b)`, and reveal the point `c`
   where `f(c) = k` (via `findWhereEquals`).
6. **Apply the IVT** (`ivtProblem`, problem) — equation + grid-point endpoints, two
   parts: (1) multiple-choice for the value guaranteed on `[a, b]`, (2) numeric `c` with
   `f(c) =` that value.
7. **Review** — two randomized on-topic questions appended via
   `randomQuestions: { kind: 'relatedRates', count: 2 }`: one related-rates, one
   kinematics (`generateLesson3Questions`).

## Shared infrastructure

- `src/types/lesson.ts`: `appendRandomQuestions?: boolean` replaced by
  `randomQuestions?: { kind: 'derivatives' | 'relatedRates'; count: number }`. New slide
  config interfaces for each Lesson 3 component.
- `src/utils/polynomial.ts`: `secondDerivativeCoefficients`, `findWhereEquals`.
- `src/utils/expression.ts`: `pi` / `π` recognized as a constant; `evaluateNumericExpression`
  and `matchesNumber` for π-aware numeric grading.
- `src/utils/generateQuestion.ts`: `generateLesson3Questions` with related-rates and
  kinematics generators plus a `t`-polynomial formatter.
- `src/lessons/index.ts`: lesson registered; icon `Δ`; `prerequisiteLessonId` drives the
  unlock order.

## Lesson gating

Lessons unlock in course order: the first is always open; each subsequent lesson unlocks
once the previous is completed, and completed lessons stay open. Enforced on the home
page (locked cards) and guarded in `LessonPlayer` for direct navigation.

## Verification

- `npm run build` (tsc + vite) green.
- Throwaway `tsx` script confirmed related-rates values, `s″(t₀)`, `findWhereEquals`
  roots, and π-aware grading (15/15 checks passed).

## Related

- Next lessons: [`06-lesson-4-exponents-product-rule.md`](06-lesson-4-exponents-product-rule.md),
  [`07-paper-box-lesson.md`](07-paper-box-lesson.md).
- Real-world word problems for these concepts:
  [`08-applications-scenarios.md`](08-applications-scenarios.md).
- Drilling these topics: [`09-practice.md`](09-practice.md).
