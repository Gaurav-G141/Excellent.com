/**
 * Builds a wrong-answer message from an optional template, substituting
 * `{token}` placeholders. Falls back to a generic message when the template is
 * missing or blank, so slides never throw on `undefined.replace(...)`.
 *
 * Uses split/join (not RegExp) so replacement values containing regex-special
 * characters are inserted literally.
 */
export function formatFeedback(
  template: string | undefined | null,
  replacements: Record<string, string> = {},
  fallback = 'Not quite. Check your work and try again.',
): string {
  let message = template && template.trim() ? template : fallback
  for (const [token, value] of Object.entries(replacements)) {
    message = message.split(`{${token}}`).join(value)
  }
  return message
}
