# Spec 00 — Overview

## Purpose

This document defines the scope, architecture, and build order for **Excellent.com** — a minimum viable Brilliant.org-style learning app focused on a single Calculus BC lesson: **Derivatives**.

## User Persona

**Thomas** — 16-year-old Calc BC senior who needs deep conceptual understanding of derivatives, not rote procedures. He learns best through interactive visual manipulation rather than lectures.

## MVP Scope

### In scope

- One lesson: **Derivatives** (`derivatives-basics`)
- Brilliant-style interactive slides alternating demos and problems, plus 3 final assessment problems
- JSON-driven lesson content
- Firebase Auth (email/password) connected to a Firebase project
- Firestore progress persistence (exact slide index, lesson completion)
- Mobile-sized responsive layout (~480px max-width)
- Sequential lesson gating (architecture supports future lessons; MVP ships one)

### Out of scope

- AI features (voices, AI-generated content/animations)
- Energy/credits system
- Lessons beyond Derivatives
- Native mobile / PWA / offline
- Social features, leaderboards, payments
- Admin CMS (content edited in JSON files directly)
- OAuth providers (email/password only for MVP)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 8 |
| Routing | react-router-dom |
| Math rendering | KaTeX (future specs) |
| Backend | Firebase Auth + Firestore |
| Local dev | Vite dev server + Firebase CLI |
| Content | JSON files in `content/lessons/` |
| Styling | Plain CSS / CSS modules |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React / Vite Frontend                 │
│  ┌──────────┐ ┌───────────┐ ┌──────────────────────┐  │
│  │ Auth UI  │ │ CourseMap │ │ LessonPlayer         │  │
│  │ Login/   │ │           │ │  └─ SlideRenderer    │  │
│  │ Signup   │ │           │ │       └─ MathGraph   │  │
│  └────┬─────┘ └─────┬─────┘ └──────────┬───────────┘  │
└───────┼─────────────┼──────────────────┼───────────────┘
        │             │                  │
        ▼             ▼                  ▼
┌───────────────┐ ┌─────────────────────────────────────┐
│ Firebase Auth │ │ Firestore                           │
│               │ │  users/{uid}                        │
│               │ │  progress/{uid}/lessons/{lessonId}  │
│               │ │  courses/default                    │
└───────────────┘ └─────────────────────────────────────┘

┌───────────────────────┐
│ content/lessons/*.json│  (bundled at build time)
└───────────────────────┘
```

## Key Architectural Decisions

1. **Content-driven slides** — All slide text, problem config, and feedback strings live in JSON. React components are typed renderers keyed by `slide.type` and `slide.component`.

2. **Firebase via env vars** — `src/lib/firebase.ts` initializes from `VITE_FIREBASE_*` values in `.env`.

3. **No AI** — All animations are hand-coded (SVG/CSS). Random polynomials use deterministic seeded PRNG from slide `seed`.

4. **Mobile-sized, not mobile-native** — Max-width ~480px centered layout, touch-friendly hit targets, no PWA requirements.

5. **Multi-lesson-ready data model** — MVP ships one lesson but Firestore schema and course map support sequential gating for future lessons.

## Project Structure

```
Excellent.com/
├── docs/specs/              # Specification documents
├── content/lessons/         # JSON lesson files
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── .firebaserc
├── .env.example
├── src/
│   ├── lib/firebase.ts
│   ├── types/
│   ├── hooks/
│   ├── contexts/
│   ├── pages/
│   ├── components/
│   └── utils/
└── package.json
```

## Spec Index

| Spec | Title | Status |
|------|-------|--------|
| 00 | Overview (this document) | Active |
| 01 | Firebase Emulator & Auth | Active |
| 02 | JSON Content Schema | Planned |
| 03 | Design System & App Shell | Planned |
| 04 | Lesson Engine | Planned |
| 05 | Math Graph Core | Planned |
| 06 | Demo Slides | Planned |
| 07 | Problem Slides | Planned |
| 08 | Final Assessment | Planned |
| 09 | UI Mockups | Planned |

## Build Order (Implementation)

1. **Spec 01** — Firebase emulator + authentication ← *current*
2. Spec 03 — App shell, routing, design tokens
3. Spec 02 + 04 — Content schema + lesson engine
4. Spec 05 — Math graph core
5. Spec 06 + 07 — Demo and problem slides
6. Spec 08 — Final assessment + lesson completion
7. Spec 09 — UI mockup reference images
8. Integration, polish, emulator → production swap test

## Acceptance Criteria (Spec 00)

- [x] Scope and out-of-scope documented
- [x] Architecture and folder structure defined
- [x] Spec index and build order established
