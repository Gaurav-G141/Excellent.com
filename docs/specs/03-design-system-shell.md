# Spec 03 — Design system, app shell, and lesson shell

Status: current. Covers the design tokens, the app-wide shell (header + tab
navigation + modal), and the lesson player shell.

## Design tokens

Defined in [`src/index.css`](../../src/index.css). The palette is a "graphing
notebook": cool paper, indigo accent, coral + teal curve colors.

- Type: `--font-display` (Space Grotesk), `--font-sans` (IBM Plex Sans),
  `--font-mono` (IBM Plex Mono, used for math/data).
- Text/surface: `--ink` `#131a26`, `--text` `#3f4a5c`, `--text-h` `#131a26`,
  `--text-muted` `#6b7689`, `--bg` `#edf0f6`, `--surface` `#ffffff`,
  `--surface-2` `#f5f7fc`, `--border` `#e2e7f0`, `--code-bg` `#eef1f8`.
- Accent: `--accent` `#4f46e5`, `--accent-hover` `#4338ca`, `--accent-bg`,
  `--accent-ring`.
- Curves/feedback: `--tangent-arrow` `#f0612f` (coral), `--secant-line`
  `#0f9488` (teal), `--success-flash` (green blink), `--error` `#dc2626`,
  `--error-bg`.
- Shape: `--radius` 16px, `--radius-sm` 12px, plus `--shadow-sm/-md/-pop`.

Global rules also include a styled range slider (the primary tactile control in
lessons), `:focus-visible` outlines, and a `prefers-reduced-motion` block that
collapses animations.

## App shell

The app is a mobile-sized SPA: `#root` is centered at `max-width: 480px` with a
surface card and shadow. Shared chrome:

- [`AppHeader`](../../src/components/AppHeader.tsx) — top bar (title, account /
  sign-out, link to Interests).
- [`TabNav`](../../src/components/TabNav.tsx) — bottom tab navigation across
  Lessons / Practice / Applications / Scrapbook, with unlock gating (Practice
  after lesson 1, Applications after `derivative-rules`).
- [`Modal`](../../src/components/Modal.tsx) — shared modal/dialog.
- [`src/components/tools/`](../../src/components/tools/) — embeddable learner
  tools (`Calculator`, `QuadraticSolver`) with their own pure logic modules.

Routing for these screens is in [`src/App.tsx`](../../src/App.tsx); see
[`01-firebase-emulator.md`](01-firebase-emulator.md).

## Lesson player shell

Implemented in
[`src/components/lesson/LessonPlayer.tsx`](../../src/components/lesson/LessonPlayer.tsx)
(reached at `/lessons/:lessonId` from the home page):

- 480px-wide centered layout, lesson title + exit.
- A [`ProgressBar`](../../src/components/lesson/ProgressBar.tsx) across the slides.
- Slide area rendered by
  [`SlideRenderer`](../../src/components/lesson/SlideRenderer.tsx) (graph SVG,
  copy, CTA).
- Problem feedback via
  [`FeedbackPopup`](../../src/components/lesson/FeedbackPopup.tsx); correct
  answers blink with [`CorrectFlash`](../../src/components/lesson/CorrectFlash.tsx).
- Shared interactive inputs:
  [`PolynomialBuilder`](../../src/components/lesson/PolynomialBuilder.tsx) (the
  "polynomial playground" calculator, with optional decimal support) and the
  end-of-lesson [`LessonQuiz`](../../src/components/lesson/LessonQuiz.tsx) for
  `randomQuestions`.

Graph rendering primitives live in `src/components/graph/` (`GraphCanvas`,
`DraggableGraphPoint`).

## Related

- Slide schema and component list: [`02-content-schema.md`](02-content-schema.md)
