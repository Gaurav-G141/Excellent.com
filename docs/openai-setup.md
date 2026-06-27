# OpenAI setup (Applications tab AI)

The Applications tab uses OpenAI to (a) reword each problem to the learner's
difficulty level and (b) generate extra "mad-lib" narrative themes. The math is
always computed in code — the AI only touches wording. If no key is configured,
the app silently falls back to base phrasing and the built-in static themes, so
nothing breaks; you just lose the adaptive rewrites.

## What you need to do manually

1. **Get a key:** https://platform.openai.com/api-keys → "Create new secret key".
2. **Put it in your local `.env`** (create the file in the project root if it
   doesn't exist — it is git-ignored). Add:

   ```bash
   VITE_OPENAI_API_KEY=sk-...your key here...
   # optional:
   VITE_OPENAI_MODEL=gpt-4o-mini
   ```

3. **Restart the dev server** (`npm run dev`). Vite only reads `.env` at startup,
   so the key won't take effect until you restart.

That's the whole setup. `.env.example` documents these vars for teammates.

## Choosing a model

`VITE_OPENAI_MODEL` defaults to `gpt-4o-mini` (cheap and fast, good enough for
rewording). For higher quality, set it to a stronger model, e.g.:

```bash
VITE_OPENAI_MODEL=gpt-4.1
```

Any model that supports **Structured Outputs** (JSON Schema) works; that's how we
guarantee the response shape. If you pick a model that doesn't, calls will fail
and the app falls back to base phrasing.

## ⚠️ Important: the key is exposed in the browser bundle (direct mode)

This is a client-side Vite app, so **every `VITE_*` value is compiled into the
public JavaScript** that ships to users. In direct mode, anyone visiting the site
can read `VITE_OPENAI_API_KEY` from the bundle and run up your bill. Direct mode
is therefore for **local dev / trusted demos only**.

## Deploying publicly: proxy mode (Cloudflare Worker)

For a public deploy, do **not** ship the raw key. The repo includes a Cloudflare
Worker proxy in [`worker/`](../worker/README.md) that holds the real key as a
secret and authenticates each request with the signed-in user's **Firebase ID
token** (only your logged-in students can spend the key). The browser bundle then
contains no usable secret.

How the app picks a mode (see `src/lib/ai.ts`):

- `VITE_OPENAI_API_KEY` set -> **direct mode** (Bearer is the raw key).
- key empty and `VITE_OPENAI_BASE_URL` set -> **proxy mode** (Bearer is the
  user's Firebase ID token; the Worker verifies it and adds the real key).

### Steps

1. **Deploy the Worker** (one time): follow [`worker/README.md`](../worker/README.md).
   In short: `cd worker && npm install && npx wrangler login`, set the secret with
   `npx wrangler secret put OPENAI_API_KEY`, confirm `ALLOWED_ORIGINS` /
   `FIREBASE_PROJECT_ID` in `worker/wrangler.toml`, then `npm run deploy`. Note the
   printed `https://...workers.dev` URL.

2. **Point the production build at it.** Copy `.env.production.example` to
   `.env.production.local` (git-ignored) and set:

   ```bash
   VITE_OPENAI_API_KEY=
   VITE_OPENAI_BASE_URL=https://excellent-openai-proxy.<subdomain>.workers.dev/v1
   ```

   The empty key is important: Vite also loads your dev `.env` during a production
   build, so this blank value overrides it and keeps the dev key out of the
   bundle.

3. **Build and deploy hosting** (this never publishes the key):

   ```bash
   npm run deploy:web   # = npm run build && firebase deploy --only hosting
   ```

4. **Verify no key leaked:** search the built bundle and confirm only the proxy
   URL is present:

   ```bash
   grep -r "sk-" dist/assets || echo "no raw key in bundle"
   grep -ro "workers.dev" dist/assets | head -1
   ```

If the Worker is ever unreachable or the user isn't signed in, the app falls back
to base problem phrasing (the same graceful degradation as having no key at all),
so nothing breaks.

## Safety / cost notes

- Set a **monthly usage limit** in the OpenAI dashboard
  (Settings → Limits) as a backstop.
- The client caps each request at a 6-second timeout and prefetches one problem
  ahead, so a slow or failed call just falls back to base phrasing.

## Testing stickers locally (Spark plan, no Storage)

The motivation stickers feature does **not** use OpenAI image generation or
Firebase Storage. Firebase Storage requires the Blaze (paid) plan, so on the
Spark (free) plan there is no bucket to upload to. Instead, sticker images come
from **Pollinations** — a keyless image URL that renders directly in the browser
— and only the image *URL* (plus metadata) is stored in Firestore at
`stickers/{uid}/items/{itemId}`.

What this means for testing:

- **No OpenAI key is needed for stickers.** (`VITE_OPENAI_API_KEY` still powers
  the Applications-tab problem rewrites, but is unrelated to stickers.)
- **No Storage and no `storage.rules` deploy.** The repo keeps `storage.rules`
  for a future Blaze upgrade, but it is never deployed on Spark.
- **Only the Firestore rules must be live** so the app can read/write
  `stickers/{uid}/items`. They are already covered by `firestore.rules`.
- `SPAWN_CHANCE` in `src/lib/stickers/config.ts` is currently `1`, so a sticker
  spawns on **every** correct answer in the Applications tab (set it back to
  `0.15` for production).

### Getting the Firestore rules live

Normally:

```bash
npm run deploy:rules   # firebase deploy --only firestore:rules
```

If the Firebase CLI login is failing (e.g. `Error: Authentication Error` /
`Unable to authenticate using the provided code`), you can publish the rules with
**zero CLI** straight from the console — this fully unblocks local testing:

1. Open the [Firebase Console](https://console.firebase.google.com/) → your
   project → **Firestore Database** → **Rules**.
2. Paste the contents of `firestore.rules` and click **Publish**.

Then run `npm run dev`, sign in, and solve a problem in the Applications tab — a
crayon sticker should appear in the page margins. Stickers persist in Firestore
and expire after 5 days (`LIFETIME_MS`).

> CLI auth tip: the login failure is environmental (an outdated `firebase-tools`
> against a very new Node). If you'd rather fix the CLI than use the console, run
> it under a Node LTS (`nvm use 22`) or via `npx firebase-tools@latest login
> --reauth`.
