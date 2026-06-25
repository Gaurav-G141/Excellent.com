/**
 * Mad-lib theme system for Applications word problems.
 *
 * The IDEA: the *math* of every problem (numbers, coefficients, fields, the
 * expected answer, grading) is computed in code and never touched by AI. Only
 * the *narrative wrapper* — the setting, the objects, the units phrasing — is a
 * swappable "theme". Themes come from two sources:
 *   1. Built-in static themes shipped in each lesson module (always present —
 *      this is what keeps behavior identical when AI is off).
 *   2. AI-generated themes (Gemini) that fill the same slots for extra variety.
 *
 * This module is FIREBASE-FREE on purpose so generators and their unit tests
 * never pull in the AI SDK. The firebase/ai calls live in `aiThemes.ts`.
 */

/** One blank the AI fills, used to build both the JSON schema and the prompt. */
export interface SlotDef {
  name: string
  /** What this blank means, shown to the model. */
  description: string
  /** A concrete example value, shown to the model. */
  example: string
}

/**
 * Describes how to mad-lib one topic: what blanks to fill, guidance for the
 * model, few-shot examples, and a validator that turns a raw slot object into a
 * strongly-typed theme (or rejects it).
 */
export interface MadlibSpec<T> {
  topicId: string
  /** Plain description of the scenario family (no math) for the model. */
  instruction: string
  slots: SlotDef[]
  /** Few-shot example slot-objects (usually derived from the static themes). */
  examples: Record<string, string>[]
  /** How many fresh themes to request per prefetch. */
  count: number
  /**
   * Validate + convert a raw slot object from the model into a typed theme.
   * Return null to reject (the app then just uses other themes). Must be strict:
   * this is the runtime "is it sensible?" gate.
   */
  validate: (raw: Record<string, string>) => T | null
}

// ── Spec registry ───────────────────────────────────────────────────────────
// Lesson modules register their specs at import time; aiThemes reads them.

const specs: MadlibSpec<unknown>[] = []

export function registerMadlibSpec<T>(spec: MadlibSpec<T>): void {
  specs.push(spec as MadlibSpec<unknown>)
}

export function allMadlibSpecs(): readonly MadlibSpec<unknown>[] {
  return specs
}

// ── Sanitizers (shared validation helpers) ──────────────────────────────────

/** Calculus jargon that must never leak into a learner-facing scenario. */
const BANNED_SUBSTRINGS = [
  'derivative',
  'mean value theorem',
  'intermediate value theorem',
  'second derivative',
  'critical point',
  'secant',
  'tangent',
  'power rule',
  'chain rule',
  'sum rule',
  'related rates',
  'calculus',
  'differentiat',
  'integral',
  'polynomial',
]

/**
 * Normalize and validate a free-text slot value. Returns the cleaned string or
 * null if it's empty, too long, or contains banned jargon.
 */
export function cleanText(value: unknown, maxLen = 90): string | null {
  if (typeof value !== 'string') return null
  const s = value.trim().replace(/\s+/g, ' ')
  if (s.length === 0 || s.length > maxLen) return null
  const lower = s.toLowerCase()
  if (BANNED_SUBSTRINGS.some((b) => lower.includes(b))) return null
  return s
}

/** Like cleanText but also rejects any value containing a digit. */
export function cleanTextNoDigits(value: unknown, maxLen = 90): string | null {
  const s = cleanText(value, maxLen)
  if (s === null) return null
  return /[0-9]/.test(s) ? null : s
}

/** Accept only a single A–Z letter (used for function/variable symbols). */
export function singleLetter(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const s = value.trim()
  return /^[A-Za-z]$/.test(s) ? s : null
}

/** Accept the value only if it is one of `allowed` (case-insensitive). */
export function oneOf(value: unknown, allowed: string[]): string | null {
  if (typeof value !== 'string') return null
  const s = value.trim().toLowerCase()
  const hit = allowed.find((a) => a.toLowerCase() === s)
  return hit ?? null
}
