# Excellent.com

A Brilliant-style interactive **Calculus** learning app. Learners work through
hand-built, visual, manipulable lessons (drag a secant into a tangent, fold a
paper box, watch the product rule derive itself), drill with endless generated
practice, and apply the ideas to AI-personalized real-world "scenario" word
problems. Built as a mobile-sized single-page app on React + Firebase, with an
optional OpenAI layer for problem rewriting and free-response grading.

> New here? Start with [`docs/architecture.md`](docs/architecture.md) for the
> full system map, then dip into [`docs/specs/`](docs/specs/) for per-feature
> detail.

## Features

The app is organized into four tabs plus an Interests page (reached from the
header):

- **Lessons** (`/`) — five JSON-driven lessons rendered as sequences of
  interactive demo and problem slides, with Firestore-saved progress, prereq
  gating, and an end-of-lesson mastery quiz:
  - Derivatives, Rules of Derivatives, Related Rates and Motion, Exponents and
    the Product Rule, and the always-open real-world lesson **The Biggest Paper
    Box**.
- **Practice** (`/practice`) — endlessly generated problems per lesson topic,
  rendered through the same slide components, with a spaced-repetition "worth
  reviewing" panel. Unlocks after the first lesson.
- **Applications** (`/applications`) — adaptive, multi-step real-world
  **scenario** problems with an Elo-style difficulty rating. The calculus is
  never named; the AI rewrites the surface story to your level and (optionally)
  themes it around your interests, and a free-response step is AI-graded.
  Unlocks after _Rules of Derivatives_.
- **Scrapbook** (`/scrapbook`) — a gallery of "motivation stickers" earned by
  solving Applications problems (and lost on repeated misses).
- **Interests** (`/interests`) — edit up to 12 interests (AI-moderated on add)
  used to personalize Applications scenarios.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite 8, React Router 7
- **Backend:** Firebase 12 — Auth (email/password) + Cloud Firestore + Hosting
- **AI (optional):** OpenAI Chat Completions (`gpt-4o-mini` by default) with
  strict JSON-schema structured output, called either directly (local dev) or
  through a Cloudflare Worker proxy (production). All AI is degrade-gracefully:
  the app works fully with no key.
- **Content:** JSON lesson files in `content/lessons/`, statically bundled.
- **Styling:** Plain CSS with design tokens in `src/index.css`.
- **Tests:** Vitest 4 + jsdom + Testing Library. **Lint:** oxlint.

## Project structure

```
Excellent.com/
├── content/lessons/        # JSON lesson definitions (5 lessons)
├── docs/                   # Design docs + per-feature specs (see docs/architecture.md)
├── worker/                 # Cloudflare Worker that proxies OpenAI in production
├── firebase.json           # Hosting + Firestore rules/indexes config
├── firestore.rules         # Owner-only access with schema validation
├── .env.example            # Firebase + OpenAI env template
├── src/
│   ├── pages/              # Route screens (Home, Practice, Applications, Scrapbook, Interests, auth)
│   ├── components/         # App shell (AppHeader, TabNav, Modal), lesson/, slides/, applications/, graph/, stickers/, tools/
│   ├── contexts/           # AuthContext, StickerContext
│   ├── lessons/            # Lesson registry + unlock/prereq logic
│   ├── lib/                # firebase, ai, aiGrade, stickers/, firestore validation
│   ├── utils/              # polynomial/expression math, applications/, practice/, generateQuestion
│   └── types/              # Shared TypeScript types
└── package.json
```

## Getting started

Prerequisites: Node 20+ and a Firebase project (Auth + Firestore enabled).

```bash
npm install
cp .env.example .env        # then fill in your Firebase web config
npm run dev                 # http://localhost:5173
```

If the `VITE_FIREBASE_*` values are missing, the app renders a setup page
instead of the router (see `src/pages/FirebaseSetupPage.tsx`).

To enforce the Firestore security rules locally/in your project:

```bash
npm run deploy:rules
```

## Environment variables

All client env vars are `VITE_*` (and therefore compiled into the public
bundle — see the security note below). Templates live in
[`.env.example`](.env.example) and [`.env.production.example`](.env.production.example).

- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` — Firebase web config.
- `VITE_OPENAI_API_KEY` — OpenAI key for **direct mode** (local dev only).
- `VITE_OPENAI_BASE_URL` — set to the Worker URL for **proxy mode** (production).
- `VITE_OPENAI_MODEL` — optional, defaults to `gpt-4o-mini`.

### AI modes

- **Direct (local dev / trusted demo):** set `VITE_OPENAI_API_KEY`. Requests go
  straight to OpenAI with that key.
- **Proxy (public deploy):** leave `VITE_OPENAI_API_KEY` empty and point
  `VITE_OPENAI_BASE_URL` at the Cloudflare Worker. The browser authenticates
  with the signed-in user's Firebase ID token; the Worker holds the real key.

> Security: every `VITE_*` value ships in the browser bundle. A raw
> `VITE_OPENAI_API_KEY` is a real secret and must NOT be deployed publicly — use
> the Worker proxy. The Firebase web API key is not a secret (data is protected
> by Auth + `firestore.rules`). See [`docs/openai-setup.md`](docs/openai-setup.md)
> and [`worker/README.md`](worker/README.md).

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run lint` — oxlint
- `npm run test` — run the Vitest suite once
- `npm run test:watch` — Vitest in watch mode
- `npm run preview` — preview the production build
- `npm run deploy:rules` — deploy Firestore rules only
- `npm run deploy:hosting` — deploy Hosting only
- `npm run deploy:web` — build + deploy Hosting

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — current system map (start here)
- [`docs/specs/`](docs/specs/) — per-feature specs (lessons, app shell, schema,
  scenarios, practice, stickers)
- [`docs/adaptive-difficulty.md`](docs/adaptive-difficulty.md) — the Elo rating
  and AI-rewrite difficulty system
- [`docs/openai-setup.md`](docs/openai-setup.md) — OpenAI direct/proxy setup,
  cost and safety
- [`worker/README.md`](worker/README.md) — the OpenAI proxy Worker

## License

Private project; all rights reserved.
