# Excellent OpenAI proxy (Cloudflare Worker)

A tiny proxy that lets the static web app use OpenAI without shipping the API
key to the browser. The real key lives here as a Worker secret; the browser
authenticates each request with the signed-in user's Firebase ID token, which
this Worker verifies before forwarding to OpenAI.

## One-time setup

```bash
cd worker
npm install
npx wrangler login                     # free Cloudflare account
npx wrangler secret put OPENAI_API_KEY # paste the real sk-... key
```

Edit [wrangler.toml](wrangler.toml):

- `FIREBASE_PROJECT_ID` must match your Firebase project (already set).
- `ALLOWED_ORIGINS` must list your deployed Hosting origins (and any local
  origin you test the production build on).

## Deploy

```bash
npm run deploy   # -> prints https://excellent-openai-proxy.<subdomain>.workers.dev
```

Then point the web app at it (in the repo root `.env.production.local`):

```bash
VITE_OPENAI_API_KEY=
VITE_OPENAI_BASE_URL=https://excellent-openai-proxy.<subdomain>.workers.dev/v1
```

The app calls `POST {VITE_OPENAI_BASE_URL}/chat/completions`; this Worker accepts
any path ending in `/chat/completions`.

## Local dev

```bash
echo 'OPENAI_API_KEY=sk-...' > .dev.vars   # git-ignored
npm run dev                                 # http://localhost:8787
```

## How auth works

1. The browser sends `Authorization: Bearer <Firebase ID token>`.
2. The Worker verifies the JWT against Google's public keys, checking that
   `aud` and `iss` match `FIREBASE_PROJECT_ID` and that it hasn't expired.
3. On success it forwards the body to OpenAI with the real key; otherwise 401.
