/**
 * Cloudflare Worker that proxies OpenAI chat-completion requests for the
 * Excellent app's Applications tab.
 *
 * Why this exists: the web app is a static Vite bundle, so anything shipped to
 * the browser is public. The real OpenAI key lives here as a Worker secret
 * (`OPENAI_API_KEY`) and never reaches the client. The browser authenticates
 * each call with the signed-in user's Firebase ID token, which this Worker
 * verifies before forwarding to OpenAI, so only logged-in users of this project
 * can spend the key.
 */

import { createRemoteJWKSet, jwtVerify } from 'jose'

interface Env {
  /** Secret: the real OpenAI API key. Set via `wrangler secret put OPENAI_API_KEY`. */
  OPENAI_API_KEY: string
  /** The Firebase project id; ID tokens must carry it as both `aud` and in `iss`. */
  FIREBASE_PROJECT_ID: string
  /** Comma-separated list of browser origins allowed to call this proxy. */
  ALLOWED_ORIGINS: string
  /** Optional comma-separated allowlist of OpenAI model ids. Empty = allow any. */
  OPENAI_MODEL_ALLOWLIST?: string
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * Google's public keys for Firebase ID tokens. `createRemoteJWKSet` caches the
 * fetched keys in-isolate and refreshes them as needed, so this is cheap to keep
 * at module scope.
 */
const JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
)

function splitList(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** CORS headers; echoes the request origin only if it is in the allowlist. */
function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
  if (origin && splitList(env.ALLOWED_ORIGINS).includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const cors = corsHeaders(origin, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)
    if (request.method !== 'POST' || !url.pathname.endsWith('/chat/completions')) {
      return json({ error: 'Not found' }, 404, cors)
    }

    // ── Verify the caller's Firebase ID token ─────────────────────────────────
    const authz = request.headers.get('Authorization') || ''
    const token = authz.startsWith('Bearer ') ? authz.slice(7).trim() : ''
    if (!token) return json({ error: 'Missing bearer token' }, 401, cors)

    try {
      await jwtVerify(token, JWKS, {
        issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
        audience: env.FIREBASE_PROJECT_ID,
      })
    } catch {
      return json({ error: 'Invalid or expired token' }, 401, cors)
    }

    // ── Read + lightly validate the body ──────────────────────────────────────
    let payload: Record<string, unknown>
    try {
      payload = (await request.json()) as Record<string, unknown>
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors)
    }

    // Defense-in-depth: even a valid user can't request an expensive model if an
    // allowlist is configured.
    const allowlist = splitList(env.OPENAI_MODEL_ALLOWLIST)
    if (allowlist.length > 0) {
      const model = typeof payload.model === 'string' ? payload.model : ''
      if (!allowlist.includes(model)) {
        return json({ error: 'Model not allowed' }, 403, cors)
      }
    }

    // ── Forward to OpenAI with the real key ───────────────────────────────────
    let upstream: Response
    try {
      upstream = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      })
    } catch {
      return json({ error: 'Upstream request failed' }, 502, cors)
    }

    const text = await upstream.text()
    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        ...cors,
      },
    })
  },
}
