/**
 * OpenAI wiring for the Applications tab.
 *
 * This is used ONLY to generate "mad-lib" narrative flavor and to reword problems
 * to a target difficulty — never the math. Every caller degrades gracefully when
 * AI is unavailable (no key, network/billing error, bad output), so the app keeps
 * working off the built-in static themes and base phrasing.
 *
 * ⚠️ SECURITY: a Vite app ships every `VITE_*` value inside the public JS bundle,
 * so `VITE_OPENAI_API_KEY` is visible to anyone who opens the site. That is fine
 * for local/dev and trusted demos, but for a public deployment you should put the
 * key behind a tiny server proxy and point `VITE_OPENAI_BASE_URL` at it instead
 * of shipping the raw key. See docs/openai-setup.md.
 */

/** Where to send chat-completion requests. Override to point at a proxy. */
const BASE_URL = (
  import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'
).replace(/\/+$/, '')

/** Secret API key (or a proxy token). Empty string disables AI. */
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? ''

/** Model to use. Override with VITE_OPENAI_MODEL for higher quality / cost. */
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

/** True when an API key (or proxy token) is present; calls may still fail later. */
export const aiConfigured = API_KEY.trim().length > 0

// ── Minimal JSON-Schema builder ──────────────────────────────────────────────
// Mirrors the small surface the call sites used before (Schema.object / .string /
// .array) but emits plain JSON Schema suitable for OpenAI structured outputs in
// `strict` mode (every object lists all keys in `required` and forbids extras).

type JsonSchema = Record<string, unknown>

export const Schema = {
  string(): JsonSchema {
    return { type: 'string' }
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

/**
 * Build a JSON-structured model bound to `responseSchema`, or null if no API key
 * is configured. The returned `generateContent` throws on any HTTP/parse failure
 * so callers fall back; it never silently returns garbage.
 */
export function getJsonModel(responseSchema: JsonSchema): JsonModel | null {
  if (!aiConfigured) return null

  return {
    async generateContent(prompt: string) {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          // High temperature: we WANT diverse, surprising real-world settings.
          temperature: 1.1,
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
