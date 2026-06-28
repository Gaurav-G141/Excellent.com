# Spec 01 — Firebase, Auth, and the Firestore data model

Status: current. Defines Firebase configuration, the email/password auth flow,
the full Firestore data model, and the security rules. (The filename keeps its
historical "emulator" slug; the app talks to real Firebase, not an emulator.)

## Firebase configuration

### Files

- `firebase.json` — Hosting + Firestore rules/indexes deployment config
- `.firebaserc` — Firebase CLI project alias
- [`firestore.rules`](../../firestore.rules) — owner-only rules with per-document
  schema validation (mirrors `src/lib/firestoreValidation.ts`)
- `firestore.indexes.json` — composite indexes
- [`.env.example`](../../.env.example) — environment variable template
- [`src/lib/firebase.ts`](../../src/lib/firebase.ts) — initializes the app and
  exports `auth`, `db`, and `firebaseConfigError`

### Environment variables

Copy `.env.example` to `.env` and fill in the Firebase web config (Console →
Project Settings → Your apps → Web app, or `firebase apps:sdkconfig WEB`):

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

If any are missing, `firebaseConfigError` is set and `App` renders
`FirebaseSetupPage` instead of the router. (OpenAI env vars are documented in
[`../openai-setup.md`](../openai-setup.md).)

### Relevant npm scripts

- `dev` — `vite` dev server
- `deploy:rules` — `firebase deploy --only firestore:rules`
- `deploy:hosting` / `deploy:web` — deploy Hosting (build + deploy for `:web`)

## Authentication

Email/password only (no OAuth). `AuthProvider`
([`src/contexts/AuthContext.tsx`](../../src/contexts/AuthContext.tsx)) tracks the
session via `onAuthStateChanged`. Route protection lives in
`src/components/ProtectedRoute.tsx`.

### Routes (see [`src/App.tsx`](../../src/App.tsx))

- Public-only: `/login`, `/signup`
- Protected: `/`, `/practice`, `/applications`, `/scrapbook`, `/interests`,
  `/lessons/:lessonId`
- `*` → redirect to `/`

### Flow

1. Sign up — `createUserWithEmailAndPassword`, then create `users/{uid}`.
2. Login — `signInWithEmailAndPassword`.
3. Session — `onAuthStateChanged` in `AuthProvider`.
4. Logout — `signOut`.

## Firestore data model

All collections are owner-only and schema-validated. See
[`firestore.rules`](../../firestore.rules) and `firestoreValidation.ts`.

- **`users/{uid}`** — `displayName`, `email`, `createdAt`; streak fields
  (`streakCount`, `lastActiveDate`, `longestStreak`); Applications rating
  (`applicationsRating` 1..15, `applicationsGames`); `interests` (≤12 strings,
  each 1..60 chars).
- **`progress/{uid}/lessons/{lessonId}`** — `currentSlideIndex` (0..1000),
  `lessonCompleted` (bool), `updatedAt`.
- **`practice/{uid}/topics/{topicId}`** — `lastPracticedAt` (timestamp), for the
  Practice review panel.
- **`applications/{uid}/topics/{topicId}`** — `lastSeenAt` (timestamp), for the
  recency-weighted topic picker.
- **`stickers/{uid}/items/{itemId}`** — `subject`, `src`, `provider`
  (`openai`|`pollinations`), `slotIndex` (0..11), `createdAt`, `expiresAt`.
- **`courses/{courseId}`** — read-only in rules; **not used by the client**
  (legacy). Lesson order is defined in code (`src/lessons/index.ts`), not here.

## Security rules

Each `match` allows reads only to the owner and writes only to the owner **and**
when `request.resource.data` passes the matching validator (`validUser`,
`validProgress`, `validPractice`, `validApplicationsActivity`, `validSticker`).
These mirror the TypeScript validators so client and server agree. Run
`firebase-security-rules-auditor` after editing the rules.

## Related

- App shell and routing detail: [`03-design-system-shell.md`](03-design-system-shell.md)
- Per-lesson content: [`02-content-schema.md`](02-content-schema.md) and specs 04–07
