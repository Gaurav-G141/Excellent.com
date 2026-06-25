/**
 * Firebase AI Logic (Gemini Developer API) wiring for the Applications tab.
 *
 * This is used ONLY to generate "mad-lib" narrative flavor for word problems —
 * never the math. Every caller must degrade gracefully when AI is unavailable
 * (missing config, Terms of Service not accepted, offline, blocked by App
 * Check, etc.), so the app keeps working off the built-in static themes.
 */
import { getApp } from 'firebase/app'
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
  type GenerativeModel,
} from 'firebase/ai'
import { firebaseConfigError } from './firebase'

/** Lightweight, fast model — we only ask for short JSON theme lists. */
const MODEL = 'gemini-2.5-flash-lite'

/** True only when Firebase itself is configured; AI may still fail at runtime. */
export const aiConfigured = !firebaseConfigError

/**
 * Build a JSON-structured generative model bound to `responseSchema`, or null if
 * AI can't be initialized. Never throws.
 */
export function getJsonModel(
  responseSchema: ReturnType<typeof Schema.object>,
): GenerativeModel | null {
  if (!aiConfigured) return null
  try {
    const ai = getAI(getApp(), { backend: new GoogleAIBackend() })
    return getGenerativeModel(ai, {
      model: MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
        // High temperature: we WANT diverse, surprising real-world settings.
        temperature: 1.15,
        topP: 0.95,
      },
    })
  } catch {
    return null
  }
}

export { Schema }
