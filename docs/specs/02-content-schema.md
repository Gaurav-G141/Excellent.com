# Spec 02 — Content Schema (Slides 0–7)

## Purpose

JSON-driven lesson content for the Derivatives lesson. All eight slides in [`content/lessons/derivatives-basics.json`](../../content/lessons/derivatives-basics.json).

## Slides 0–5

See prior sections: rate of change, greatest derivative, draggable secant, zoom derivative, limit secant demo, secant-to-tangent.

## Slide 6 — `horizontalCritical` (demo)

- **Title:** Critical points and zero slope
- **Polynomial:** `[2.7, 1.225, -2.345, 1.935, -0.725, 0.1]` (quintic)
- **Viewport:** `{ xMin: 0, xMax: 3, yMin: 2.5, yMax: 3.15 }`
- **Interaction:** Horizontal line slider; when line touches curve at a critical point, show f′(x) = 0 message
- **Critical points:** local max (x ≈ 0.5), inflection critical (x ≈ 1.4), local min (x ≈ 2.5)

## Slide 7 — `derivativeCriticalPoints` (problem)

- **Title:** Find every critical point
- **Same f(x)** as slide 6; stacked graphs for f(x) and f′(x)
- **Task:** Tap every x where f′(x) = 0 on the derivative graph (3 critical points)
- **Correct:** All critical x-values selected; green flash + Continue

## Acceptance criteria

- [x] 8 slides load in lesson player
- [x] Slide 6 horizontal line demo with max/min/critical feedback
- [x] Slide 7 dual-graph critical point selection
