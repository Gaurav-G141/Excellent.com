/**
 * AI-powered mad-lib prefetch. Asks Gemini (via Firebase AI Logic) for extra
 * narrative themes for each registered topic, validates them, and merges the
 * survivors into the theme pool. Everything here is best-effort: any failure
 * (no config, ToS not accepted, offline, schema mismatch) is swallowed and the
 * app simply keeps using its built-in static themes.
 */
import { getJsonModel, Schema } from '../../lib/ai'
import { allMadlibSpecs, type MadlibSpec } from './madlib'
import { addAiThemes } from './themeStore'

// Import lesson modules for their import-time registration side effects, so the
// spec registry and theme pools are populated regardless of who calls us first.
import './lesson1'
import './lesson2'
import './lesson3'

let started = false

/**
 * Kick off one round of theme generation for every registered topic. Safe to
 * call multiple times — it only runs once per page load. Resolves when done
 * (or immediately if AI isn't available).
 */
export async function prefetchThemes(): Promise<void> {
  if (started) return
  started = true
  const specs = allMadlibSpecs()
  if (specs.length === 0) return
  await Promise.allSettled(specs.map(generateForSpec))
}

async function generateForSpec(spec: MadlibSpec<unknown>): Promise<void> {
  const itemSchema = Schema.object({
    properties: Object.fromEntries(
      spec.slots.map((slot) => [slot.name, Schema.string()]),
    ),
  })
  const schema = Schema.object({
    properties: { themes: Schema.array({ items: itemSchema }) },
  })

  const model = getJsonModel(schema)
  if (!model) return

  try {
    const result = await model.generateContent(buildPrompt(spec))
    const text = result.response.text()
    const parsed = JSON.parse(text) as { themes?: unknown }
    const raw = Array.isArray(parsed.themes) ? parsed.themes : []

    const valid: unknown[] = []
    for (const entry of raw) {
      if (entry && typeof entry === 'object') {
        const theme = spec.validate(entry as Record<string, string>)
        if (theme !== null) valid.push(theme)
      }
    }
    if (valid.length > 0) addAiThemes(spec.topicId, valid)
  } catch {
    // Best-effort: ignore and keep static themes.
  }
}

function buildPrompt(spec: MadlibSpec<unknown>): string {
  const slotLines = spec.slots
    .map((s) => `- "${s.name}": ${s.description} (e.g. "${s.example}")`)
    .join('\n')

  const examples = JSON.stringify({ themes: spec.examples }, null, 2)

  return [
    'You write short, realistic "mad-lib" cover stories for a math word-problem app.',
    'You are NOT writing any math — only the everyday setting and wording around it.',
    '',
    spec.instruction,
    '',
    `Produce ${spec.count} DISTINCT variations as JSON. Each variation fills these blanks:`,
    slotLines,
    '',
    'Hard rules:',
    '- Every value must be plausible and sensible in the real world.',
    '- Keep each value short and concrete.',
    '- Do NOT include any numbers, digits, or math symbols in any value.',
    '- Do NOT mention math/calculus terminology of any kind.',
    '- Make the settings genuinely varied (different domains, not all the same).',
    '',
    'Here are examples of valid outputs to match the shape and tone:',
    examples,
  ].join('\n')
}
