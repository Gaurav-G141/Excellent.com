/**
 * OpenAI wiring for the Applications tab.
 *
 * This is used ONLY to generate "mad-lib" narrative flavor and to reword problems
 * to a target difficulty — never the math. Every caller degrades gracefully when
 * AI is unavailable (no key, network/billing error, bad output), so the app keeps
 * working off the built-in static themes and base phrasing.
 *
 * ⚠️ SECURITY: a Vite app ships every `VITE_*` value inside the public JS bundle,
 * so a raw `VITE_OPENAI_API_KEY` would be visible to anyone who opens the site.
 * Two modes are supported:
 *   - Direct (local dev / trusted demo): set `VITE_OPENAI_API_KEY` to the real key;
 *     requests go straight to OpenAI with that key as the Bearer token.
 *   - Proxy (public deploy): leave `VITE_OPENAI_API_KEY` empty and set
 *     `VITE_OPENAI_BASE_URL` to a server proxy. No secret ships in the bundle;
 *     each request is authenticated with the signed-in user's Firebase ID token,
 *     which the proxy verifies before attaching the real key. See docs/openai-setup.md.
 */

import { auth } from './firebase'

/** The explicit base-URL override (unset means talk to OpenAI directly). */
const RAW_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL

/** Where to send chat-completion requests. Override to point at a proxy. */
const BASE_URL = (RAW_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')

/** Real API key for direct mode. Empty string means "no direct key". */
const API_KEY = (import.meta.env.VITE_OPENAI_API_KEY ?? '').trim()

/** Model to use. Override with VITE_OPENAI_MODEL for higher quality / cost. */
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

/**
 * Proxy mode: no raw key in the bundle, but a proxy base URL is configured. In
 * this mode we authenticate with the user's Firebase ID token instead of a key.
 */
const PROXY_MODE = API_KEY.length === 0 && !!RAW_BASE_URL

/**
 * True when AI can be attempted: either a direct key is present, or a proxy is
 * configured (auth then comes from the Firebase ID token). Calls may still fail
 * later (no signed-in user, network/billing error), in which case callers fall back.
 */
export const aiConfigured = API_KEY.length > 0 || PROXY_MODE

// ── Minimal JSON-Schema builder ──────────────────────────────────────────────
// Mirrors the small surface the call sites used before (Schema.object / .string /
// .array) but emits plain JSON Schema suitable for OpenAI structured outputs in
// `strict` mode (every object lists all keys in `required` and forbids extras).

type JsonSchema = Record<string, unknown>

export const Schema = {
  string(): JsonSchema {
    return { type: 'string' }
  },
  boolean(): JsonSchema {
    return { type: 'boolean' }
  },
  array(opts: { items: JsonSchema }): JsonSchema {
    return { type: 'array', items: opts.items }
  },
  object(opts: { properties: Record<string, JsonSchema> }): JsonSchema {
    return {
      type: 'object',
      properties: opts.properties,
      required: Object.keys(opts.properties),
      additionalProperties: false,
    }
  },
}

/** The tiny slice of the old model surface the callers rely on. */
export interface JsonModel {
  generateContent: (
    prompt: string,
  ) => Promise<{ response: { text: () => string } }>
}

/** Per-model tuning. `temperature` defaults to 1.1 (diverse creative output);
 *  classification/moderation callers should pass 0 for deterministic answers. */
export interface JsonModelOptions {
  temperature?: number
}

/**
 * Build a JSON-structured model bound to `responseSchema`, or null if no API key
 * is configured. The returned `generateContent` throws on any HTTP/parse failure
 * so callers fall back; it never silently returns garbage.
 */
export function getJsonModel(
  responseSchema: JsonSchema,
  options?: JsonModelOptions,
): JsonModel | null {
  if (!aiConfigured) return null

  const temperature = options?.temperature ?? 1.1

  return {
    async generateContent(prompt: string) {
      // Direct mode uses the raw key; proxy mode uses the signed-in user's
      // Firebase ID token, which the proxy verifies before adding the real key.
      let bearer = API_KEY
      if (PROXY_MODE) {
        const token = await auth?.currentUser?.getIdToken()
        if (!token) throw new Error('AI proxy requires a signed-in user.')
        bearer = token
      }

      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify({
          model: MODEL,
          // Default high temperature gives diverse, surprising real-world
          // settings; moderation/classification callers override with 0.
          temperature,
          messages: [{ role: 'user', content: prompt }],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'response',
              schema: responseSchema,
              strict: true,
            },
          },
        }),
      })

      if (!res.ok) {
        throw new Error(`OpenAI request failed: ${res.status} ${res.statusText}`)
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[]
      }
      const content = data.choices?.[0]?.message?.content ?? ''
      return { response: { text: () => content } }
    },
  }
}
