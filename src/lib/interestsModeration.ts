/**
 * Safety screening for learner-entered interests.
 *
 * Interests only ever become the harmless *theme* of an Applications word
 * problem, but we still don't want a student steering problems toward drugs,
 * sex, real-world violence, crime, etc. This module gates every interest the
 * learner tries to add.
 *
 * Two layers, deliberately tuned to AVOID FALSE POSITIVES (legitimate hobbies,
 * sports, fiction/entertainment genres, history, and academics must pass):
 *   1. A tiny local blocklist of UNAMBIGUOUS terms — instant, works offline, and
 *      catches the most blatant attempts with no network round-trip.
 *   2. An OpenAI classifier (temperature 0) that understands context, so
 *      "true-crime podcasts" or "WWII history" pass while "how to cook meth" or
 *      "selling cocaine" are blocked.
 *
 * Policy when the classifier can't be reached:
 *   - AI not configured at all  → local blocklist is the only gate (allow else).
 *   - AI configured but errors  → fail CLOSED with a retryable 'error' status, so
 *     nothing slips through on a transient blip; the learner can simply retry.
 */

import { getJsonModel, Schema } from './ai'

export type ModerationResult =
  | { status: 'ok' }
  | { status: 'blocked'; reason: string }
  | { status: 'error' }

/** Friendly, non-echoing message shown when an interest is rejected. */
export const BLOCKED_MESSAGE =
  'That interest isn’t something we can build school problems around. Try a hobby, sport, game, or topic you enjoy.'

/** Shown when the safety check itself fails (network/billing/etc.). */
export const ERROR_MESSAGE =
  'We couldn’t check that interest just now. Please try again in a moment.'

/**
 * Unambiguous terms with essentially no benign meaning as a stated "interest".
 * Kept intentionally SMALL and uncontroversial — nuanced/contextual cases
 * (e.g. "boxing", "true crime", "war history", "Call of Duty") are left to the
 * AI classifier so we don't reject legitimate hobbies. Matched whole-word,
 * case-insensitively, against the normalized (lower-cased, single-spaced) text.
 */
export const LOCAL_BLOCKLIST: readonly string[] = [
  // Illegal / hard drugs and drug use
  'cocaine',
  'heroin',
  'meth',
  'methamphetamine',
  'crystal meth',
  'crack cocaine',
  'fentanyl',
  'lsd',
  'mdma',
  'ecstasy pills',
  'getting high',
  'shooting up',
  'snorting coke',
  // Explicit sexual / adult content
  'porn',
  'pornography',
  'pornhub',
  'hentai',
  'blowjob',
  'handjob',
  'masturbation',
  'bestiality',
  'child porn',
  'cp',
  // Explicit real-world violence / how-to harm
  'school shooting',
  'mass shooting',
  'how to kill',
  'how to murder',
  'make a bomb',
  'build a bomb',
  'making a bomb',
  'child abuse',
  'genocide',
]

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase()
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * True if the normalized text contains any blocklisted term as a whole word /
 * phrase. Word boundaries prevent the "Scunthorpe problem" (e.g. "grasshopper"
 * or "assassin's creed" never trip a substring like "ass"/"cocaine").
 */
export function matchesLocalBlocklist(text: string): boolean {
  const normalized = normalize(text)
  if (normalized.length === 0) return false
  return LOCAL_BLOCKLIST.some((term) => {
    const re = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(term)}(?:$|[^a-z0-9])`, 'i')
    return re.test(normalized)
  })
}

const MODERATION_SCHEMA = Schema.object({
  properties: {
    appropriate: Schema.boolean(),
    category: Schema.string(),
  },
})

/** Bound the classifier call so a stuck request can't hang the Add button. */
const MODERATION_TIMEOUT_MS = 8000

function buildModerationPrompt(interest: string): string {
  return [
    'You are a strict but fair content-safety classifier for a SCHOOL math web app used by students of all ages.',
    'A student typed an "interest" (a hobby or topic they like). We use it ONLY as the harmless real-world setting/theme of a math word problem; we never depict the activity itself in any detail.',
    'Decide whether this interest is APPROPRIATE to use as such a theme.',
    '',
    'Mark it INAPPROPRIATE only when the interest is mainly about one of these: illegal drugs or getting intoxicated; sexual or adult content; really hurting or killing people or graphic gore; making or using weapons to harm people; committing crimes or other illegal activity; gambling or betting real money as the main point; hatred or discrimination against a group of people; terrorism or violent extremism; or self-harm and suicide.',
    '',
    'Otherwise mark it APPROPRIATE. Crucially, MANY interests sound edgy but are completely normal and must be APPROPRIATE, including:',
    '- Sports, even combat sports: boxing, MMA, karate, judo, fencing, wrestling, archery, paintball, airsoft.',
    '- Fiction & entertainment genres: mystery and crime novels, thrillers, true-crime podcasts, horror movies, action films, and video games of any kind including shooters (e.g. Call of Duty, Fortnite, Counter-Strike).',
    '- Tabletop, card, and party games played socially for fun (e.g. poker night with friends, blackjack as a card game, Uno, chess, Dungeons & Dragons) — these are games, not betting real money.',
    '- History & academics: World War II, the Cold War, ancient battles, the military, forensics, criminology, law, chemistry, biology, anatomy.',
    '- Outdoors & everyday topics: hunting, fishing, archery, cars, cooking and kitchen knives, martial arts, fighter jets, tanks.',
    '- Any ordinary wholesome interest: basketball, baking, space, anime, music, art, animals, coding, chess, gardening, fashion, and so on.',
    '',
    'Rule of thumb: a legitimate sport, game, fictional or entertainment genre, historical, military, or academic topic is APPROPRIATE even when its subject matter involves conflict, weapons, or crime. Only block when the interest is genuinely an endorsement of, or a how-to for, the harmful activity itself (e.g. "selling cocaine", "how to make a bomb", "watching porn"). When in doubt, choose APPROPRIATE.',
    '',
    `INTEREST: ${JSON.stringify(interest)}`,
    '',
    'Respond with JSON only: {"appropriate": boolean, "category": one of "none","drugs","sexual","violence","weapons","crime","gambling","hate","extremism","self_harm","other"}.',
  ].join('\n')
}

/**
 * Screen one interest. Resolves to:
 *   - { status: 'ok' }                 safe to add
 *   - { status: 'blocked', reason }    rejected (local match or AI verdict)
 *   - { status: 'error' }              couldn't verify; caller should retry
 *
 * Never throws.
 */
export async function moderateInterest(interest: string): Promise<ModerationResult> {
  const text = interest.trim().replace(/\s+/g, ' ')
  if (text.length === 0) return { status: 'ok' }

  // Layer 1: instant, offline, unambiguous.
  if (matchesLocalBlocklist(text)) return { status: 'blocked', reason: BLOCKED_MESSAGE }

  // Layer 2: contextual AI classifier. If no AI is configured at all, the local
  // list is our only gate and we allow everything it didn't catch.
  const model = getJsonModel(MODERATION_SCHEMA, { temperature: 0 })
  if (!model) return { status: 'ok' }

  try {
    let timer: ReturnType<typeof setTimeout> | undefined
    const result = await Promise.race([
      model.generateContent(buildModerationPrompt(text)),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), MODERATION_TIMEOUT_MS)
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer)
    })

    // Timeout (or any falsy response): can't verify → retryable error.
    if (!result) return { status: 'error' }

    const raw = result.response.text()
    if (typeof raw !== 'string' || raw.trim().length === 0) return { status: 'error' }

    const parsed = JSON.parse(raw) as { appropriate?: unknown }
    if (typeof parsed.appropriate !== 'boolean') return { status: 'error' }

    return parsed.appropriate ? { status: 'ok' } : { status: 'blocked', reason: BLOCKED_MESSAGE }
  } catch {
    // Malformed JSON, network/billing failure, etc.: fail closed (retryable).
    return { status: 'error' }
  }
}
