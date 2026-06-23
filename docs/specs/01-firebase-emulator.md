# Spec 01 — Firebase & Authentication

## Purpose

Define Firebase configuration, authentication flow, Firestore data model, and security rules. This spec covers everything needed for user accounts and session management.

## Firebase Configuration

### Files

| File | Purpose |
|------|---------|
| `firebase.json` | Firestore rules and indexes deployment config |
| `.firebaserc` | Firebase CLI project alias |
| `firestore.rules` | Security rules for users and progress |
| `firestore.indexes.json` | Composite indexes (empty for MVP) |
| `.env.example` | Environment variable template |

### Environment Variables

Copy `.env.example` to `.env`, then fill in values from the Firebase Console (Project Settings → Your apps → Web app) or run:

```bash
firebase apps:sdkconfig WEB
```

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Frontend dev server |
| `deploy:rules` | `firebase deploy --only firestore:rules` | Deploy Firestore security rules |

### Initial Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Link the CLI: `firebase login` and `firebase use <project-id>`.
3. Enable **Authentication → Email/Password**.
4. Create a **Firestore** database.
5. Register a **Web app** and copy its config into `.env`.
6. Deploy rules: `npm run deploy:rules`.

## Authentication

### Method

Email/password only for MVP. No OAuth.

### Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/login` | Public | Sign in |
| `/signup` | Public | Create account |
| `/` | Protected | Home / course map (placeholder until Spec 03) |

Unauthenticated users visiting protected routes are redirected to `/login`.

### Auth Flow

1. **Sign up** — `createUserWithEmailAndPassword`, then create `users/{uid}` doc in Firestore with displayName and email.
2. **Login** — `signInWithEmailAndPassword`.
3. **Session** — `onAuthStateChanged` listener in `AuthProvider` context.
4. **Logout** — `signOut`, redirect to `/login`.

### Auth Context API

```typescript
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### Validation

- Email: required, valid format
- Password: minimum 6 characters (Firebase default)
- Display name: required on signup

## Firestore Data Model

### `users/{uid}`

Created on signup.

```typescript
{
  displayName: string;
  email: string;
  createdAt: Timestamp;
}
```

### `progress/{uid}/lessons/{lessonId}`

Created when user first enters a lesson (future spec).

```typescript
{
  currentSlideIndex: number;       // 0-based, exact slide to resume
  completedSlideIndices: number[]; // slides passed
  lessonCompleted: boolean;
  updatedAt: Timestamp;
}
```

### `courses/default`

Seeded manually (future spec).

```typescript
{
  title: string;           // "Calculus BC"
  lessonOrder: string[];   // ["derivatives-basics"]
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /progress/{userId}/lessons/{lessonId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## SDK Initialization

`src/lib/firebase.ts`:

1. Initialize Firebase app from env vars.
2. Export `auth` and `db` (Firestore) instances.

## Testing Auth (Manual)

1. Copy `.env.example` to `.env` and fill in Firebase web app config.
2. Run `npm run deploy:rules`.
3. Run `npm run dev`.
4. Open `http://localhost:5173/signup` — create an account.
5. Verify redirect to home; user display name shown.
6. Confirm user in Firebase Console (Auth tab) and `users/{uid}` in Firestore.
7. Sign out, sign back in at `/login`.
8. Refresh page — session persists.

## Acceptance Criteria (Spec 01)

- [x] Firebase config files present
- [x] Auth context with signUp, signIn, signOut
- [x] Login and signup pages functional
- [x] Protected route redirects unauthenticated users
- [x] User document created in Firestore on signup
- [x] `.env.example` documents all required variables

## Open Questions

- None for auth MVP. Progress persistence deferred to Spec 04.
