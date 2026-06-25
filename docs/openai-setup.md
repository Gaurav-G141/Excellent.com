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

## ⚠️ Important: the key is exposed in the browser bundle

This is a client-side Vite app, so **every `VITE_*` value is compiled into the
public JavaScript** that ships to users. Anyone visiting the site can read
`VITE_OPENAI_API_KEY` from the bundle and run up your bill.

- **Local dev / trusted demo:** putting the raw key in `.env` is fine.
- **Public deployment:** do **not** ship the raw key. Stand up a tiny server-side
  proxy that holds the key and forwards requests to OpenAI, then point the app at
  it:

  ```bash
  # the app sends requests here instead of api.openai.com; the proxy adds the key
  VITE_OPENAI_BASE_URL=https://your-proxy.example.com/v1
  VITE_OPENAI_API_KEY=<a token your proxy checks, not your real OpenAI key>
  ```

  The app calls `POST {VITE_OPENAI_BASE_URL}/chat/completions` with an
  `Authorization: Bearer <VITE_OPENAI_API_KEY>` header, so a proxy only needs to
  validate that token, attach the real OpenAI key, and forward the body.

I can build that proxy (e.g. a Firebase Cloud Function, since the project already
uses Firebase) whenever you're ready to deploy publicly — just ask.

## Safety / cost notes

- Set a **monthly usage limit** in the OpenAI dashboard
  (Settings → Limits) as a backstop.
- The client caps each request at a 6-second timeout and prefetches one problem
  ahead, so a slow or failed call just falls back to base phrasing.
