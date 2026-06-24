/** Trim surrounding whitespace from a user-entered display name. */
export function normalizeDisplayName(name: string): string {
  return name.trim()
}

/**
 * A display name is valid when, after trimming, it is 1–100 characters. This
 * matches the bound enforced by firestore.rules / firestoreValidation.
 */
export function isValidDisplayName(name: string): boolean {
  const trimmed = normalizeDisplayName(name)
  return trimmed.length >= 1 && trimmed.length <= 100
}
