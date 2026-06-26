/**
 * Plain-TS mirror of the constraints enforced by firestore.rules.
 *
 * Firestore security rules can only be exercised with the emulator, so these
 * functions capture the same field/type/range contract in a unit-testable form
 * AND act as client-side defense-in-depth before writes. If you change a bound
 * here, update firestore.rules to match (and vice versa).
 */

const USER_FIELDS = [
  'displayName',
  'email',
  'createdAt',
  'streakCount',
  'lastActiveDate',
  'longestStreak',
  'applicationsRating',
  'applicationsGames',
] as const

const PROGRESS_FIELDS = ['currentSlideIndex', 'lessonCompleted', 'updatedAt'] as const

const STICKER_FIELDS = [
  'subject',
  'src',
  'provider',
  'slotIndex',
  'createdAt',
  'expiresAt',
] as const

const STICKER_PROVIDERS = ['openai', 'pollinations'] as const

function hasOnlyKeys(data: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(data).every((key) => allowed.includes(key))
}

function isBoundedInt(value: unknown, lo: number, hi: number): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= lo && value <= hi
}

function isBoundedNumber(value: unknown, lo: number, hi: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= lo && value <= hi
}

/**
 * Validates a (possibly partial / merged) user profile document. `createdAt`
 * and `updatedAt`-style sentinels are not checked for type here because they
 * are server values; pass them through.
 */
export function isValidUserPatch(data: Record<string, unknown>): boolean {
  if (!hasOnlyKeys(data, USER_FIELDS)) return false

  if ('displayName' in data) {
    const name = data.displayName
    if (typeof name !== 'string' || name.length < 1 || name.length > 100) return false
  }
  if ('email' in data && typeof data.email !== 'string') return false
  if ('streakCount' in data && !isBoundedInt(data.streakCount, 0, 100000)) return false
  if ('longestStreak' in data && !isBoundedInt(data.longestStreak, 0, 100000)) return false
  if ('applicationsRating' in data && !isBoundedNumber(data.applicationsRating, 1, 15)) return false
  if ('applicationsGames' in data && !isBoundedInt(data.applicationsGames, 0, 100000)) return false
  if ('lastActiveDate' in data) {
    const date = data.lastActiveDate
    if (typeof date !== 'string' || date.length > 10) return false
  }
  return true
}

/**
 * Validates a lesson-progress document. `updatedAt` is allowed (server
 * timestamp) but not type-checked here.
 */
export function isValidProgressDoc(data: Record<string, unknown>): boolean {
  if (!hasOnlyKeys(data, PROGRESS_FIELDS)) return false
  if (!isBoundedInt(data.currentSlideIndex, 0, 1000)) return false
  if (typeof data.lessonCompleted !== 'boolean') return false
  return true
}

/**
 * Validates a motivation-sticker item document. Mirrors `validSticker` in
 * firestore.rules: exact keys, string bounds, provider enum, slot range, and
 * non-negative integer epoch-ms timestamps.
 */
export function isValidStickerItem(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>

  if (!hasOnlyKeys(d, STICKER_FIELDS)) return false
  if (typeof d.subject !== 'string' || d.subject.length < 1 || d.subject.length > 200) return false
  if (typeof d.src !== 'string' || d.src.length < 1 || d.src.length > 2000) return false
  if (typeof d.provider !== 'string' || !STICKER_PROVIDERS.includes(d.provider as (typeof STICKER_PROVIDERS)[number])) {
    return false
  }
  if (!isBoundedInt(d.slotIndex, 0, 7)) return false
  if (!isBoundedInt(d.createdAt, 0, Number.MAX_SAFE_INTEGER)) return false
  if (!isBoundedInt(d.expiresAt, 0, Number.MAX_SAFE_INTEGER)) return false
  return true
}
